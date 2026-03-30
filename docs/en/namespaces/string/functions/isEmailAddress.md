# Function `isEmailAddress`

Source: [IsEmailAddress.ts](https://github.com/litert/utils.js/blob/master/packages/partials/string/src/Functions/IsEmailAddress.ts)

Validates whether a string is a syntactically valid email address. Optionally restricts the allowed length and permitted domains.

Validation rules:
- Length: 6–255 characters (or the configured `maxLength`).
- No consecutive dots (`..`), no dot immediately before `@` (`.@`).
- Matches the pattern `local@domain.tld` with alphanumeric and limited punctuation.
- Domain TLD must be 2–26 alphabetic characters.

[TOC]

## Import

```ts
import { isEmailAddress } from '@litert/utils-string';
```

## Signature

```ts
function isEmailAddress(email: string, opts?: IEmailValidationOptions): boolean;
```

## Parameters

- Parameter `email: string`

  The string to validate.

- Parameter `opts?: IEmailValidationOptions`

  Optional validation options. See [`IEmailValidationOptions`](#interface-iemailvalidationoptions).

## Return Value

`true` if the string is a valid email address (and passes all configured constraints), `false` otherwise.

## Scoped Types

### Interface `IEmailValidationOptions`

> Source: [IsEmailAddress.ts](https://github.com/litert/utils.js/blob/master/packages/partials/string/src/Functions/IsEmailAddress.ts)

```ts
import type { IEmailValidationOptions } from '@litert/utils-string';
```

Extra options for the `isEmailAddress` function.

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `maxLength` | `number?` | `255` | The maximum allowed length for the email address. If this value exceeds `255`, `255` is used instead. |
| `domains` | `string[]?` | `[]` | An allowlist of permitted email domains. When provided (and non-empty), only email addresses whose domain is in this list are accepted. Comparison is case-insensitive, but **only lowercase domain strings** in the list are supported. |

---

## Examples

```ts
import { isEmailAddress } from '@litert/utils-string';

isEmailAddress('user@example.com');    // true
isEmailAddress('invalid-email');       // false
isEmailAddress('a@b.c');              // false (TLD too short)

// Domain allowlist
isEmailAddress('user@example.com', { domains: ['example.com'] });  // true
isEmailAddress('user@other.com',   { domains: ['example.com'] });  // false

// Custom max length
isEmailAddress('a@b.co', { maxLength: 10 }); // true
```
