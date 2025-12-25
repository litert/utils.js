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

### CircuitBreaker

The `CircuitBreaker` class can be used to control the flow of function calls,
by automatically open or close the breaker based on the success or failure of the function calls.

```ts
import { CircuitBreaker } from '@litert/concurrent';
import * as NodeTimers from 'node:timers/promises';

const breaker = new CircuitBreaker({
    'cooldownTimeMs': 30000, // Cooldown for 30 seconds when opened
    'breakThreshold': 3, // Break the circuit after 3 failures (in counter)
    'warmupThreshold': 2, // Close the circuit after 2 consecutive successes
});

breaker.call(() => {
    console.log('This will be called.');
});
```

### SlideWindowCounter

The `SlideWindowCounter` class can be used to count the number of events in a sliding window.

```ts
import { SlideWindowCounter } from '@litert/concurrent';

const counter = new SlideWindowCounter({
    windowSizeMs: 1000,
    windowQty: 10,
});

counter.count();
```

### CountingRateLimiter

The `CountingRateLimiter` class can be used to limit the rate of function calls,
with a counter.

```ts
import { CountingRateLimiter } from '@litert/concurrent';
import { SlideWindowCounter } from '@litert/concurrent';

const limiter = new CountingRateLimiter({
    limits: 5,
    counter: new SlideWindowCounter({
        windowSizeMs: 1000,
        windowQty: 10,
    }),
});

for (let i = 0; i < 5; ++i) {
    limiter.challenge();
}

limiter.challenge(); // This will throw an error, because the limit is reached.
```

### TokenBucketRateLimiter

The `TokenBucketRateLimiter` class can be used to limit the rate of function calls,
with a token bucket algorithm.

```ts
import { TokenBucketRateLimiter } from '@litert/concurrent';

const limiter = new TokenBucketRateLimiter({
    capacity: 5,
    refillIntervalMs: 1000,
});

for (let i = 0; i < 5; ++i) {
    limiter.challenge();
}

limiter.call(() => { return; }); // This will throw an error, because the bucket is empty.
```

### LeakyBucketRateLimiter

The `LeakyBucketRateLimiter` class can be used to limit the rate of function calls,
with a leaky bucket algorithm.

```ts
import { LeakyBucketRateLimiter } from '@litert/concurrent';

const limiter = new LeakyBucketRateLimiter({
    leakIntervalMs: 200,
    capacity: 5,
});

await Promise.allSettled([
    limiter.call(() => { console.log('A'); }), // This will be executed immediately.
    limiter.call(() => { console.log('B'); }), // This will be executed after 200ms.
    limiter.call(() => { console.log('C'); }), // This will be executed after 400ms.
    limiter.call(() => { console.log('D'); }), // This will be executed after 600ms.
    limiter.call(() => { console.log('E'); }), // This will be executed after 800ms.
    limiter.call(() => { console.log('F'); }), // This will throw an error, because the bucket is full.
]);

```

## MemoryMutex

The `MemoryMutex` class can be used to create a mutex lock in memory.

```ts
import { MemoryMutex } from '@litert/concurrent';

const mutex = new MemoryMutex();

if (!mutex.lock()) {
    throw new Error('Failed to acquire the mutex lock.');
}

try {
    // do something protected by the mutex
}
finally {
    mutex.unlock();
}
```

## Documentation

- [en-US](https://litert.org/projects/utils.js/api-docs/concurrent/)

## License

This library is published under [Apache-2.0](https://github.com/litert/utils.js/blob/master/LICENSE) license.
