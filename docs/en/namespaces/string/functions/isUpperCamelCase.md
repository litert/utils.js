# Function: `isUpperCamelCase()`

> **Source:** [NameCase.ts](https://github.com/litert/utils.js/blob/master/packages/partials/string/src/Functions/NameCase.ts)

## Import

```ts
import { isUpperCamelCase } from '@litert/utils-string';
```

## Signature

```ts
function isUpperCamelCase(text: string): boolean;
```

## Description

Returns `true` if `text` matches `UpperCamelCase` format: starts with an uppercase letter and contains only letters and digits (no underscores).

Pattern: `/^[A-Z][a-zA-Z0-9]*$/`

See also [`isPascalCase()`](./isPascalCase.md), which is an alias for this function.

## Parameters

- Parameter `text: string` — The string to test.

## Return Value

`true` if `text` is `UpperCamelCase`; `false` otherwise.

## Example

```ts
import { isUpperCamelCase } from '@litert/utils-string';

isUpperCamelCase('UpperCamelCase'); // true
isUpperCamelCase('lowerCamelCase'); // false
isUpperCamelCase('A1B2C3');        // true
isUpperCamelCase('1A2B');          // false
```
