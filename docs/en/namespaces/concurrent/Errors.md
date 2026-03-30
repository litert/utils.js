# Errors — `Concurrent`

> **Package:** `@litert/concurrent`
> **Source:** [packages/partials/concurrent/src/Errors.ts](https://github.com/litert/utils.js/blob/master/packages/partials/concurrent/src/Errors.ts) (`E_RATE_LIMITED`, `E_BREAKER_OPENED`),
> [packages/partials/concurrent/src/Classes/MemoryMutex.ts](https://github.com/litert/utils.js/blob/master/packages/partials/concurrent/src/Classes/MemoryMutex.ts) (`E_LOCK_FAILED`)

---

## `E_RATE_LIMITED`

Error thrown when a rate limiter blocks a call.

```ts
import { E_RATE_LIMITED } from '@litert/concurrent';
```

| Property | Value |
| --- | --- |
| `message` | `'The rate limit has been exceeded.'` |
| `name` | `'rate_limited'` |
| Extends | `Error` |

### Notes

- Thrown by `CountingRateLimiter`, `TokenBucketRateLimiter`, `LeakyBucketRateLimiter`, and their manager variants when a challenge fails.
- The concrete error class can be replaced via the `errorCtorOnLimited` option in each rate limiter's constructor.

---

## `E_BREAKER_OPENED`

Error thrown when a circuit breaker is open and blocks a call.

```ts
import { E_BREAKER_OPENED } from '@litert/concurrent';
```

| Property | Value |
| --- | --- |
| `message` | `'The breaker is open.'` |
| `name` | `'breaker_opened'` |
| Extends | `Error` |

### Notes

- Thrown by `ManualBreaker` and `CircuitBreaker` when `call()` is invoked while the breaker is open.
- The concrete error class can be replaced via the `errorCtorOnOpen` / `errorCtor` option in each breaker's constructor.

---

## `E_LOCK_FAILED`

Error thrown when a mutex lock cannot be acquired.

```ts
import { E_LOCK_FAILED } from '@litert/concurrent';
```

| Property | Value |
| --- | --- |
| `message` | `'Failed to acquire the lock.'` |
| `name` | `'lock_failed'` |
| Extends | `Error` |

### Notes

- Thrown by `MemoryMutex.run()` and `MemoryMutex.wrap()` when the lock is not available.
