# ttrpg-lib-dice

A small library for rolling dice in tabletop games.

## Installation

```bash
npm install dice-roller
# or
yarn add dice-roller
```

## Usage

```ts
import {
  Dice,
  roll,
  rollDiceFormula,
  secureRandomInteger,
  getRandomArrayItem,
  getRandomArrayItems
} from 'dice-roller'

// Roll a single D20
const single = roll(Dice.d20)

// Roll using a formula: 2d6 + 3
const formula = rollDiceFormula('2d6+3')

// Secure random integer between 1 and 100
const randInt = secureRandomInteger(1, 100)

// Pick one random element
const one = getRandomArrayItem([1, 2, 3])

// Pick three unique elements
const three = getRandomArrayItems(['a', 'b', 'c', 'd'], 3)
```

## License

Licensed under the MIT License. See [LICENSE](LICENSE) for details.
