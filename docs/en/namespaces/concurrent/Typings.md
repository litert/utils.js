# Typings — `Concurrent`

> **Package:** `@litert/concurrent`
> **Source:** [packages/partials/concurrent/src/Typings.ts](https://github.com/litert/utils.js/blob/master/packages/partials/concurrent/src/Typings.ts)

TypeScript interfaces and type aliases exported from `@litert/concurrent` that are shared across multiple APIs.

[TOC]

## Import

```ts
import type {
    ICounter, ISimpleFn, IBreaker,
    ISyncRateLimiter, ISyncRateLimiterManager,
    IAsyncRateLimiter, IAsyncRateLimiterManager,
} from '@litert/concurrent';
```

---

## `ICounter`

A generic counter interface. Used by [`CountingRateLimiter`](./classes/CountingRateLimiter.md) and [`CircuitBreaker`](./classes/CircuitBreaker.md).

```ts
interface ICounter {
    getTotal(): number;
    increase(): number;
    reset(): void;
}
```

| Method | Description |
| --- | --- |
| `getTotal()` | Returns the current total count |
| `increase()` | Increments the counter by one and returns the new total |
| `reset()` | Resets the counter to zero |

---

## `ISimpleFn`

A function that takes no parameters. Used in the `IBreaker` interface.

```ts
type ISimpleFn = IFunction<[]>;
```

---

## `IBreaker`

Interface for all circuit breaker implementations. Implemented by [`CircuitBreaker`](./classes/CircuitBreaker.md) and [`ManualBreaker`](./classes/ManualBreaker.md).

```ts
interface IBreaker {
    call<T extends ISimpleFn>(fn: T): ReturnType<T>;
    wrap<T extends ISimpleFn>(fn: T): T;
}
```

| Method | Description |
| --- | --- |
| `call<T>(fn)` | Calls `fn` if the breaker is closed; throws if open |
| `wrap<T>(fn)` | Returns a new function that passes through the breaker |

---

## `ISyncRateLimiter`

Interface for synchronous rate limiters. Implemented by [`CountingRateLimiter`](./classes/CountingRateLimiter.md) and [`TokenBucketRateLimiter`](./classes/TokenBucketRateLimiter.md).

```ts
interface ISyncRateLimiter {
    isBlocking(): boolean;
    isIdle(): boolean;
    challenge(): void;
    reset(): void;
    call<T extends IFunction>(fn: T): ReturnType<T>;
    wrap<T extends IFunction>(fn: T): T;
}
```

| Method | Description |
| --- | --- |
| `isBlocking()` | Returns `true` if the limiter is currently blocking all calls |
| `isIdle()` | Returns `true` if there is zero traffic |
| `challenge()` | Passes or throws; increments internal state on pass |
| `reset()` | Resets internal state |
| `call<T>(fn)` | Calls `fn` after a `challenge()`; throws if limited |
| `wrap<T>(fn)` | Wraps `fn` so every call goes through `challenge()` |

---

## `ISyncRateLimiterManager`

Interface for managing multiple keyed synchronous rate limiters. Implemented by [`TokenBucketRateLimiterManager`](./classes/TokenBucketRateLimiterManager.md).

```ts
interface ISyncRateLimiterManager {
    clean(): void;
    isBlocking(key: string): boolean;
    challenge(key: string): void;
    reset(key: string): void;
    call<T extends IFunction>(key: string, fn: T): ReturnType<T>;
}
```

| Method | Description |
| --- | --- |
| `clean()` | Removes unused/idle limiter contexts |
| `isBlocking(key)` | Returns `true` if `key` is currently blocked |
| `challenge(key)` | Passes or throws for `key` |
| `reset(key)` | Resets state for `key` |
| `call<T>(key, fn)` | Calls `fn` after challenging `key` |

---

## `IAsyncRateLimiter`

Interface for asynchronous rate limiters. Implemented by [`LeakyBucketRateLimiter`](./classes/LeakyBucketRateLimiter.md).

```ts
interface IAsyncRateLimiter {
    isBlocking(): boolean;
    isIdle(): boolean;
    challenge(): Promise<void>;
    reset(): void;
    call<T extends IFunction>(fn: T): Promise<Awaited<ReturnType<T>>>;
    wrap<T extends IFunction>(fn: T): IToPromise<T>;
}
```

| Method | Description |
| --- | --- |
| `isBlocking()` | Returns `true` if the limiter would cause any call to wait |
| `isIdle()` | Returns `true` if there is zero pending traffic |
| `challenge()` | Resolves (possibly after a delay) or throws if over capacity |
| `reset()` | Resets internal queue/state |
| `call<T>(fn)` | Calls `fn` after awaiting `challenge()` |
| `wrap<T>(fn)` | Wraps `fn` as an async function going through `challenge()` |

---

## `IAsyncRateLimiterManager`

Interface for managing multiple keyed asynchronous rate limiters. Implemented by [`LeakyBucketRateLimiterManager`](./classes/LeakyBucketRateLimiterManager.md).

```ts
interface IAsyncRateLimiterManager {
    isBlocking(key: string): boolean;
    challenge(key: string): Promise<void>;
    reset(key: string): void;
    clean(): void;
    call<T extends IFunction>(key: string, fn: T): Promise<Awaited<ReturnType<T>>>;
}
```

| Method | Description |
| --- | --- |
| `isBlocking(key)` | Returns `true` if `key` is currently at capacity |
| `challenge(key)` | Awaits until `key`'s slot opens, or throws if over capacity |
| `reset(key)` | Resets state for `key` |
| `clean()` | Removes idle contexts |
| `call<T>(key, fn)` | Calls `fn` after awaiting the challenge for `key` |
