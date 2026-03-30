# Function: `isLowerSnakeCase()`

> **Source:** [NameCase.ts](https://github.com/litert/utils.js/blob/master/packages/partials/string/src/Functions/NameCase.ts)

## Import

```ts
import { isLowerSnakeCase } from '@litert/utils-string';
```

## Signature

```ts
function isLowerSnakeCase(text: string): boolean;
```

## Description

Returns `true` if `text` matches `lower_snake_case` format: starts with a lowercase letter and contains only lowercase letters, digits, and underscores joining segments.

Pattern: `/^[a-z][a-z0-9]*(_[a-z0-9]+)*$/`

## Parameters

- Parameter `text: string` — The string to test.

## Return Value

`true` if `text` is `lower_snake_case`; `false` otherwise.

## Example

```ts
import { isLowerSnakeCase } from '@litert/utils-string';

isLowerSnakeCase('lower_snake_case'); // true
isLowerSnakeCase('UPPER_SNAKE_CASE'); // false
isLowerSnakeCase('a1_b2_c3');        // true
isLowerSnakeCase('1a_b2');           // false
```
