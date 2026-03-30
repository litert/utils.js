# Function: `toChunksBackward()`

> **Source:** [ToChunks.ts](https://github.com/litert/utils.js/blob/master/packages/partials/string/src/Functions/ToChunks.ts)

## Import

```ts
import { toChunksBackward } from '@litert/utils-string';
```

## Signature

```ts
function toChunksBackward(text: string, chunkSize: number): string[];
```

## Description

Splits `text` into chunks of `chunkSize` characters, from right to left. The first chunk may be shorter than `chunkSize`; all subsequent chunks have exactly `chunkSize` characters.

See also [`toChunks()`](./toChunks.md) for left-to-right splitting.

## Parameters

- Parameter `text: string` — The string to split.
- Parameter `chunkSize: number` — The maximum size of each chunk. Must be a positive integer.

## Return Value

An array of strings. The first element may be shorter than `chunkSize`.

## Error Handling

- `RangeError` — Thrown when `chunkSize <= 0` or is not a safe integer.

## Example

```ts
import { toChunksBackward } from '@litert/utils-string';

toChunksBackward('abcdefghij', 3);  // ['a', 'bcd', 'efg', 'hij']

// Formatting numbers with thousands separator:
const digits = '1234567';
toChunksBackward(digits, 3).join(',');  // '1,234,567'
```
