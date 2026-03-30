# Namespace `Network`

Package: `@litert/utils-network`

Network validation and parsing utilities for JavaScript/TypeScript. Provides functions to validate IPv4 addresses, IPv6 addresses, and MAC addresses, as well as to normalize and parse IPv6 addresses.

## Install

Use this namespace only:

```bash
npm i @litert/utils-network
```

Or install the full bundle:

```bash
npm i @litert/utils
```

And then import from it.

```ts
import * as LibUtils from '@litert/utils';
LibUtils.Network.isValidIPv4Address('192.168.1.1');

// or
import { Network as LibNetwork } from '@litert/utils';
LibNetwork.isValidIPv4Address('192.168.1.1');
```

[TOC]

## Functions

| Function | Description |
| --- | --- |
| [`isValidIPv4Address`](./functions/isValidIPv4Address.md) | Checks whether a string is a valid IPv4 address. |
| [`isValidIPv6Address`](./functions/isValidIPv6Address.md) | Checks whether a string is a valid IPv6 address. |
| [`isValidMacAddress`](./functions/isValidMacAddress.md) | Checks whether a string is a valid MAC address. |
| [`normalizeIPv6Address`](./functions/normalizeIPv6Address.md) | Normalizes an IPv6 address to a full 8-segment form. |
| [`parseIPv6Address`](./functions/parseIPv6Address.md) | Parses an IPv6 address into an array of segment strings. |
| [`parseIPv6AddressToUInt16Array`](./functions/parseIPv6AddressToUInt16Array.md) | Parses an IPv6 address into an array of 16-bit unsigned integers. |
