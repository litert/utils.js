# Function `regexpEscape`

Source: [RegexpEscape.ts](https://github.com/litert/utils.js/blob/master/packages/partials/string/src/Functions/RegexpEscape.ts)

Escapes a string so it can be embedded as literal text inside a `RegExp`. In
modern runtimes it delegates to `RegExp.escape()`, and in older runtimes it
falls back to the bundled polyfill.

[TOC]

The escaped output is intended for literal matching. The exact escaped text may
vary between the native implementation and the fallback polyfill, but both are
safe to pass to `new RegExp(...)`.

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

A string that can be embedded into a `RegExp` as literal text.

## Examples

```ts
import { regexpEscape } from '@litert/utils-string';

const filePattern = new RegExp(`^${regexpEscape('file.txt')}$`);
filePattern.test('file.txt');  // true
filePattern.test('filextxt');  // false

const literalUrl = 'https://example.com/path?q=1&x=2';
const urlPattern = new RegExp(regexpEscape(literalUrl));
urlPattern.test(literalUrl); // true

// Use RegExp.escape() directly in new code when the runtime supports it.
const nativePattern = new RegExp(RegExp.escape('price: $9.99'));
nativePattern.test('price: $9.99'); // true
```
