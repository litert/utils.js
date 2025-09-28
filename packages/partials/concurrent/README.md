# LiteRT/Utils - Concurrent

[![Strict TypeScript Checked](https://badgen.net/badge/TS/Strict "Strict TypeScript Checked")](https://www.typescriptlang.org)
[![npm version](https://img.shields.io/npm/v/@litert/concurrent.svg?colorB=brightgreen)](https://www.npmjs.com/package/@litert/concurrent "Stable Version")
[![License](https://img.shields.io/npm/l/@litert/concurrent.svg?maxAge=2592000?style=plastic)](https://github.com/litert/utils.js/blob/master/LICENSE)
[![node](https://img.shields.io/node/v/@litert/concurrent.svg?colorB=brightgreen)](https://nodejs.org/dist/latest-v8.x/)
[![GitHub issues](https://img.shields.io/github/issues/litert/utils.js.svg)](https://github.com/litert/utils.js/issues)
[![GitHub Releases](https://img.shields.io/github/release/litert/utils.js.svg)](https://github.com/litert/utils.js/releases "Stable Release")

The utility functions/classes/constants about asynchronous operations for JavaScript/TypeScript.

## Requirement

- TypeScript v5.0.0 (or newer)
- Node.js v18.0.0 (or newer)

## Installation

```sh
npm i @litert/concurrent --save
```

## Usage

### DebounceController

The `DebounceController` class can be used to debounce function calls, to reduce
the number of times a function is called in a short period of time.

```ts
import { DebounceController } from '@litert/concurrent';

const controller = new DebounceController({
    function: () => {
        console.log('Called!');
    },
    delayMs: 1000,
});

controller.schedule();
controller.schedule();
controller.schedule();
controller.schedule();
```

After 1000ms, the function will be called only once.

### ThrottleController

The `ThrottleController` class can be used to throttle an asynchronous function calls, to ensure
that a function is called at most once in a specified period of time.

```ts
import { ThrottleController } from '@litert/concurrent';
import * as NodeTimers from 'node:timers/promises';

const controller = new ThrottleController(
    async (ms: number, v: string): Promise<string> => {
        await NodeTimers.setTimeout(ms);
        return v;
    },
    null,
);

console.log(await Promise.all([
    controller.call(2000, 'A'),
    controller.call(1000, 'B'),
    controller.call(1000, 'C'),
]));
```

After 2000ms, the console will print ['A', 'A', 'A'].

### ManualBreaker

The `ManualBreaker` class can be used to control the flow of function calls,
by manually open or close the breaker.

```ts
import { ManualBreaker } from '@litert/concurrent';

const breaker = new ManualBreaker();

breaker.call(() => {
    console.log('This will be called.');
});

breaker.open();

try {
    breaker.call(() => {
        console.log('This will not be called.');
    });
}
catch (err) {
    console.error('Breaker is opened, cannot call the function.');
}
```

## Documentation

- [en-US](https://litert.org/projects/utils.js/api-docs/concurrent/)

## License

This library is published under [Apache-2.0](https://github.com/litert/utils.js/blob/master/LICENSE) license.
