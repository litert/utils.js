# Function: `toMacString()`

> **Source:** [Lines.ts](https://github.com/litert/utils.js/blob/master/packages/partials/string/src/Functions/Lines.ts)

## Import

```ts
import { toMacString } from '@litert/utils-string';
```

## Signature

```ts
function toMacString(str: string): string;
```

## Description

Converts all `\r\n` and `\n` line endings in `str` to classic Mac-style `\r`.

## Parameters

- Parameter `str: string` — The string to convert.

## Return Value

A new string with all line endings normalized to `\r`.

## Example

```ts
import { toMacString } from '@litert/utils-string';

toMacString('a\nb\r\nc');  // 'a\rb\rc'
```
