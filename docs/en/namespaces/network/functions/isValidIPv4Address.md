# Function `isValidIPv4Address`

Source: [IsValidIPv4Address.ts](https://github.com/litert/utils.js/blob/master/packages/partials/network/src/Functions/IsValidIPv4Address.ts)

Checks whether a string is a valid IPv4 address in standard dot-decimal notation (e.g., `192.168.1.1`). Each octet must be an integer between 0 and 255 with no leading zeros.

[TOC]

## Import

```ts
import { isValidIPv4Address } from '@litert/utils-network';
// or via sub-path:
import { isValidIPv4Address } from '@litert/utils-network/functions/IsValidIPv4Address';
```

## Signature

```ts
function isValidIPv4Address(ip: string): boolean;
```

## Parameters

- Parameter `ip: string`

  The string to check.

## Return Value

`true` if the string is a valid IPv4 address in dot-decimal notation, `false` otherwise.

## Examples

```ts
import { isValidIPv4Address } from '@litert/utils-network';

console.log(isValidIPv4Address('192.168.1.1')); // true
console.log(isValidIPv4Address('255.255.255.255')); // true
console.log(isValidIPv4Address('0.0.0.0')); // true
console.log(isValidIPv4Address('256.0.0.1')); // false  — octet out of range
console.log(isValidIPv4Address('192.168.1'));  // false  — not 4 octets
console.log(isValidIPv4Address('192.168.1.01')); // false — leading zero
```
