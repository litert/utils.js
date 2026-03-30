# Function: `splitIntoLines()`

> **Source:** [Lines.ts](https://github.com/litert/utils.js/blob/master/packages/partials/string/src/Functions/Lines.ts)

## Import

```ts
import { splitIntoLines } from '@litert/utils-string';
```

## Signature

```ts
function splitIntoLines(str: string, eol?: string | RegExp): string[];
```

## Description

Splits `str` into an array of lines by EOL characters. Default EOL matches `\r\n`, `\r`, or `\n`.

## Parameters

- Parameter `str: string` — The string to split.
- Parameter `eol?: string | RegExp` (default: `/\r\n|\r|\n/`) — The EOL delimiter.

## Return Value

An array of strings, one per line.

## Example

```ts
import { splitIntoLines } from '@litert/utils-string';

splitIntoLines('a\nb\r\nc\rd');  // ['a', 'b', 'c', 'd']
splitIntoLines('a|b|c', '|');   // ['a', 'b', 'c']
```
