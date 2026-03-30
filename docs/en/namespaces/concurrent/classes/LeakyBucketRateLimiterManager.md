# Class: `LeakyBucketRateLimiterManager`

> **Package:** `@litert/concurrent`
> **Import path:** `@litert/concurrent`
> **Source:** [packages/partials/concurrent/src/Classes/LeakyBucketRateLimiterManager.ts](https://github.com/litert/utils.js/blob/master/packages/partials/concurrent/src/Classes/LeakyBucketRateLimiterManager.ts)
> **Implements:** [`IAsyncRateLimiterManager`](../Typings.md#iasyncratelimitermanager)

Manages a collection of per-key leaky-bucket rate limiters. Each key gets its
own scheduling queue so concurrent calls to different keys do not interfere.

---

## Constructor

```ts
new LeakyBucketRateLimiterManager(opts: ILeakyBucketRateLimiterManagerOptions)
```

See [`ILeakyBucketRateLimiterManagerOptions`](#interface-ileakybucketratelimitermanageroptions).

**Throws:**
- `TypeError` — if `capacity` or `leakIntervalMs` is not a positive safe integer.
- `TypeError` — if `cleanDelayMs` is negative.

---

## Methods

### `challenge(key)`

```ts
challenge(key: string): Promise<void>
```

Waits until the next available slot for `key`, then resolves. Throws if the
queue for that key is already at `capacity`.

**Throws:** `E_RATE_LIMITED` (or custom error).

---

### `isBlocking(key)`

```ts
isBlocking(key: string): boolean
```

Returns `true` if a challenge for `key` would need to wait.

---

### `call(key, fn)`

```ts
call<T extends IFunction>(key: string, fn: T): Promise<Awaited<ReturnType<T>>>
```

Awaits `challenge(key)`, then calls `fn`.

---

### `reset(key)`

```ts
reset(key: string): void
```

Resets the schedule for `key` so the next call proceeds immediately.

---

### `size()`

```ts
size(): number
```

Returns the number of active key contexts.

---

### `clean()`

```ts
clean(): void
```

Removes key contexts that are currently idle and have been so for at least
`cleanDelayMs` milliseconds.

---

## Scoped Types

### Interface `ILeakyBucketRateLimiterManagerOptions`

> Source: [LeakyBucketRateLimiterManager.ts](https://github.com/litert/utils.js/blob/master/packages/partials/concurrent/src/Classes/LeakyBucketRateLimiterManager.ts)

```ts
import type { ILeakyBucketRateLimiterManagerOptions } from '@litert/concurrent';
```

```ts
interface ILeakyBucketRateLimiterManagerOptions {
    capacity: number;
    leakIntervalMs: number;
    cleanDelayMs?: number;
    errorCtorOnLimited?: IConstructor<Error>;
}
```

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `capacity` | `number` | — | Max pending tasks per key |
| `leakIntervalMs` | `number` | — | Milliseconds per task leakage |
| `cleanDelayMs` | `number?` | `0` | Keep idle context for this long before cleaning; `0` = disabled |
| `errorCtorOnLimited` | `IConstructor<Error>?` | `E_RATE_LIMITED` | Custom error class |

---

## Example

```ts
import { LeakyBucketRateLimiterManager } from '@litert/concurrent';

const manager = new LeakyBucketRateLimiterManager({
    capacity: 5,
    leakIntervalMs: 200,
    cleanDelayMs: 10_000,
});

async function handleApiCall(userId: string) {
    await manager.challenge(userId);
    return callApi(userId);
}
```
