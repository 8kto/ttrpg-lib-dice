import { rollDiceFormula, rollDiceFormulaDetailed } from '../dice'
import * as diceModule from '../dice'

describe('rollDiceFormula', () => {
  // Mock the roll function
  beforeEach(() => {
    // @ts-ignore
    jest.spyOn(diceModule, 'roll').mockImplementation((_: number) => {
      // Mock implementation: always return 3 for simplicity
      return 3
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should return the correct total for a valid dice formula', () => {
    const result = rollDiceFormula('3d6')
    expect(result).toBe(9) // Since the mock always returns 3, 3 rolls of 3 result in 9
  })

  it.each([
    ['d6', 3],
    ['1d6', 3],
    ['2d6', 6],
    ['3d6', 9],
    ['2d20', 6],
  ])('should handle number of dices for %s', (input, expected) => {
    const result = rollDiceFormula(input)
    expect(result).toBe(expected)
  })

  it('should support simplified format', () => {
    const result = rollDiceFormula('d6')
    expect(result).toBe(3)
  })

  it.each(['invalid', '(d6+10)', 'd6/1', 'd6*2', '2*d6'])(
    'should throw an error for an invalid dice formula %s',
    (input) => {
      expect(() => rollDiceFormula(input)).toThrow(
        'Invalid dice formula, allowed characters are +-, numbers and dices (d6 etc.)',
      )
    },
  )

  it('should return the correct total for another valid dice formula', () => {
    const result = rollDiceFormula('5d4')
    expect(result).toBe(15)
  })

  it.each([
    ['d6+1', 4],
    ['d6 + 1', 4],
    ['d6 +1', 4],
    ['d6-1', 2],
    ['d6 - 1', 2],
    ['d6 -1', 2],
    // ['0d6', 0], // FIXME
  ])('should support simple formulas %s', (input, expected) => {
    const result = rollDiceFormula(input)
    expect(result).toBe(expected)
  })

  it.each([
    ['2d6+1', 7],
    ['3d6 + 1', 10],
    ['4d6 +1', 13],
    ['2d6-1', 5],
    ['3d6 - 1', 8],
    ['6d6 -1', 17],
  ])('should support simple formulas with nums %s', (input, expected) => {
    const result = rollDiceFormula(input)
    expect(result).toBe(expected)
  })

  it.each([
    ['d6+1+2', 6],
    ['d6+d6', 6],
    ['d6 + d6 + 1', 7],
    ['d6 + d6 + d10 -2', 7],
  ])('should support multiple dice rolls %s', (input, expected) => {
    const result = rollDiceFormula(input)
    expect(result).toBe(expected)
  })

  // TODO implement
  describe.skip('rollDiceFormulaDetailed', () => {
    it.each([
      // ['d6+d6, d6', [['d6+d6', [1, 1]], ['d6', [1]]]],
      // ['d6 + d6 + 1, d10+2', [['d6 + d6 + 1', [1,1,1]], ['d10+2', [1,2]]]],
      [
        '5d20, 5d6',
        [
          ['5d20', 5, [1, 1, 1, 1, 1]],
          ['5d6', 5, [1, 1, 1, 1, 1]],
        ],
      ],
    ])('should support multiple dice rolls %s', (input, expected) => {
      const result = rollDiceFormulaDetailed(input)
      expect(result).toBe(expected)
    })
  })
})
