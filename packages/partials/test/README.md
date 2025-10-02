# LiteRT/Utils - Test

[![Strict TypeScript Checked](https://badgen.net/badge/TS/Strict "Strict TypeScript Checked")](https://www.typescriptlang.org)
[![npm version](https://img.shields.io/npm/v/@litert/utils-test.svg?colorB=brightgreen)](https://www.npmjs.com/package/@litert/utils-test "Stable Version")
[![License](https://img.shields.io/npm/l/@litert/utils-test.svg?maxAge=2592000?style=plastic)](https://github.com/litert/utils.js/blob/master/LICENSE)
[![node](https://img.shields.io/node/v/@litert/utils-test.svg?colorB=brightgreen)](https://nodejs.org/dist/latest-v8.x/)
[![GitHub issues](https://img.shields.io/github/issues/litert/utils.js.svg)](https://github.com/litert/utils.js/issues)
[![GitHub Releases](https://img.shields.io/github/release/litert/utils.js.svg)](https://github.com/litert/utils.js/releases "Stable Release")

The utility functions/classes/constants about test (using `node:test`) for NodeJS.

## Requirement

- TypeScript v5.0.0 (or newer)
- Node.js v18.0.0 (or newer)

## Installation

```sh
npm i @litert/utils-test --save
```

## APIs

### Function `autoTick`

The `autoTick` function is a utility for testing asynchronous code that relies on mocked timers.
It automatically advances the timer and executes any pending asynchronous operations,
making it easier to write tests for code that uses `setTimeout`, `setInterval`, or
other timer-based functions.

```ts
import { autoTick } from '@litert/utils-test';

await autoTick(async () => {
    // Some asynchronous operation that uses timers
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('This will be logged after the timer is advanced');
});
```

## Documentation

- [en-US](https://litert.org/projects/utils.js/api-docs/test/)

## License

This library is published under [Apache-2.0](https://github.com/litert/utils.js/blob/master/LICENSE) license.
