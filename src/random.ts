/**
 * Generates a cryptographically secure random integer between min (inclusive) and max (inclusive)
 */
export const secureRandomInteger = (min: number, max: number): number => {
  const range = max - min + 1
  const maxUint32 = 0xffffffff
  const limit = maxUint32 - (maxUint32 % range)
  let randomValue

  do {
    randomValue = crypto.getRandomValues(new Uint32Array(1))[0]
  } while (randomValue >= limit)

  return min + (randomValue % range)
}

export const getRandomArrayItem = <T = unknown>(arr: Array<T>): T => {
  if (!arr.length) {
    throw new Error('Empty array')
  }

  return arr[secureRandomInteger(0, arr.length - 1)]
}

export const getRandomArrayItems = <T = unknown>(arr: Array<T>, count: number): Array<T> => {
  if (count > arr.length) {
    throw new Error('Requested more elements than are present in the array')
  }
  if (!count) {
    throw new Error('Count should be more than 0')
  }

  const result: Array<T> = []
  const usedIndices = new Set<number>()

  while (result.length < count) {
    const index = secureRandomInteger(0, arr.length - 1)
    if (!usedIndices.has(index)) {
      usedIndices.add(index)
      result.push(arr[index])
    }
  }

  return result
}

/**
 * O(n) Fisher–Yates shuffle (crypto‐secure)
 */
export const shuffleArray = <T>(arr: readonly T[]): T[] => {
  // clone so we don’t mutate the original
  const result = arr.slice()

  for (let i = result.length - 1; i > 0; i--) {
    // pick an index in [0..i]
    const j = secureRandomInteger(0, i)
    // swap
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
