# Function `isValidMacAddress`

Source: [IsValidMacAddress.ts](https://github.com/litert/utils.js/blob/master/packages/partials/network/src/Functions/IsValidMacAddress.ts)

Checks whether a string is a valid MAC address. Accepts both hyphen-separated (`AA-BB-CC-DD-EE-FF`) and colon-separated (`AA:BB:CC:DD:EE:FF`) notations. Each group must be exactly two hexadecimal characters.

[TOC]

## Import

```ts
import { isValidMacAddress } from '@litert/utils-network';
// or via sub-path:
import { isValidMacAddress } from '@litert/utils-network/functions/IsValidMacAddress';
```

## Signature

```ts
function isValidMacAddress(ip: string): boolean;
```

## Parameters

- Parameter `ip: string`

  The string to check.

## Return Value

`true` if the string is a valid MAC address, `false` otherwise.

## Examples

```ts
import { isValidMacAddress } from '@litert/utils-network';

console.log(isValidMacAddress('00:1A:2B:3C:4D:5E')); // true
console.log(isValidMacAddress('00-1A-2B-3C-4D-5E')); // true
console.log(isValidMacAddress('001A2B3C4D5E'));        // false — no separator
console.log(isValidMacAddress('GG:1A:2B:3C:4D:5E'));  // false — invalid characters
```
