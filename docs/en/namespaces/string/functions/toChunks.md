# Function: `toChunks()`

> **Source:** [ToChunks.ts](https://github.com/litert/utils.js/blob/master/packages/partials/string/src/Functions/ToChunks.ts)

## Import

```ts
import { toChunks } from '@litert/utils-string';
```

## Signature

```ts
function toChunks(text: string, chunkSize: number): string[];
```

## Description

Splits `text` into chunks of `chunkSize` characters, from left to right. The last chunk may be shorter if the string length is not a multiple of `chunkSize`.

See also [`toChunksBackward()`](./toChunksBackward.md) for right-to-left splitting.

## Parameters

- Parameter `text: string` — The string to split.
- Parameter `chunkSize: number` — The maximum size of each chunk. Must be a positive integer.

## Return Value

An array of strings. The last element may be shorter than `chunkSize`.

## Error Handling

- `RangeError` — Thrown when `chunkSize <= 0` or is not a safe integer.

## Example

```ts
import { toChunks } from '@litert/utils-string';

toChunks('abcdefghij', 3);  // ['abc', 'def', 'ghi', 'j']
toChunks('abcd', 2);        // ['ab', 'cd']
toChunks('ab', 5);          // ['ab']
```

