import { Dice } from './domain/Dice'
import { secureRandomInteger } from './random'

export type DiceRoll = {
  formula: string
  total: number
  rolls: number[]
}

export type DiceRollResults = {
  formula: string
  total: number
  rolls: DiceRoll[]
}

export const roll = (dice = Dice.d100): number => secureRandomInteger(1, dice)

const isInteger = (formula: string): boolean => /^[+-]?\d+$/.test(formula.trim())

const getTokens = (formula: string): string[] =>
  formula.match(/[+-]?\s*(?:\d*\s*d\s*\d+|\d+)/g)?.map((t) => t.replace(/\s+/g, '')) ?? []

export const isValidDiceFormula = (formula: string): boolean => {
  const diceRollPattern = /^(([1-9]\d*)?d[1-9]\d*|\d+)(\s*[-+]\s*((([1-9]\d*)?d[1-9]\d*)|\d+))*\s*$/
  return diceRollPattern.test(formula.trim())
}

export const rollDiceFormulaDetailed = (formula: string): DiceRollResults => {
  if (!isValidDiceFormula(formula)) {
    throw new Error('Invalid dice formula, allowed characters are +-, numbers and dices (d6 etc.)')
  }

  const DICE_RE = /^\s*([+-])?([1-9]\d*)?d([1-9]\d*)\s*$/
  const MAX_DICE = 10_000

  const res: DiceRollResults = {
    formula,
    rolls: [],
    total: 0,
  }

  const tokens = getTokens(formula)

  for (let ti = 0; ti < tokens.length; ti++) {
    const token = tokens[ti]
    const rolls: number[] = []
    let total = 0

    if (isInteger(token)) {
      const n = parseInt(token, 10)
      total = n
      rolls.push(n)
    } else {
      const m = token.match(DICE_RE)
      if (!m) {
        throw new Error(`Invalid dice formula: ${token} (${formula})`)
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

      for (let r = 0; r < numDice; r++) {
        const v = roll(numSides)
        rolls.push(sign * v)
        total += sign * v
      }
    }

    if (!Number.isInteger(total)) {
      console.error({ tokens, token, total })
      throw new Error('Logic error, cannot parse token')
    }

    const record: DiceRoll = { formula: token, total, rolls }
    res.rolls.push(record)
    res.total += total
  }

  return res
}

export const rollDiceFormula = (formula: string): number => {
  return rollDiceFormulaDetailed(formula).total
}
