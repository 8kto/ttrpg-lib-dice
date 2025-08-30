import { Dice } from './domain/Dice'
import { secureRandomInteger } from './random'

export type DiceRoll = {
  /** The original token, e.g. "3d6", "+2", "-d8" */
  formula: string
  /** Sum contributed by this token (includes sign if any) */
  total: number
  /** Per-roll results; for dice, values are signed to reflect contribution */
  rolls: number[]
}

export type DiceRollResults = {
  /** The original input string (unmodified) */
  formula: string
  /** Grand total */
  total: number
  /** Breakdown per token in left-to-right order */
  rolls: DiceRoll[]
}

const MAX_DICE = 10_000
const MAX_SIDES = 1_000

/** ------- Patterns  ------- */

// One dice token: optional sign, optional count>=1, 'd', sides>=1 (lowercase d only)
const DICE_TOKEN_RE = /^\s*([+-])?([1-9]\d*)?d([1-9]\d*)\s*$/

// Tokenizer: consume optional sign, then either integer or dice (no inner spaces)
const TOKEN_RE = /[+-]?\s*(?:(?:[1-9]\d*)?d[1-9]\d*|\d+)/g

// Full-formula validator: term ((+|-) term)* with outer-space tolerance
const FORMULA_RE = /^((?:[1-9]\d*)?d[1-9]\d*|\d+)(\s*[-+]\s*((?:[1-9]\d*)?d[1-9]\d*|\d+))*\s*$/

/** ------- Helpers ------- */

export const roll = (dice = Dice.d100): number => secureRandomInteger(1, dice)

const isInteger = (str: string): boolean => /^[+-]?\d+$/.test(str.trim())

const getTokens = (formula: string): string[] => formula.match(TOKEN_RE)?.map((t) => t.replace(/\s+/g, '')) ?? []

export const isValidDiceFormula = (formula: string): boolean => FORMULA_RE.test(formula.trim())

/** ------- Engine ------- */

export const rollDiceFormulaDetailed = (formula: string): DiceRollResults => {
  if (!isValidDiceFormula(formula)) {
    throw new Error('Invalid dice formula, allowed characters are +-, numbers and dices (d6 etc.)')
  }

  const res: DiceRollResults = { formula, rolls: [], total: 0 }
  const tokens = getTokens(formula)

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    const rolls: number[] = []
    let total = 0

    if (isInteger(token)) {
      const n = parseInt(token, 10)
      if (!Number.isSafeInteger(n)) {
        throw new Error(`Integer out of range: ${token}`)
      }
      total = n
      rolls.push(n)
    } else {
      const m = token.match(DICE_TOKEN_RE)
      if (!m) {
        throw new Error(`Invalid dice token: ${token} (in ${formula})`)
      }

      const [, signSym, countStr, sidesStr] = m
      const numDice = countStr ? parseInt(countStr, 10) : 1
      const numSides = parseInt(sidesStr, 10)
      const sign = signSym === '-' ? -1 : 1

      if (!Number.isInteger(numDice) || numDice < 1) {
        throw new Error(`Invalid dice count in token: ${token}`)
      }
      if (!Number.isInteger(numSides) || numSides < 1) {
        throw new Error(`Invalid sides in token: ${token}`)
      }
      if (numDice > MAX_DICE) {
        throw new Error(`Dice count too large (${numDice}): ${token}`)
      }
      if (numSides > MAX_SIDES) {
        throw new Error(`Sides too large (${numSides}): ${token}`)
      }

      for (let r = 0; r < numDice; r++) {
        const v = roll(numSides)
        // We assume roll returns 1..numSides and is a safe integer
        if (!Number.isSafeInteger(v) || v < 1 || v > numSides) {
          throw new Error(`Roll produced invalid value ${v} for d${numSides}`)
        }

        const contrib = sign * v
        rolls.push(contrib)
        total += contrib
      }
    }

    if (!Number.isSafeInteger(total)) {
      console.error({ tokens, token, total })
      throw new Error('Logic error: non-integer subtotal')
    }

    const record: DiceRoll = { formula: token, total, rolls }
    res.rolls.push(record)
    res.total += total
  }

  if (!Number.isSafeInteger(res.total)) {
    throw new Error('Logic error: non-integer grand total')
  }

  return res
}

export const rollDiceFormula = (formula: string): number => {
  return rollDiceFormulaDetailed(formula).total
}
