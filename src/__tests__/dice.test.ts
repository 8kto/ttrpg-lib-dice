import { DiceRollResults, isValidDiceFormula, rollDiceFormula, rollDiceFormulaDetailed, shuffleArray } from '../dice'
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

  describe('rollDiceFormulaDetailed', () => {
    beforeEach(() => {
      let counter = 1
      jest.spyOn(diceModule, 'roll').mockImplementation(() => {
        return counter++
      })
    })

    it.each<[string, DiceRollResults]>([
      [
        '3d6',
        {
          formula: '3d6',
          rolls: [{ formula: '3d6', rolls: [1, 2, 3], total: 6 }],
          total: 6,
        },
      ],
      [
        '12d20',
        {
          formula: '12d20',
          rolls: [{ formula: '12d20', rolls: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], total: 78 }],
          total: 78,
        },
      ],
      [
        '3d6 + 2',
        {
          formula: '3d6 + 2',
          rolls: [
            { formula: '3d6', rolls: [1, 2, 3], total: 6 },
            { formula: '+2', rolls: [2], total: 2 },
          ],
          total: 8,
        },
      ],
      [
        'd6 + 3',
        {
          formula: 'd6 + 3',
          rolls: [
            { formula: 'd6', rolls: [1], total: 1 },
            { formula: '+3', rolls: [3], total: 3 },
          ],
          total: 4,
        },
      ],
      [
        'd6 + d6',
        {
          formula: 'd6 + d6',
          rolls: [
            { formula: 'd6', rolls: [1], total: 1 },
            { formula: '+d6', rolls: [2], total: 2 },
          ],
          total: 3,
        },
      ],
      [
        '6 + 1',
        {
          formula: '6 + 1',
          rolls: [
            { formula: '6', rolls: [6], total: 6 },
            { formula: '+1', rolls: [1], total: 1 },
          ],
          total: 7,
        },
      ],
      [
        'd12',
        {
          formula: 'd12',
          rolls: [{ formula: 'd12', rolls: [1], total: 1 }],
          total: 1,
        },
      ],
      [
        '3d8 - 2',
        {
          formula: '3d8 - 2',
          rolls: [
            { formula: '3d8', rolls: [1, 2, 3], total: 6 },
            { formula: '-2', rolls: [-2], total: -2 },
          ],
          total: 4,
        },
      ],
      [
        'd6 - d6',
        {
          formula: 'd6 - d6',
          rolls: [
            { formula: 'd6', rolls: [1], total: 1 },
            { formula: '-d6', rolls: [-2], total: -2 },
          ],
          total: -1,
        },
      ],
      [
        'd6 - 1',
        {
          formula: 'd6 - 1',
          rolls: [
            { formula: 'd6', rolls: [1], total: 1 },
            { formula: '-1', rolls: [-1], total: -1 },
          ],
          total: 0,
        },
      ],
      [
        '10 + d20',
        {
          formula: '10 + d20',
          rolls: [
            { formula: '10', rolls: [10], total: 10 },
            { formula: '+d20', rolls: [1], total: 1 },
          ],
          total: 11,
        },
      ],
      [
        '5d10 - d6',
        {
          formula: '5d10 - d6',
          rolls: [
            { formula: '5d10', rolls: [1, 2, 3, 4, 5], total: 15 },
            { formula: '-d6', rolls: [-6], total: -6 },
          ],
          total: 9,
        },
      ],
      [
        '100 + 200 - 300',
        {
          formula: '100 + 200 - 300',
          rolls: [
            { formula: '100', rolls: [100], total: 100 },
            { formula: '+200', rolls: [200], total: 200 },
            { formula: '-300', rolls: [-300], total: -300 },
          ],
          total: 0,
        },
      ],
    ])('should support multiple dice rolls %s', (input, expected) => {
      const result = rollDiceFormulaDetailed(input)
      expect(result).toStrictEqual(expected)
    })

    describe('invalid formulas (as per current parser & tightened validator)', () => {
      test.each<string>([
        '', // empty
        '   ', // whitespace only
        '3d6+', // dangling operator
        '3d6 -', // dangling operator
        '3 d 6', // spaces inside a token
        '3d 6',
        '3 d6',
        'd', // missing sides
        '3dd6', // double d
        '3d', // missing sides
        'd0', // sides must be >= 1
        '3d0',
        '0d6', // **forbidden by parser**; ensure validator forbids too
        '3.5d6', // decimals not allowed
        '3d6 * 2', // unsupported operator
        '3d6 / 2',
        '3D6', // uppercase D not supported
        'd6 + -2', // term cannot have a second sign after an operator
      ])('rejects %s', (s) => {
        expect(isValidDiceFormula(s)).toBe(false)
        expect(() => rollDiceFormulaDetailed(s)).toThrow()
      })

      test('exceeds MAX_DICE', () => {
        const s = '10001d6' // exceeds 10_000
        expect(isValidDiceFormula(s)).toBe(true) // syntactically fine
        expect(() => rollDiceFormulaDetailed(s)).toThrow(/Dice count too large/i)
      })
    })

    describe('whitespace robustness', () => {
      test.each<string>(['   3d6+2-1   ', '\t3d6\t+\t2\t-\t1\t', '\n3d6 + 2 - 1\n'])('trims and computes %s', (s) => {
        const res = rollDiceFormulaDetailed(s)
        expect(res.total).toBe(7) // with mocked rolls 1,2,3 for 3d6 then +2 -1
      })
    })
  })

  describe('shuffleArray', () => {
    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('returns an empty array unchanged', () => {
      expect(shuffleArray([])).toEqual([])
    })

    it('returns a single-element array unchanged', () => {
      expect(shuffleArray([42])).toEqual([42])
    })

    it('returns a permutation of the input array', () => {
      const arr = [1, 2, 3, 4, 5]
      const result = shuffleArray(arr)
      // same elements, possibly reordered
      expect(result).toHaveLength(arr.length)
      expect(result.sort()).toEqual(arr.sort())
    })

    it('uses Fisher–Yates with secureRandomInteger', () => {
      const arr = ['a', 'b', 'c']
      // spy on secureRandomInteger
      const rngSpy = jest
        .spyOn(diceModule, 'secureRandomInteger')
        // First call for i=2 returns 1 → swap indices 2<->1
        .mockImplementationOnce(() => 1)
        // Second call for i=1 returns 0 → swap indices 1<->0
        .mockImplementationOnce(() => 0)

      const result = shuffleArray(arr)
      // initial: [a,b,c]
      // i=2, j=1 → [a,c,b]
      // i=1, j=0 → [c,a,b]
      expect(result).toEqual(['c', 'a', 'b'])

      // verify calls
      expect(rngSpy).toHaveBeenNthCalledWith(1, 0, 2)
      expect(rngSpy).toHaveBeenNthCalledWith(2, 0, 1)
    })
  })

  describe('isValidDiceFormula', () => {
    describe('valid formulas', () => {
      test.each([
        // single integers
        ['1'],
        ['0'],
        ['42'],
        ['  42  '], // trims outer whitespace

        // single dice terms (lowercase "d")
        ['d6'], // implicit 1 count
        ['3d6'],
        ['10d20'],
        ['  d12  '], // trims outer whitespace

        // mixtures with +/-, arbitrary inner spaces
        ['3d6+2-1'],
        ['3d6 + 2 - 1'],
        ['3d6   +   2   -   1'],
        ['2d8+d6+10'],
        ['4d10-3d6+7'],
        ['10 + d20'],
        ['d12 - 10 + d6'],
        ['100 + 200 - 300'],

        // newlines/tabs inside are still \s and therefore allowed
        ['3d6\t+\t2\t-\t1'],
        ['3d6 +\n 2 -\n 1'],
      ])('valid: %s', (s) => {
        expect(isValidDiceFormula(s)).toBe(true)
      })
    })

    describe('invalid formulas', () => {
      test.each([
        // empty / whitespace-only
        [''],
        ['   '],

        // leading sign not allowed by current pattern
        ['+2'],
        ['-1'],
        ['-d6+1'],

        // dangling operator
        ['3d6+'],
        ['3d6-'],
        ['3d6 - '],

        // embedded spaces inside a single dice token are not allowed
        ['3 d 6'],
        ['3d 6'],
        ['3 d6'],

        // malformed dice tokens
        ['d'], // missing sides
        ['3dd6'], // double d
        ['3d'], // missing sides
        ['d+6'], // operator inside token
        ['3d-6'], // negative sides inside token
        ['d-6'],

        // unsupported numeric formats/operators
        ['3.5d6'],
        ['3d6 * 2'],
        ['3d6 / 2'],

        // uppercase D not supported by current regex
        ['3D6'],

        // double-sign after an operator (pattern does not permit a signed term)
        ['3d6+-1'],
        ['3d6--1'],
        ['1+-2'],
      ])('invalid: %s', (s) => {
        expect(isValidDiceFormula(s)).toBe(false)
      })
    })

    describe('whitespace robustness', () => {
      test.each([['   3d6+2-1   '], ['\t3d6\t+\t2\t-\t1\t'], ['\n3d6 + 2 - 1\n']])(
        'still valid after trimming/\\s handling: %s',
        (s) => {
          expect(isValidDiceFormula(s)).toBe(true)
        },
      )
    })
  })
})
