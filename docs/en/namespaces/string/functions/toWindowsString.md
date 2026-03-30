# Function: `toWindowsString()`

> **Source:** [Lines.ts](https://github.com/litert/utils.js/blob/master/packages/partials/string/src/Functions/Lines.ts)

## Import

```ts
import { toWindowsString } from '@litert/utils-string';
```

## Signature

```ts
function toWindowsString(str: string): string;
```

## Description

Converts all `\r\n`, `\r`, and `\n` line endings in `str` to Windows-style `\r\n`.

## Parameters

- Parameter `str: string` — The string to convert.

## Return Value

A new string with all line endings normalized to `\r\n`.

## Example

```ts
import { toWindowsString } from '@litert/utils-string';

toWindowsString('a\nb\rc');  // 'a\r\nb\r\nc'
```
