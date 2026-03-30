# Class: `LeakyBucketRateLimiter`

> **Package:** `@litert/concurrent`
> **Import path:** `@litert/concurrent`
> **Source:** [packages/partials/concurrent/src/Classes/LeakyBucketRateLimiter.ts](https://github.com/litert/utils.js/blob/master/packages/partials/concurrent/src/Classes/LeakyBucketRateLimiter.ts)
> **Implements:** [`IAsyncRateLimiter`](../Typings.md#iasyncratelimiter)

An asynchronous rate limiter using the **leaky bucket** algorithm. Rather than
failing immediately, calls wait (sleep) until their scheduled slot arrives. If
the virtual queue is deeper than `capacity` slots, the call is rejected.

---

## Constructor

```ts
new LeakyBucketRateLimiter(opts: ILeakyBucketRateLimiterOptions)
```

See [`ILeakyBucketRateLimiterOptions`](#interface-ileakybucketratelimiteroptions).

**Throws:**
- `TypeError` — if `capacity` or `leakIntervalMs` is not a positive safe integer.

---

## Methods

### `challenge()`

```ts
challenge(): Promise<void>
```

Waits until the next slot is available, then resolves. Throws if the queue is
already at `capacity`.

**Throws:** `E_RATE_LIMITED` (or custom error) if over capacity.

---

### `isBlocking()`

```ts
isBlocking(): boolean
```

Returns `true` if any future challenge would need to wait (i.e. the next slot is
in the future).

---

### `isIdle()`

```ts
isIdle(): boolean
```

Returns `true` if the next slot is now or already past (no backlog).

---

### `call(fn)`

```ts
call<TFn extends IFunction>(fn: TFn): Promise<Awaited<ReturnType<TFn>>>
```

Awaits `challenge()`, then calls `fn`.

---

### `reset()`

```ts
reset(): void
```

Resets the internal schedule so the next call can proceed immediately.

---

### `wrap(fn)`

```ts
wrap<T extends IFunction>(fn: T): IToPromise<T>
```

Returns an async wrapper that awaits `challenge()` before each invocation.

---

## Scoped Types

### Interface `ILeakyBucketRateLimiterOptions`

> Source: [LeakyBucketRateLimiter.ts](https://github.com/litert/utils.js/blob/master/packages/partials/concurrent/src/Classes/LeakyBucketRateLimiter.ts)

```ts
import type { ILeakyBucketRateLimiterOptions } from '@litert/concurrent';
```

```ts
interface ILeakyBucketRateLimiterOptions {
    capacity: number;
    leakIntervalMs: number;
    errorCtorOnLimited?: IConstructor<Error>;
}
```

| Property | Type | Description |
| --- | --- | --- |
| `capacity` | `number` | Maximum pending tasks (queue depth) |
| `leakIntervalMs` | `number` | Milliseconds between each task being "leaked" through |
| `errorCtorOnLimited` | `IConstructor<Error>?` | Custom error class; defaults to `E_RATE_LIMITED` |

---

## Example

```ts
import { LeakyBucketRateLimiter } from '@litert/concurrent';

const limiter = new LeakyBucketRateLimiter({
    capacity: 5,           // at most 5 requests queued
    leakIntervalMs: 200,   // one request every 200ms
});

// Each call waits its turn
await limiter.challenge();
await sendRequest();
```
