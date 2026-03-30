# Class `FiberController<T>`

Source: [FiberController.ts](https://github.com/litert/utils.js/blob/master/packages/partials/async/src/Classes/FiberController.ts)

Controls the lifecycle of an async "fiber" — a long-running async task that can pause itself (`ctx.sleep()`), be resumed externally (`controller.resume()`), and be aborted at any time (`controller.abort()`).

Useful for implementing idle-wait loops, worker-pool members, or any pattern where an async function needs to wait for an external signal to continue.

[TOC]

## Import

```ts
import { FiberController } from '@litert/utils-async';
```

## Constructor

```ts
new FiberController<T = null>(options: IFiberOptions<T>)
```

Starts the fiber execution immediately on construction. The fiber runs `options.main(ctx)` and exits when that function returns or throws.

### Parameters

- Parameter `options: IFiberOptions<T>` — See [`IFiberOptions`](#type-alias-ifiberoptions).

## Properties

| Name | Type | Description |
|------|------|-------------|
| `data: T` | `T` | The shared data object passed to the fiber. |

## Methods

### `isSleeping`

```ts
isSleeping(): boolean;
```

Returns `true` if the fiber is currently paused in `ctx.sleep()`.

### `isRunning`

```ts
isRunning(): boolean;
```

Returns `true` if the fiber execution is currently active (not sleeping and not exited).

### `isExited`

```ts
isExited(): boolean;
```

Returns `true` if the fiber has finished execution (returned or thrown).

### `resume`

```ts
resume(): boolean;
```

Resumes a sleeping fiber. Returns `true` if the fiber was sleeping and was successfully resumed; `false` otherwise.

### `abort`

```ts
abort(): void;
```

Aborts the fiber by triggering its internal `AbortSignal`. If the fiber is sleeping, it will wake up and receive the abort signal. The fiber execution is responsible for observing the signal and exiting gracefully.

### `waitForExit`

```ts
waitForExit(): Promise<void>;
```

Returns a Promise that resolves when the fiber exits.

### `waitForSleep`

```ts
waitForSleep(): Promise<void>;
```

Returns a Promise that resolves the next time the fiber calls `ctx.sleep()`.

## Scoped Types

### Interface `IFiberContext<T>`

> Source: [FiberController.ts](https://github.com/litert/utils.js/blob/master/packages/partials/async/src/Classes/FiberController.ts)

```ts
import type { IFiberContext } from '@litert/utils-async';
```

The context object passed to the fiber execution function.

| Property/Method | Type | Description |
| --- | --- | --- |
| `data` | `T` | Shared data between the fiber and the controller. |
| `signal` | `AbortSignal` | Abort signal for the fiber. Pass to other async operations to support cancellation. |
| `sleep()` | `() => Promise<void>` | Suspends the fiber until [`FiberController.resume`](#resume) is called. Throws if the fiber has been aborted. |

---

### Type Alias `IFiberExecution<T>`

> Source: [FiberController.ts](https://github.com/litert/utils.js/blob/master/packages/partials/async/src/Classes/FiberController.ts)

```ts
import type { IFiberExecution } from '@litert/utils-async';
```

The signature of the function passed as `main` when creating a `FiberController`.

```ts
type IFiberExecution<T = IDict> = (ctx: IFiberContext<T>) => Promise<void>;
```

---

### Type Alias `IFiberOptions<T>`

> Source: [FiberController.ts](https://github.com/litert/utils.js/blob/master/packages/partials/async/src/Classes/FiberController.ts)

```ts
import type { IFiberOptions } from '@litert/utils-async';
```

Constructor options for `FiberController<T>`.

```ts
// When T is null:
type IFiberOptions<null> = { main: IFiberExecution<null>; data?: null };

// When T is not null:
type IFiberOptions<T> = { main: IFiberExecution<T>; data: T };
```

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `main` | `IFiberExecution<T>` | Yes | The async function that runs as the fiber body. |
| `data` | `T` | When `T` is not `null` | Shared data object accessible via `ctx.data`. |

---

## Examples

```ts
import { FiberController } from '@litert/utils-async';

interface IWorkerData {
    queue: string[];
}

const fiber = new FiberController<IWorkerData>({
    data: { queue: [] },
    main: async (ctx) => {
        while (true) {
            while (ctx.data.queue.length > 0) {
                const item = ctx.data.queue.shift()!;
                console.log('Processing:', item);
            }

            // Wait for more work
            try {
                await ctx.sleep();
            } catch {
                // Aborted
                break;
            }
        }
    },
});

// Submit work and resume the fiber
fiber.data.queue.push('task-1');
fiber.resume();

// Eventually shut down
fiber.abort();
await fiber.waitForExit();
```
