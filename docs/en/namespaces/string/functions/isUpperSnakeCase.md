# Function: `isUpperSnakeCase()`

> **Source:** [NameCase.ts](https://github.com/litert/utils.js/blob/master/packages/partials/string/src/Functions/NameCase.ts)

## Import

```ts
import { isUpperSnakeCase } from '@litert/utils-string';
```

## Signature

```ts
function isUpperSnakeCase(text: string): boolean;
```

## Description

Returns `true` if `text` matches `UPPER_SNAKE_CASE` format: starts with an uppercase letter and contains only uppercase letters, digits, and underscores joining segments.

Pattern: `/^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$/`

## Parameters

- Parameter `text: string` — The string to test.

## Return Value

`true` if `text` is `UPPER_SNAKE_CASE`; `false` otherwise.

## Example

```ts
import { isUpperSnakeCase } from '@litert/utils-string';

isUpperSnakeCase('UPPER_SNAKE_CASE'); // true
isUpperSnakeCase('lower_snake_case'); // false
isUpperSnakeCase('A1_B2_C3');         // true
isUpperSnakeCase('1A_B');             // false
isUpperSnakeCase('');                 // false
```
