# Class: `FiberPool`

> **Package:** `@litert/concurrent`
> **Import path:** `@litert/concurrent`
> **Source:** [packages/partials/concurrent/src/Classes/FiberPool.ts](https://github.com/litert/utils.js/blob/master/packages/partials/concurrent/src/Classes/FiberPool.ts)
> **Extends:** `EventEmitter<IFiberPoolEvents>`

A pool of reusable [`FiberController`](../../async/classes/FiberController.md) workers.
Fibers are created on demand up to `maxFibers` and kept idle (up to `maxIdleFibers`)
for reuse. Idle fibers above `minIdleFibers` are released after `idleTimeout` ms.

---

## Constructor

```ts
new FiberPool(options: IFiberPoolOptions)
```

See [`IFiberPoolOptions`](#interface-ifiberpooloptions).

---

## Constants

| Constant | Value | Description |
| --- | --- | --- |
| `DEFAULT_MIN_IDLE_FIBERS` | `1` | Default `minIdleFibers` |
| `DEFAULT_MAX_IDLE_FIBERS` | `1` | Default `maxIdleFibers` |
| `DEFAULT_IDLE_TIMEOUT` | `10000` | Default idle timeout (ms) |
| `DEFAULT_WAIT_TIMEOUT` | `10000` | Default wait timeout for `run()` (ms) |
| `DEFAULT_MAX_WAITS` | `10` | Default max concurrent callers waiting for a free fiber |

---

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `idleFibers` | `number` (readonly) | Current number of idle fibers |
| `busyFibers` | `number` (readonly) | Current number of fibers executing a task |

---

## Methods

### `run(opts)`

```ts
run<TData, TResult>(opts: IRunOptions<TData, TResult>): Promise<TResult>
```

Picks an idle fiber (or creates a new one if under `maxFibers`), executes
`opts.function(opts.data)` inside it, and returns the result.

If all fibers are busy, waits up to `waitTimeout` ms for one to become available.
If `maxWaits` callers are already waiting, the call is rejected immediately.

| Parameter | Type | Description |
| --- | --- | --- |
| `opts` | `IRunOptions<TData, TResult>` | Task options — see [`IRunOptions`](#interface-irunoptions) |

**Returns:** `Promise<TResult>` — the value returned by `opts.function`.

**Throws:**
- `E_TIMEOUT` — if no fiber became available within `waitTimeout` ms.
- Any error thrown by `opts.function`.

---

### `close()`

```ts
close(): void
```

Closes all idle fibers and prevents new tasks from being submitted.

---

### `isClosed()`

```ts
isClosed(): boolean
```

Returns `true` if the pool has been closed.

---

## Events

### Event `'error'`

The `'error'` event is emitted when an internal error occurs that the fiber pool cannot handle by itself.

> [!WARNING]
> To prevent unhandled exceptions that may crash the program, you MUST ALWAYS listen on the `'error'` event.

```ts
type IErrorEventCallback = (error: unknown) => void;
```

---

## Scoped Types

### Interface `IFiberPoolOptions`

> Source: [FiberPool.ts](https://github.com/litert/utils.js/blob/master/packages/partials/concurrent/src/Classes/FiberPool.ts)

```ts
import type { IFiberPoolOptions } from '@litert/concurrent';
```

```ts
interface IFiberPoolOptions {
    maxFibers: number;
    maxIdleFibers?: number;
    minIdleFibers?: number;
    idleTimeout?: number;
    defaultWaitTimeout?: number;
    maxWaits?: number;
}
```

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `maxFibers` | `number` | — | Maximum total fibers (idle + busy) |
| `maxIdleFibers` | `number?` | `1` | Maximum idle fibers to keep alive |
| `minIdleFibers` | `number?` | `1` | Minimum idle fibers — never closed even after idle timeout |
| `idleTimeout` | `number?` | `10000` | Milliseconds before an idle fiber above `minIdleFibers` is released |
| `defaultWaitTimeout` | `number?` | `10000` | Default wait timeout for `run()` when no fiber is available |
| `maxWaits` | `number?` | `10` | Maximum concurrent waiters for a free fiber |

---

### Interface `IRunOptions<TData, TResult>`

> Source: [FiberPool.ts](https://github.com/litert/utils.js/blob/master/packages/partials/concurrent/src/Classes/FiberPool.ts)

```ts
import type { IRunOptions } from '@litert/concurrent';
```

```ts
interface IRunOptions<TData, TResult> {
    waitTimeout?: number;
    data: TData;
    function: IFiberFunction<TData, TResult>;
}
```

| Property | Type | Description |
| --- | --- | --- |
| `waitTimeout` | `number?` | Override `defaultWaitTimeout` for this call |
| `data` | `TData` | Argument passed to `function` |
| `function` | `(data: TData) => Promise<TResult>` | The task to run inside the fiber |

---

### Interface `IFiberPoolEvents`

> Source: [FiberPool.ts](https://github.com/litert/utils.js/blob/master/packages/partials/concurrent/src/Classes/FiberPool.ts)

```ts
import type { IFiberPoolEvents } from '@litert/concurrent';
```

```ts
interface IFiberPoolEvents {
    'error': [error: unknown];
}
```

| Event | Payload | Description |
| --- | --- | --- |
| `'error'` | `error: unknown` | Emitted when a fiber encounters an unhandled error |

---

### Type Alias `IFiberFunction<TData, TResult>`

> Source: [FiberPool.ts](https://github.com/litert/utils.js/blob/master/packages/partials/concurrent/src/Classes/FiberPool.ts)

```ts
import type { IFiberFunction } from '@litert/concurrent';
```

```ts
type IFiberFunction<TData, TResult> = (data: TData) => Promise<TResult>;
```

The type for async functions executed inside a `FiberPool` fiber.

---

## Example

```ts
import { FiberPool } from '@litert/concurrent';

const pool = new FiberPool({
    maxFibers: 4,
    maxIdleFibers: 2,
    minIdleFibers: 1,
});

const result = await pool.run({
    data: { userId: 42 },
    function: async ({ userId }) => {
        return fetchUser(userId);
    },
});

console.log(result);

pool.close();
```
