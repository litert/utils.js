# Function `parseIPv6AddressToUInt16Array`

Source: [ParseIPv6Address.ts](https://github.com/litert/utils.js/blob/master/packages/partials/network/src/Functions/ParseIPv6Address.ts)

Parses an IPv6 address and returns an array of exactly 8 unsigned 16-bit integers (0–65535), one per segment. The `::` shorthand is expanded before parsing.

See also [`parseIPv6Address`](./parseIPv6Address.md) for a hexadecimal-string representation.

[TOC]

## Import

```ts
import { parseIPv6AddressToUInt16Array } from '@litert/utils-network';
```

## Signature

```ts
function parseIPv6AddressToUInt16Array(ip: string): number[];
```

## Parameters

- Parameter `ip: string`

  The IPv6 address to parse. Accepts any valid IPv6 notation.

## Return Value

An array of exactly 8 numbers in the range `[0, 65535]`.

## Error Handling

- `TypeError` — Thrown when the input string is not a valid IPv6 address.

## Examples

```ts
import { parseIPv6AddressToUInt16Array } from '@litert/utils-network';

parseIPv6AddressToUInt16Array('::1');
// [0, 0, 0, 0, 0, 0, 0, 1]

parseIPv6AddressToUInt16Array('2001:db8::1');
// [8193, 3512, 0, 0, 0, 0, 0, 1]
```
