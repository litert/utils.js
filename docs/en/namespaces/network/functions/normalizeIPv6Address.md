# Function `normalizeIPv6Address`

Source: [NormalizeIPv6Address.ts](https://github.com/litert/utils.js/blob/master/packages/partials/network/src/Functions/NormalizeIPv6Address.ts)

Transforms an IPv6 address into a normalized string form with exactly 8 colon-separated hexadecimal segments. The `::` shorthand is expanded to the full zero segments. Leading zeros in each segment are either preserved (padded to 4 digits) or removed, depending on the `padLeadingZeros` flag.

[TOC]

## Import

```ts
import { normalizeIPv6Address } from '@litert/utils-network';
// or via sub-path:
import { normalizeIPv6Address } from '@litert/utils-network/functions/NormalizeIPv6Address';
```

## Signature

```ts
function normalizeIPv6Address(ip: string, padLeadingZeros: boolean): string;
```

## Parameters

- Parameter `ip: string`

  The IPv6 address to normalize. Accepts any valid IPv6 notation including compressed forms.

- Parameter `padLeadingZeros: boolean`

  When `true`, each segment is zero-padded to 4 hex digits (e.g., `0001`). When `false`, leading zeros are stripped (e.g., `1`).

## Return Value

A string of exactly 8 colon-separated hexadecimal segments representing the full IPv6 address.

## Error Handling

- `TypeError` — Thrown when the input string is not a valid IPv6 address.

## Examples

```ts
import { normalizeIPv6Address } from '@litert/utils-network';

// Without padding
console.log(normalizeIPv6Address('::', false));     // '0:0:0:0:0:0:0:0'
console.log(normalizeIPv6Address('::1', false));    // '0:0:0:0:0:0:0:1'
console.log(normalizeIPv6Address('a::1', false));   // 'a:0:0:0:0:0:0:1'

// With padding
console.log(normalizeIPv6Address('::1', true));     // '0000:0000:0000:0000:0000:0000:0000:0001'
console.log(normalizeIPv6Address('a::1', true));    // '000a:0000:0000:0000:0000:0000:0000:0001'
```
