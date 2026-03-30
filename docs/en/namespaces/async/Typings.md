# Typings — `Async`

TypeScript interfaces and type aliases exported from `@litert/utils-async` that are shared across multiple APIs.

[TOC]

## Import

```ts
import type {
    IPromiseResolver, IPromiseRejecter,
    IRetryDelayGenerator, IRetryDelayJitterFunction, IRetryDelayOptions,
} from '@litert/utils-async';
```

---

## `IPromiseResolver<T>`

Source: [Typings.ts](https://github.com/litert/utils.js/blob/master/packages/partials/async/src/Typings.ts)

Function signature type for a Promise's resolve callback.

```ts
type IPromiseResolver<T = unknown> = (value?: T | PromiseLike<T>) => void;
```

---

## `IPromiseRejecter<T>`

Source: [Typings.ts](https://github.com/litert/utils.js/blob/master/packages/partials/async/src/Typings.ts)

Function signature type for a Promise's reject callback.

```ts
type IPromiseRejecter<T = unknown> = (reason: T) => void;
```

---

## `IRetryDelayGenerator`

Source: [Typings.ts](https://github.com/litert/utils.js/blob/master/packages/partials/async/src/Typings.ts)

A function that returns the delay in milliseconds for a given retry attempt number (0-indexed). Used by [`createExponentialBackoffDelayGenerator`](./functions/createExponentialBackoffDelayGenerator.md) and [`compositeRetryDelayGenerator`](./functions/compositeRetryDelayGenerator.md).

```ts
interface IRetryDelayGenerator {
    (attempt: number): number;
}
```

---

## `IRetryDelayJitterFunction`

Source: [Typings.ts](https://github.com/litert/utils.js/blob/master/packages/partials/async/src/Typings.ts)

A function that applies randomization (jitter) to a raw delay value. Used by [`fullJitter`](./functions/fullJitter.md), [`equalJitter`](./functions/equalJitter.md), and [`compositeRetryDelayGenerator`](./functions/compositeRetryDelayGenerator.md).

```ts
interface IRetryDelayJitterFunction {
    (delay: number): number;
}
```

---

## `IRetryDelayOptions`

Source: [Typings.ts](https://github.com/litert/utils.js/blob/master/packages/partials/async/src/Typings.ts)

Options for [`compositeRetryDelayGenerator`](./functions/compositeRetryDelayGenerator.md).

```ts
interface IRetryDelayOptions {
    delayGenerator: IRetryDelayGenerator;
    jitter: IRetryDelayJitterFunction;
    maxDelay: number;
}
```

| Property | Type | Description |
| --- | --- | --- |
| `delayGenerator` | `IRetryDelayGenerator` | Base delay generator (e.g., exponential backoff). |
| `jitter` | `IRetryDelayJitterFunction` | Jitter function to apply on top of the raw delay. |
| `maxDelay` | `number` | Upper bound on the final delay in milliseconds. |

