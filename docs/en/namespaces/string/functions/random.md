# Function `random`

Source: [Random.ts](https://github.com/litert/utils.js/blob/master/packages/partials/string/src/Functions/Random.ts)

Generates a random string of the specified length by sampling characters from a charset string. The function uses `Math.random()` for sampling, so it is **not** cryptographically secure.

[TOC]

## Import

```ts
import { random, ERandomStringCharset, DEFAULT_RANDOM_CHARSET } from '@litert/utils-string';
```

## Signature

```ts
function random(length: number, charset?: string): string;
```

## Parameters

- Parameter `length: number`

  The desired length of the output string. If `<= 0`, an empty string is returned.

- Parameter `charset?: string` (default: [`DEFAULT_RANDOM_CHARSET`](#constant-default_random_charset))

  The pool of characters to sample from. All characters in the string must be unique for uniform distribution.

## Return Value

A random string of the requested length.

## Scoped Constants

### Enum `ERandomStringCharset`

> Source: [Random.ts](https://github.com/litert/utils.js/blob/master/packages/partials/string/src/Functions/Random.ts)

```ts
import { ERandomStringCharset } from '@litert/utils-string';
```

Predefined character set strings for use as the `charset` argument to `random`.

```ts
enum ERandomStringCharset {
    UPPER_ALPHA     = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    LOWER_ALPHA     = 'abcdefghijklmnopqrstuvwxyz',
    DEC_DIGIT       = '0123456789',
    UPPER_HEX_DIGIT = '0123456789ABCDEF',
    LOWER_HEX_DIGIT = '0123456789abcdef',
}
```

| Member | Value | Description |
| --- | --- | --- |
| `UPPER_ALPHA` | `'ABCDEFGHIJKLMNOPQRSTUVWXYZ'` | Uppercase English letters A–Z |
| `LOWER_ALPHA` | `'abcdefghijklmnopqrstuvwxyz'` | Lowercase English letters a–z |
| `DEC_DIGIT` | `'0123456789'` | Decimal digits 0–9 |
| `UPPER_HEX_DIGIT` | `'0123456789ABCDEF'` | Uppercase hexadecimal digits |
| `LOWER_HEX_DIGIT` | `'0123456789abcdef'` | Lowercase hexadecimal digits |

---

### Constant `DEFAULT_RANDOM_CHARSET`

> Source: [Random.ts](https://github.com/litert/utils.js/blob/master/packages/partials/string/src/Functions/Random.ts)

```ts
import { DEFAULT_RANDOM_CHARSET } from '@litert/utils-string';
```

The default character set used by `random` when no explicit `charset` argument is provided. Combines uppercase letters, lowercase letters, and decimal digits — 62 characters total.

```ts
const DEFAULT_RANDOM_CHARSET: string;
// = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
```

---

## Examples

```ts
import { random, ERandomStringCharset } from '@litert/utils-string';

// Default charset: A-Z, a-z, 0-9
random(16);  // e.g. 'aB3xZ9mK2qTyWpLe'

// Only digits
random(6, ERandomStringCharset.DEC_DIGIT); // e.g. '847302'

// Lowercase hex
random(8, ERandomStringCharset.LOWER_HEX_DIGIT); // e.g. 'a3f09c12'

// Custom charset
random(5, 'abc');  // e.g. 'bcaac'

// Length 0
random(0);  // ''
```
