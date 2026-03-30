# Function: `includeEvilWhitespaceChars()`

> **Source:** [EvilWhitespace.ts](https://github.com/litert/utils.js/blob/master/packages/partials/string/src/Functions/EvilWhitespace.ts)

"Evil" whitespace characters are Unicode code points that visually appear as spaces or are completely invisible, but are distinct from normal whitespace. These can cause bugs in string comparisons, input validation, and data processing. The matched ranges are: `U+0000–U+0008`, `U+000B–U+000C`, `U+000E–U+001F`, `U+0080–U+00A0`, and `U+2000–U+200F`.

## Import

```ts
import { includeEvilWhitespaceChars } from '@litert/utils-string';
```

## Signature

```ts
function includeEvilWhitespaceChars(str: string): boolean;
```

## Description

Returns `true` if `str` contains at least one evil whitespace character, `false` otherwise.

## Parameters

- Parameter `str: string` — The string to inspect.

## Return Value

`true` if one or more evil whitespace characters are present; `false` otherwise.

## Example

```ts
import { includeEvilWhitespaceChars } from '@litert/utils-string';

includeEvilWhitespaceChars('hello');         // false
includeEvilWhitespaceChars('hel\u200Blo');   // true (zero-width space)
includeEvilWhitespaceChars('test\u0001');    // true (control character)
```
