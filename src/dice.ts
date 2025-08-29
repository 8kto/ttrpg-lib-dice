import { Dice } from './domain/Dice'
import { secureRandomInteger } from './random'

/** @deprecated */
type DiceOperationFn = (a: number, b: number) => number

/** @deprecated */
type Operator = '+' | '-'

/** @deprecated */
const Operations: Record<Operator, DiceOperationFn> = {
  '+': (a: number, b: number): number => a + b,
  '-': (a: number, b: number): number => a - b,
}

const operationRegExp = /([-+])/

export const roll = (dice = Dice.d100): number => secureRandomInteger(1, dice)

const isDiceRoll = (formula: string): boolean => /^\d*d\d+$/.test(formula.trim())

const isInteger = (formula: string): boolean => /^[+-]?\d+$/.test(formula.trim())

const rollNumberOfDice = (formula: string): number => {
  const [numDice, numSides] = formula.split('d').map(Number)

  if (isNaN(numDice) || isNaN(numSides)) {
    throw new Error('Invalid dice formula')
  }

  let total = 0
  let i = 0
  do {
    total += roll(numSides)
  } while (++i < numDice)

  return total
}

const getTokens__OLD = (formula: string): string[] => formula.split(operationRegExp)

const resolveToken__OLD = (token: string): number | DiceOperationFn => {
  if (isDiceRoll(token)) {
    return rollNumberOfDice(token)
  }
  if (isInteger(token)) {
    return parseInt(token, 10)
  }
  if (token in Operations) {
    return Operations[token as Operator]
  }

  throw new Error(`Invalid token: ${token}`)
}

const getTokens = (formula: string): string[] =>
  formula.match(/[+-]?\s*(?:\d*\s*d\s*\d+|\d+)/g)?.map((t) => t.replace(/\s+/g, '')) ?? []

export const isValidDiceFormula = (formula: string): boolean => {
  const diceRollPattern = /^(([1-9]\d*)?d[1-9]\d*|\d+)(\s*[-+]\s*((([1-9]\d*)?d[1-9]\d*)|\d+))*\s*$/
  return diceRollPattern.test(formula.trim())
}

export const rollDiceFormula = (formula: string): number => {
  if (!isValidDiceFormula(formula)) {
    throw new Error(`Invalid dice formula, allowed characters are +-, numbers and dices (d6 etc.): ${formula}`)
  }

  const tokens = getTokens__OLD(formula).map(resolveToken__OLD)

  let total = tokens[0] as number

  for (let i = 1; i < tokens.length; i += 2) {
    const operation = tokens[i] as DiceOperationFn
    const value = tokens[i + 1] as number

    if (!Number.isInteger(value) || !Number.isInteger(total) || typeof operation !== 'function') {
      console.error({ operation, tokens, total, value })
      throw new Error('Logic error, cannot parse tokens')
    }

    total = operation(total, value)
  }

  return total
}

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
