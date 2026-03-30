# Function `parseIPv6Address`

Source: [ParseIPv6Address.ts](https://github.com/litert/utils.js/blob/master/packages/partials/network/src/Functions/ParseIPv6Address.ts)

Parses an IPv6 address and returns an array of exactly 8 hexadecimal string segments. The `::` shorthand is expanded before parsing; segments can optionally be padded to 4 digits.

See also [`parseIPv6AddressToUInt16Array`](./parseIPv6AddressToUInt16Array.md) for an integer array representation.

[TOC]

## Import

```ts
import { parseIPv6Address } from '@litert/utils-network';
```

## Signature

```ts
function parseIPv6Address(ip: string, padLeadingZeros: boolean): string[];
```

## Parameters

- Parameter `ip: string`

  The IPv6 address to parse. Accepts any valid IPv6 notation.

- Parameter `padLeadingZeros: boolean`

  When `true`, each segment string is zero-padded to 4 hex digits. When `false`, leading zeros are stripped.

## Return Value

An array of exactly 8 hexadecimal strings representing the segments of the address.

## Error Handling

- `TypeError` — Thrown when the input string is not a valid IPv6 address.

## Examples

```ts
import { parseIPv6Address } from '@litert/utils-network';

parseIPv6Address('::1', false);
// ['0', '0', '0', '0', '0', '0', '0', '1']

parseIPv6Address('::1', true);
// ['0000', '0000', '0000', '0000', '0000', '0000', '0000', '0001']

parseIPv6Address('2001:db8::1', false);
// ['2001', 'db8', '0', '0', '0', '0', '0', '1']
```
