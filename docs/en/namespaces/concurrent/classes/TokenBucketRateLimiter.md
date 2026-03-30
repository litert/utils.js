# Class: `TokenBucketRateLimiter`

> **Package:** `@litert/concurrent`
> **Import path:** `@litert/concurrent`
> **Source:** [packages/partials/concurrent/src/Classes/TokenBucketRateLimiter.ts](https://github.com/litert/utils.js/blob/master/packages/partials/concurrent/src/Classes/TokenBucketRateLimiter.ts)
> **Implements:** [`ISyncRateLimiter`](../Typings.md#isyncratelimiter)

A synchronous rate limiter using the **token bucket** algorithm. The bucket holds
up to `capacity` tokens. One token is consumed per call; one token is restored
every `refillIntervalMs` milliseconds (up to `capacity`). If no tokens are
available, the call is rejected immediately.

---

## Constructor

```ts
new TokenBucketRateLimiter(opts: ITokenBucketRateLimiterOptions)
```

See [`ITokenBucketRateLimiterOptions`](#interface-itokenbucketratelimiteroptions).

**Throws:**
- `TypeError` — if `capacity` or `refillIntervalMs` is not a positive safe integer.
- `TypeError` — if `initialTokens` is outside `[0, capacity]`.

---

## Methods

### `challenge()`

```ts
challenge(): void
```

Consumes one token. Throws if no tokens remain.

**Throws:** `E_RATE_LIMITED` (or custom error).

---

### `isBlocking()`

```ts
isBlocking(): boolean
```

Returns `true` when the bucket currently has zero tokens (after a lazy refill).

---

### `isIdle()`

```ts
isIdle(): boolean
```

Returns `true` when the bucket is full (no tokens have been consumed since the
last full refill).

---

### `call(fn)`

```ts
call<TFn extends IFunction>(fn: TFn): ReturnType<TFn>
```

Calls `fn` after a successful `challenge()`.

---

### `reset()`

```ts
reset(): void
```

Refills the bucket to `capacity` immediately.

---

### `wrap(fn)`

```ts
wrap<T extends IFunction>(fn: T): T
```

Returns a wrapper function that challenges the bucket before every call.

---

## Scoped Types

### Interface `ITokenBucketRateLimiterOptions`

> Source: [TokenBucketRateLimiter.ts](https://github.com/litert/utils.js/blob/master/packages/partials/concurrent/src/Classes/TokenBucketRateLimiter.ts)

```ts
import type { ITokenBucketRateLimiterOptions } from '@litert/concurrent';
```

```ts
interface ITokenBucketRateLimiterOptions {
    capacity: number;
    initialTokens?: number;
    refillIntervalMs: number;
    errorCtorOnLimited?: IConstructor<Error>;
}
```

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `capacity` | `number` | — | Max token count in the bucket |
| `initialTokens` | `number?` | `capacity` | Starting token count |
| `refillIntervalMs` | `number` | — | Milliseconds per token refill |
| `errorCtorOnLimited` | `IConstructor<Error>?` | `E_RATE_LIMITED` | Custom error class |

---

## Example

```ts
import { TokenBucketRateLimiter } from '@litert/concurrent';

const limiter = new TokenBucketRateLimiter({
    capacity: 10,
    refillIntervalMs: 100, // one token every 100ms
});

try {
    limiter.challenge();
    processRequest();
} catch {
    console.log('Too many requests');
}
```
