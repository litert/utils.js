# Function: `replaceEvilWhitespaceChars()`

> **Source:** [EvilWhitespace.ts](https://github.com/litert/utils.js/blob/master/packages/partials/string/src/Functions/EvilWhitespace.ts)

"Evil" whitespace characters are Unicode code points that visually appear as spaces or are completely invisible, but are distinct from normal whitespace. The matched ranges are: `U+0000–U+0008`, `U+000B–U+000C`, `U+000E–U+001F`, `U+0080–U+00A0`, and `U+2000–U+200F`.

## Import

```ts
import { replaceEvilWhitespaceChars } from '@litert/utils-string';
```

## Signature

```ts
function replaceEvilWhitespaceChars(str: string, to?: string): string;
```

## Description

Replaces all evil whitespace characters in `str` with the string `to`. Defaults to removing them (replacing with an empty string).

## Parameters

- Parameter `str: string` — The string to process.
- Parameter `to?: string` (default: `''`) — The replacement string.

## Return Value

A new string with all evil whitespace characters replaced.

## Example

```ts
import { replaceEvilWhitespaceChars } from '@litert/utils-string';

replaceEvilWhitespaceChars('hel\u200Blo');         // 'hello'
replaceEvilWhitespaceChars('hel\u200Blo', ' ');    // 'hel lo'
replaceEvilWhitespaceChars('a\u0001b\u0002c');     // 'abc'
```
