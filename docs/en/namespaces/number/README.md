# Namespace `Number`

Number utilities for generating random integer values and performing unit conversions.

## Install

Use this namespace only:

```bash
npm i @litert/utils-number
```

Or install the full bundle:

```bash
npm i @litert/utils
```

And then import from it.

```ts
import * as LibUtils from '@litert/utils';
LibUtils.Number.randomBetween(1, 100);

// or
import { Number as LibNumber } from '@litert/utils';
LibNumber.randomBetween(1, 100);
```

## Exports

### Functions

| Name | Description |
|------|-------------|
| [`randomBetween`](./functions/randomBetween.md) | Generates a random integer in the range `[min, max)`. |

### Classes

| Name | Description |
|------|-------------|
| [`UnitConverter`](./classes/UnitConverter.md) | Converts values between units of the same measurement type (e.g., bytes, length, weight). |
