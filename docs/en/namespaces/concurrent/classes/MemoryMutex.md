# Class: `MemoryMutex`

> **Package:** `@litert/concurrent`
> **Import path:** `@litert/concurrent`
> **Source:** [packages/partials/concurrent/src/Classes/MemoryMutex.ts](https://github.com/litert/utils.js/blob/master/packages/partials/concurrent/src/Classes/MemoryMutex.ts)

A lightweight in-memory mutex. Multiple instances can share the same lock by
calling `share()` — each shared instance gets a unique lock identifier and
competes for access without accidentally releasing a lock held by another instance.

---

## Constructor

```ts
new MemoryMutex(opts?: IMemoryMutexOptions)
```

See [`IMemoryMutexOptions`](#interface-imemorymutexoptions).

---

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `reentrant` | `boolean` (readonly) | Whether the mutex allows the same instance to re-acquire an already held lock |

---

## Methods

### `lock()`

```ts
lock(): boolean
```

Attempts to acquire the lock.

- If the mutex is unlocked, acquires it and returns `true`.
- If the mutex is held by this same instance **and** `reentrant` is `true`, returns `true`.
- If the mutex is held by another instance (or by this instance when `reentrant` is `false`), returns `false`.

**Returns:** `boolean` — `true` if the lock was acquired.

---

### `unlock()`

```ts
unlock(): boolean
```

Releases the lock if it is held by this instance.

**Returns:** `boolean` — `true` if successfully released.

---

### `isLocked()`

```ts
isLocked(): boolean
```

Returns `true` if the mutex is currently locked by any instance.

---

### `share()`

```ts
share(): MemoryMutex
```

Returns a new `MemoryMutex` instance that shares the same underlying lock state.
The new instance has its own unique lock identifier, so it can compete for the
same lock without conflicting with the original.

---

### `run(fn)`

```ts
run<T extends IFunction>(fn: T): ReturnType<T>
```

Acquires the lock, calls `fn`, then releases the lock.

**Throws:** `E_LOCK_FAILED` if the lock cannot be acquired.

---

### `wrap(fn)`

```ts
wrap<T extends IFunction>(fn: T): T
```

Returns a wrapper function that acquires the lock before each call and releases
it after.

**Throws:** `E_LOCK_FAILED` on each call if the lock cannot be acquired.

---

## Scoped Types

### Interface `IMemoryMutexOptions`

> Source: [MemoryMutex.ts](https://github.com/litert/utils.js/blob/master/packages/partials/concurrent/src/Classes/MemoryMutex.ts)

```ts
import type { IMemoryMutexOptions } from '@litert/concurrent';
```

```ts
interface IMemoryMutexOptions {
    reentrant?: boolean;
}
```

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `reentrant` | `boolean?` | `false` | If `true`, the same instance can re-acquire the lock it already holds |

---

## Example

```ts
import { MemoryMutex } from '@litert/concurrent';

const mutex = new MemoryMutex();

if (mutex.lock()) {
    try {
        doExclusiveWork();
    } finally {
        mutex.unlock();
    }
} else {
    console.log('Could not acquire lock');
}

// Using run() for automatic lock management
mutex.run(() => {
    doExclusiveWork();
});

// Sharing the lock across two instances
const mutexA = new MemoryMutex();
const mutexB = mutexA.share();

mutexA.lock();     // true
mutexB.lock();     // false — same underlying lock, different ID
mutexA.unlock();
mutexB.lock();     // true now
```
