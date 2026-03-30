# Class: `TokenBucketRateLimiterManager`

> **Package:** `@litert/concurrent`
> **Import path:** `@litert/concurrent`
> **Source:** [packages/partials/concurrent/src/Classes/TokenBucketRateLimiterManager.ts](https://github.com/litert/utils.js/blob/master/packages/partials/concurrent/src/Classes/TokenBucketRateLimiterManager.ts)
> **Implements:** [`ISyncRateLimiterManager`](../Typings.md#isyncratelimitermanager)

Manages a collection of per-key token-bucket rate limiters. Each unique key
gets its own bucket with shared configuration. Idle buckets can be cleaned up
automatically or on demand.

---

## Constructor

```ts
new TokenBucketRateLimiterManager(opts: ITokenBucketRateLimiterManagerOptions)
```

See [`ITokenBucketRateLimiterManagerOptions`](#interface-itokenbucketratelimitermanageroptions).

**Throws:**
- `TypeError` — if `capacity` or `refillIntervalMs` is not a positive safe integer.
- `TypeError` — if `initialTokens` is outside `[0, capacity]`.

---

## Methods

### `challenge(key)`

```ts
challenge(key: string): void
```

Challenges the rate limiter for `key`. Throws if the bucket for that key has no
tokens.

**Throws:** `E_RATE_LIMITED` (or custom error).

---

### `isBlocking(key)`

```ts
isBlocking(key: string): boolean
```

Returns `true` if the bucket for `key` currently has no tokens.

---

### `call(key, fn)`

```ts
call<T extends IFunction>(key: string, fn: T): ReturnType<T>
```

Calls `fn` after a successful `challenge(key)`.

---

### `reset(key)`

```ts
reset(key: string): void
```

Refills the bucket for `key` to capacity immediately.

---

### `clean()`

```ts
clean(): void
```

Removes idle (full) bucket entries that have not been accessed for `cleanDelayMs`
milliseconds. Has no effect if `cleanDelayMs` is `0`.

---

## Scoped Types

### Interface `ITokenBucketRateLimiterManagerOptions`

> Source: [TokenBucketRateLimiterManager.ts](https://github.com/litert/utils.js/blob/master/packages/partials/concurrent/src/Classes/TokenBucketRateLimiterManager.ts)

```ts
import type { ITokenBucketRateLimiterManagerOptions } from '@litert/concurrent';
```

```ts
interface ITokenBucketRateLimiterManagerOptions {
    capacity: number;
    initialTokens?: number;
    refillIntervalMs: number;
    cleanDelayMs?: number;
    errorCtorOnLimited?: IConstructor<Error>;
}
```

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `capacity` | `number` | — | Bucket capacity per key |
| `initialTokens` | `number?` | `capacity` | Initial tokens per key |
| `refillIntervalMs` | `number` | — | Milliseconds per token refill |
| `cleanDelayMs` | `number?` | `0` | How long (ms) to keep a full, unused context before cleaning; `0` = disabled |
| `errorCtorOnLimited` | `IConstructor<Error>?` | `E_RATE_LIMITED` | Custom error class |

---

## Example

```ts
import { TokenBucketRateLimiterManager } from '@litert/concurrent';

const manager = new TokenBucketRateLimiterManager({
    capacity: 100,
    refillIntervalMs: 1000,  // one token per ms → 100 tokens per 100ms
    cleanDelayMs: 30_000,
});

function handleRequest(userId: string) {
    try {
        manager.challenge(userId);
        processRequest(userId);
    } catch {
        return tooManyRequests();
    }
}
```
