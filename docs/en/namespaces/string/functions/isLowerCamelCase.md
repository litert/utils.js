# Function: `isLowerCamelCase()`

> **Source:** [NameCase.ts](https://github.com/litert/utils.js/blob/master/packages/partials/string/src/Functions/NameCase.ts)

## Import

```ts
import { isLowerCamelCase } from '@litert/utils-string';
```

## Signature

```ts
function isLowerCamelCase(text: string): boolean;
```

## Description

Returns `true` if `text` matches `lowerCamelCase` format: starts with a lowercase letter and contains only letters and digits (no underscores).

Pattern: `/^[a-z][a-zA-Z0-9]*$/`

## Parameters

- Parameter `text: string` — The string to test.

## Return Value

`true` if `text` is `lowerCamelCase`; `false` otherwise.

## Example

```ts
import { isLowerCamelCase } from '@litert/utils-string';

isLowerCamelCase('lowerCamelCase'); // true
isLowerCamelCase('UpperCamelCase'); // false
isLowerCamelCase('a1b2c3');        // true
isLowerCamelCase('1aB2');          // false
```
