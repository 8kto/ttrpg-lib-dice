import { shuffleArray } from '../random'
import * as randomModule from '../random'

describe('random utils', () => {
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
        .spyOn(randomModule, 'secureRandomInteger')
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
})
