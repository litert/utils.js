# Function: `toUnixString()`

> **Source:** [Lines.ts](https://github.com/litert/utils.js/blob/master/packages/partials/string/src/Functions/Lines.ts)

## Import

```ts
import { toUnixString } from '@litert/utils-string';
```

## Signature

```ts
function toUnixString(str: string): string;
```

## Description

Converts all `\r\n` and `\r` line endings in `str` to Unix-style `\n`.

## Parameters

- Parameter `str: string` — The string to convert.

## Return Value

A new string with all line endings normalized to `\n`.

## Example

```ts
import { toUnixString } from '@litert/utils-string';

toUnixString('a\r\nb\rc');  // 'a\nb\nc'
```
