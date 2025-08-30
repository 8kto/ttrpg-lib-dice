# ttrpg-lib-dice

[![Tests](https://github.com/8kto/ttrpg-lib-dice/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/8kto/ttrpg-lib-dice/actions/workflows/test.yml)

A small library for rolling dice in tabletop games.

## Installation

```bash
npm install ttrpg-lib-dice
# or
yarn add ttrpg-lib-dice
```

## Usage

```ts
import {
  Dice,
  roll,
  rollDiceFormula,
  rollDiceFormulaDetailed,
  secureRandomInteger,
  getRandomArrayItem,
  getRandomArrayItems,
  shuffleArray,
} from 'dice-roller'

// Roll a single D20
const single = roll(Dice.d20)

// Roll using a formula (returns a number)
const total = rollDiceFormula('2d6+3') // e.g., 12

// Roll using a formula (detailed breakdown with each roll's values)
const detailed = rollDiceFormulaDetailed('2d6+3')
/*
Example output:
{
  formula: '2d6+3',
  total: 12,
  rolls: [
    { formula: '2d6', rolls: [5, 4], total: 9 },
    { formula: '+3',  rolls: [3],    total: 3 }
  ]
}
*/

// Get a secure random integer between 1 and 100
const randInt = secureRandomInteger(1, 100)

// Pick one random element
const one = getRandomArrayItem([1, 2, 3])

// Pick three unique elements
const three = getRandomArrayItems(['a', 'b', 'c', 'd'], 3)
```

## License

Licensed under the MIT License. See [LICENSE](LICENSE) for details.
