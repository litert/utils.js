# Function `randomBetween`

> **Package:** `@litert/utils-number`
> **Source:** [packages/partials/number/src/Functions/RandomBetween.ts](https://github.com/litert/utils.js/blob/master/packages/partials/number/src/Functions/RandomBetween.ts)

Generates a random integer within the half-open range `[min, max)`, meaning `min` is inclusive and `max` is exclusive.

---

## Import

```ts
import { randomBetween } from '@litert/utils-number';
```

---

## Signature

```ts
function randomBetween(min: number, max: number): number;
```

---

## Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `min` | `number` | Inclusive lower bound |
| `max` | `number` | Exclusive upper bound |

---

## Return Value

A random integer `n` such that `min <= n < max`.

---

## Error Handling

- `RangeError` — thrown when `min` is greater than `max`.

---

## Examples

```ts
import { randomBetween } from '@litert/utils-number';

const n = randomBetween(0, 10); // 0, 1, 2, ..., 9

// When min equals max, the result is always min
console.log(randomBetween(5, 5)); // 5

// Throws RangeError
randomBetween(10, 0);
```
