# Function ~~`regexpEscape`~~ (⚠️Deprecated)

Source: [RegexpEscape.ts](https://github.com/litert/utils.js/blob/master/packages/partials/string/src/Functions/RegexpEscape.ts)

Escapes all characters in a string that have special meaning in regular expressions, making the result safe to embed as a literal pattern inside a `RegExp`.

> [!WARNING]
> This function is deprecated since 2025. The `RegExp.escape` static method is now widely supported in modern environments (Node.js v24+, all major browsers). Use `RegExp.escape(text)` instead.

The following characters are escaped: `. * + ? ^ $ { } ( ) | [ ] / \`

[TOC]

## Import

```ts
import { regexpEscape } from '@litert/utils-string';
```

## Signature

```ts
function regexpEscape(text: string): string;
```

## Parameters

- Parameter `text: string`

  The string to escape.

## Return Value

A new string with all regex special characters prefixed with a backslash.

## Examples

```ts
import { regexpEscape } from '@litert/utils-string';

regexpEscape('Hello.World');      // 'Hello\\.World'
regexpEscape('(1 + 2) * 3');     // '\\(1 \\+ 2\\) \\* 3'
regexpEscape('price: $9.99');    // 'price: \\$9\\.99'

// Typical usage: build a RegExp from user input
const userInput = 'file.txt';
const pattern = new RegExp(regexpEscape(userInput));
pattern.test('file.txt');  // true
pattern.test('filextxt');  // false (dot is escaped)
```
