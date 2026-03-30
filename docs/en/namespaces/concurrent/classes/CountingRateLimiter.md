# Class: `CountingRateLimiter`

> **Package:** `@litert/concurrent`
> **Import path:** `@litert/concurrent`
> **Source:** [packages/partials/concurrent/src/Classes/CountingRateLimiter.ts](https://github.com/litert/utils.js/blob/master/packages/partials/concurrent/src/Classes/CountingRateLimiter.ts)
> **Implements:** [`ISyncRateLimiter`](../Typings.md#isyncvatelimiter)

A synchronous rate limiter that delegates counting to any
[`ICounter`](../Typings.md#icounter) implementation (e.g. a
[`SlideWindowCounter`](./SlideWindowCounter.md)). The limiter blocks once the
counter's total reaches `limits`. Calling `reset()` resets the underlying counter.

---

## Constructor

```ts
new CountingRateLimiter(opts: ICountingRateLimiterOptions)
```

See [`ICountingRateLimiterOptions`](#interface-icountingratelimiteroptions).

---

## Methods

### `challenge()`

```ts
challenge(): void
```

Throws an error if the limit is reached; otherwise increments the counter by one.

**Throws:** `E_RATE_LIMITED` (or the custom error from `errorCtorOnLimited`).

---

### `isBlocking()`

```ts
isBlocking(): boolean
```

Returns `true` when the counter total is ≥ `limits`.

---

### `isIdle()`

```ts
isIdle(): boolean
```

Returns `true` when the counter total is `0`.

---

### `call(fn)`

```ts
call<TFn extends IFunction>(fn: TFn): ReturnType<TFn>
```

Calls `fn` after a successful `challenge()`.

**Returns:** The return value of `fn`.
**Throws:** Rate-limit error if blocking, or any error thrown by `fn`.

---

### `reset()`

```ts
reset(): void
```

Resets the underlying counter to zero.

---

### `wrap(fn)`

```ts
wrap<T extends IFunction>(fn: T): T
```

Returns a wrapper function that calls `challenge()` before every invocation of `fn`.

---

## Scoped Types

### Interface `ICountingRateLimiterOptions`

> Source: [CountingRateLimiter.ts](https://github.com/litert/utils.js/blob/master/packages/partials/concurrent/src/Classes/CountingRateLimiter.ts)

```ts
import type { ICountingRateLimiterOptions } from '@litert/concurrent';
```

```ts
interface ICountingRateLimiterOptions {
    limits: number;
    counter: ICounter;
    errorCtorOnLimited?: IConstructor<Error>;
}
```

| Property | Type | Description |
| --- | --- | --- |
| `limits` | `number` | Maximum count before blocking |
| `counter` | `ICounter` | The counter instance to track calls |
| `errorCtorOnLimited` | `IConstructor<Error>?` | Custom error class; defaults to `E_RATE_LIMITED` |

---

## Example

```ts
import { CountingRateLimiter, SlideWindowCounter } from '@litert/concurrent';

const counter = new SlideWindowCounter({ windowSizeMs: 1000, windowQty: 2 });
const limiter = new CountingRateLimiter({ limits: 10, counter });

try {
    limiter.challenge(); // passes and increments
    doWork();
} catch {
    console.log('Rate limited');
}

// Or wrap a function
const limitedFn = limiter.wrap(doWork);
```
