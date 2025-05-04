import { getRandomArrayItem, getRandomArrayItems, secureRandomInteger } from '../dice'

describe('dice utils, functional tests', () => {
  describe('secureRandomInteger', () => {
    it.each([
      [1, 10],
      [0, 3],
      [0, 1],
      [5, 6],
    ])('should return results in [%d..%d]', (min, max) => {
      const res = secureRandomInteger(min, max)

      expect(res).not.toBeGreaterThan(max)
      expect(res).not.toBeLessThan(min)
    })
  })

  describe('getRandomArrayItem', () => {
    it.each([[[1, 2, 3]], [['a', 'b', 'x']]])('should return random array item from %j', (input) => {
      // @ts-ignore
      const res = getRandomArrayItem(input)
      // @ts-ignore
      expect(input.includes(res)).toEqual(true)
    })

    it('throws for empty input', () => {
      expect(() => getRandomArrayItem([])).toThrow()
    })
  })

  describe('getRandomArrayItems', () => {
    it.each([
      [[1, 2, 3], 1],
      [[1, 2, 3], 2],
      [[1, 2, 3], 3],
      [['a', 'b', 'x'], 1],
      [['a', 'b', 'x'], 2],
      [['a', 'b', 'x'], 3],
      [['a'], 1],
    ])('should return N random items from array %j (%d)', (arr, n) => {
      // @ts-ignore
      const res = getRandomArrayItems(arr, n)
      expect(res.length).toEqual(n)

      for (const item of res) {
        // @ts-ignore
        expect(arr.includes(item)).toEqual(true)
      }
    })

    it('throws for invalid input', () => {
      expect(() => getRandomArrayItems([1, 2], 3)).toThrow()
      expect(() => getRandomArrayItems([], 1)).toThrow()
      expect(() => getRandomArrayItems([1, 2], 0)).toThrow()
    })
  })
})
