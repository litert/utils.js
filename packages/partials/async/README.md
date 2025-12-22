# LiteRT/Utils - Async

[![Strict TypeScript Checked](https://badgen.net/badge/TS/Strict "Strict TypeScript Checked")](https://www.typescriptlang.org)
[![npm version](https://img.shields.io/npm/v/@litert/utils-async.svg?colorB=brightgreen)](https://www.npmjs.com/package/@litert/utils-async "Stable Version")
[![License](https://img.shields.io/npm/l/@litert/utils-async.svg?maxAge=2592000?style=plastic)](https://github.com/litert/utils.js/blob/master/LICENSE)
[![node](https://img.shields.io/node/v/@litert/utils-async.svg?colorB=brightgreen)](https://nodejs.org/dist/latest-v8.x/)
[![GitHub issues](https://img.shields.io/github/issues/litert/utils.js.svg)](https://github.com/litert/utils.js/issues)
[![GitHub Releases](https://img.shields.io/github/release/litert/utils.js.svg)](https://github.com/litert/utils.js/releases "Stable Release")

The utility functions/classes/constants about asynchronous operations for JavaScript/TypeScript.

## Requirement

- TypeScript v5.0.0 (or newer)
- Node.js v18.0.0 (or newer)

## Installation

```sh
npm i @litert/utils-async --save
```

## Usage

### API `sleep`

This API provides a way to pause execution for a specified duration, asynchronously.

```ts
import { sleep } from '@litert/utils-async';

await sleep(2000); // Sleep for 2 seconds
```

### API `autoRetry`

This API provides automatic retry functionality for (asynchronous) operations.

```ts
import { autoRetry } from '@litert/utils-async';

const ac = new AbortController(); // Optional, to allow aborting the retry operation
await autoRetry({
    'maxRetries': 5, // Retry no more than 5 times if the first call fails
    'function': async (ctx) => {
        // Your function logic here
    },
    // Optional, `DEFAULT_BEFORE_RETRY` will be used if omitted.
    'beforeRetry': async (ctx) => {
        // Your beforeRetry logic here
    },
    // Optional, an AbortSignal to allow the retry operation to be aborted.
    'signal': ac.signal,
});
```

### API `withTimeout`

This API binds a timeout to an asynchronous operation, without modifying the original function.

```ts
import { withTimeout } from '@litert/utils-async';

await withTimeout(5000, async () => {
    // Your async code here
});

```

### API `withAbortSignal`

This API binds an AbortSignal to an asynchronous operation, without modifying the original function.

```ts
import { withAbortSignal } from '@litert/utils-async';

const ac = new AbortController();

await withAbortSignal(ac.signal, async () => {
    // Your async code here
});
```

### Class `AbortTimeoutController`

This class is an extension of the standard AbortController that automatically aborts after a specified timeout.

```ts
import { AbortTimeoutController } from '@litert/utils-async';

const atc = new AbortTimeoutController(3000); // Automatically abort after 3 seconds

// Use `atc.signal` in your async operations
```

### Class `BackgroundRunner`

This class allows running asynchronous tasks in the background, managing their lifecycle.

```ts
import { BackgroundRunner } from '@litert/utils-async';

const runner = new BackgroundRunner();

runner.on('error', (err) => {
    console.error('Background task error:', err);
});

// Start a background task immediately
runner.run(async () => {
    // Your background task logic here
});

// Run a background task after a delay (default is in the next tick)
runner.runLater(async () => {
    // Your delayed background task logic here
});
```

### Class `PromiseController`

Unlike the `new Promise(...)` flow, this class provides control over a Promise,
allowing external resolution or rejection.

```ts
import { PromiseController } from '@litert/utils-async';

const pc = new PromiseController<number>();

setTimeout(() => {
    pc.resolve(42); // Resolve the promise with the value 42 after 1 second
}, 1000);

pc.promise.then((value) => {
    console.log('Promise resolved with value:', value);
});
```

## Documentation

- [en-US](https://litert.org/projects/utils.js/api-docs/async/)

## License

This library is published under [Apache-2.0](https://github.com/litert/utils.js/blob/master/LICENSE) license.
