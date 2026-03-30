# Class: `ThrottleController<T>`

> **Package:** `@litert/concurrent`
> **Import path:** `@litert/concurrent`
> **Source:** [packages/partials/concurrent/src/Classes/ThrottleController.ts](https://github.com/litert/utils.js/blob/master/packages/partials/concurrent/src/Classes/ThrottleController.ts)

Wraps an async function so that concurrent calls with the same **call ID** are
collapsed into a single in-flight promise. Any subsequent caller with the same ID
receives the same promise instead of launching a new invocation. Once the promise
settles (resolves or rejects) the entry is cleared and the next call creates a
fresh invocation.

---

## Constructor

```ts
new ThrottleController<T extends IAsyncFunction>(
    fn: T,
    callIdMaker: ((...args: Parameters<T>) => string) | null
)
```

| Parameter | Type | Description |
| --- | --- | --- |
| `fn` | `T` | The async function to throttle |
| `callIdMaker` | `((...args) => string) \| null` | Derives a string key from the call arguments. Pass `null` to use a single shared slot (all calls collapse regardless of arguments) |

---

## Properties

_No public properties._

---

## Methods

### `call(...args)`

```ts
call(...args: Parameters<T>): Promise<Awaited<ReturnType<T>>>
```

Calls the wrapped function with throttling.

- If a call with the same ID is already in flight, returns that existing promise.
- Otherwise, starts a new invocation and returns its promise.

| Parameter | Type | Description |
| --- | --- | --- |
| `...args` | `Parameters<T>` | Arguments forwarded to the wrapped function |

**Returns:** `Promise<Awaited<ReturnType<T>>>`

---

### `ThrottleController.wrap()` (static)

```ts
static wrap<T extends IAsyncFunction>(
    fn: T,
    callIdMaker: ((...args: Parameters<T>) => string) | null
): T
```

Creates a throttled version of `fn` as a plain function (same signature).

| Parameter | Type | Description |
| --- | --- | --- |
| `fn` | `T` | The function to wrap |
| `callIdMaker` | `((...args) => string) \| null` | Same as constructor parameter |

**Returns:** `T` — a function with the same signature as `fn`

---

## Example

```ts
import { ThrottleController } from '@litert/concurrent';

const fetchUser = async (id: number) => {
    // expensive fetch...
    return { id, name: 'Alice' };
};

const throttled = new ThrottleController(fetchUser, (id) => String(id));

// Both calls are made simultaneously; only one fetch runs
const [a, b] = await Promise.all([
    throttled.call(42),
    throttled.call(42),
]);

// Or use the static helper
const throttledFn = ThrottleController.wrap(fetchUser, (id) => String(id));
const result = await throttledFn(42);
```
