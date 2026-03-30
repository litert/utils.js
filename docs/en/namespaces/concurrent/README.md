# Namespace `Concurrent`

> **Package:** `@litert/concurrent`
> **Import path:** `@litert/concurrent`
> **Source:** [packages/partials/concurrent/src/](https://github.com/litert/utils.js/blob/master/packages/partials/concurrent/src/)

The `Concurrent` namespace provides utilities for managing concurrent operations,
including throttling, debouncing, rate limiting, circuit breaking, mutexes, and
fiber pools.

## Install

Use this namespace only:

```bash
npm i @litert/concurrent
```

Or install the full bundle:

```bash
npm i @litert/utils
```

And then import from it.

```ts
import * as LibUtils from '@litert/utils';
const mutex = new LibUtils.Concurrent.MemoryMutex();

// or
import { Concurrent as LibConcurrent } from '@litert/utils';
const mutex = new LibConcurrent.MemoryMutex();
```

---

## Errors

| Symbol | Description |
| --- | --- |
| [`E_RATE_LIMITED`](Errors.md#e_rate_limited) | Thrown when a rate limiter blocks a call |
| [`E_BREAKER_OPENED`](Errors.md#e_breaker_opened) | Thrown when a circuit/manual breaker is open |
| [`E_LOCK_FAILED`](Errors.md#e_lock_failed) | Thrown when a mutex lock cannot be acquired |

---

## Typings

See [Typings.md](Typings.md) for shared interfaces used across multiple APIs.

| Name | Description |
| --- | --- |
| [`ICounter`](./Typings.md#icounter) | Generic counter interface used by `CountingRateLimiter` and `CircuitBreaker`. |
| [`ISimpleFn`](./Typings.md#isimplefn) | Type for a zero-parameter function. |
| [`IBreaker`](./Typings.md#ibreaker) | Interface implemented by all circuit breaker classes. |
| [`ISyncRateLimiter`](./Typings.md#isyncratelimiter) | Interface for synchronous rate limiters. |
| [`ISyncRateLimiterManager`](./Typings.md#isyncratelimitermanager) | Interface for managing per-key synchronous rate limiters. |
| [`IAsyncRateLimiter`](./Typings.md#iasyncratelimiter) | Interface for asynchronous rate limiters. |
| [`IAsyncRateLimiterManager`](./Typings.md#iasyncratelimitermanager) | Interface for managing per-key asynchronous rate limiters. |

Class-specific option and event interfaces are documented on each class's page.

---

## Classes

### Flow Control

| Class | Description |
| --- | --- |
| [`ThrottleController<T>`](./classes/ThrottleController.md) | Throttles concurrent async function calls — deduplicates in-flight calls by ID |
| [`DebounceController`](./classes/DebounceController.md) | Debounces a function call with optional max-delay cap |
| [`BatchBuffer<T>`](./classes/BatchBuffer.md) | Buffers items and delivers them in batches on timer or capacity |

### Counters & Rate Limiters

| Class | Description |
| --- | --- |
| [`SlideWindowCounter`](./classes/SlideWindowCounter.md) | Sliding time-window counter divided into sub-windows |
| [`CountingRateLimiter`](./classes/CountingRateLimiter.md) | Sync rate limiter backed by any `ICounter` |
| [`TokenBucketRateLimiter`](./classes/TokenBucketRateLimiter.md) | Sync rate limiter using the token-bucket algorithm |
| [`LeakyBucketRateLimiter`](./classes/LeakyBucketRateLimiter.md) | Async rate limiter using the leaky-bucket algorithm |
| [`TokenBucketRateLimiterManager`](./classes/TokenBucketRateLimiterManager.md) | Per-key token-bucket manager |
| [`LeakyBucketRateLimiterManager`](./classes/LeakyBucketRateLimiterManager.md) | Per-key leaky-bucket manager |

### Synchronization

| Class | Description |
| --- | --- |
| [`MemoryMutex`](./classes/MemoryMutex.md) | In-memory mutex with optional reentrant support |
| [`FiberPool`](./classes/FiberPool.md) | Pool of `FiberController` workers for concurrent task execution |

### Circuit Breakers

| Class | Description |
| --- | --- |
| [`ManualBreaker`](./classes/ManualBreaker.md) | Manually controlled circuit breaker |
| [`CircuitBreaker`](./classes/CircuitBreaker.md) | Automatic circuit breaker with half-open recovery |
