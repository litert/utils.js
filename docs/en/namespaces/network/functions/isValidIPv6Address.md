# Function `isValidIPv6Address`

Source: [IsValidIPv6Address.ts](https://github.com/litert/utils.js/blob/master/packages/partials/network/src/Functions/IsValidIPv6Address.ts)

Checks whether a string is a valid IPv6 address. Accepts all standard IPv6 notations including full, compressed (`::` shorthand), and IPv4-mapped forms (e.g., `::ffff:192.168.1.1`).

[TOC]

## Import

```ts
import { isValidIPv6Address } from '@litert/utils-network';
// or via sub-path:
import { isValidIPv6Address } from '@litert/utils-network/functions/IsValidIPv6Address';
```

## Signature

```ts
function isValidIPv6Address(ip: string): boolean;
```

## Parameters

- Parameter `ip: string`

  The string to check.

## Return Value

`true` if the string is a valid IPv6 address, `false` otherwise.

## Examples

```ts
import { isValidIPv6Address } from '@litert/utils-network';

console.log(isValidIPv6Address('::')); // true
console.log(isValidIPv6Address('::1')); // true
console.log(isValidIPv6Address('2001:db8::1')); // true
console.log(isValidIPv6Address('fe80::1%eth0')); // false — zone IDs not supported
console.log(isValidIPv6Address('gggg::1')); // false — invalid hex segment
```
