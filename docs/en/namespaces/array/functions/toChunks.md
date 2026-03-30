# Function `toChunks`

> **Package:** `@litert/utils-array`
> **Source:** [packages/partials/array/src/Functions/ToChunks.ts](https://github.com/litert/utils.js/blob/master/packages/partials/array/src/Functions/ToChunks.ts)

Splits an array into sub-arrays (chunks) of at most `chunkSize` elements each, preserving the original element order. The last chunk may contain fewer elements if the input length is not evenly divisible by `chunkSize`.

---

## Import

```ts
import { toChunks } from '@litert/utils-array';
```

---

## Signature

```ts
function toChunks<T>(arr: readonly T[], chunkSize: number): T[][];
```

---

## Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `arr` | `readonly T[]` | The array to split |
| `chunkSize` | `number` | Maximum number of elements per chunk; must be a positive integer |

---

## Return Value

An array of sub-arrays, where each sub-array contains at most `chunkSize` elements.

---

## Error Handling

- `RangeError` — thrown when `chunkSize` is not a positive safe integer.

---

## Examples

```ts
import { toChunks } from '@litert/utils-array';

console.log(toChunks([1, 2, 3, 4, 5], 2)); // [[1, 2], [3, 4], [5]]
console.log(toChunks(['a', 'b', 'c'], 3)); // [['a', 'b', 'c']]
```
