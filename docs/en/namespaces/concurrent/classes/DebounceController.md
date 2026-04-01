# Class: `DebounceController`

> **Package:** `@litert/concurrent`
> **Import path:** `@litert/concurrent`
> **Source:** [packages/partials/concurrent/src/Classes/DebounceController.ts](https://github.com/litert/utils.js/blob/master/packages/partials/concurrent/src/Classes/DebounceController.ts)
> **Extends:** `EventEmitter<IDebounceControllerEvents>`

Wraps a zero-argument function and ensures it is called only once after a quiet
period (`delayMs`) with no new `schedule()` calls. An optional `maxDelayMs` cap
forces the call even if new schedules keep arriving.

---

## Constructor

```ts
new DebounceController(opts: IDebounceOptions)
```

See [`IDebounceOptions`](#interface-idebounceoptions).

**Throws:**
- `RangeError` — if `delayMs` is not a positive safe integer.
- `RangeError` — if `maxDelayMs` is less than `delayMs`.

---

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `delayMs` | `number` (readonly) | Quiet-period delay in milliseconds |
| `maxDelayMs` | `number` (readonly) | Maximum total delay; defaults to `Number.MAX_SAFE_INTEGER` |

---

## Methods

### `schedule()`

```ts
schedule(): void
```

Schedules (or re-schedules) the debounced function call. Resets the `delayMs`
timer. If `maxDelayMs` has already elapsed since the first `schedule()`, the
function is called immediately.

---

### `cancel()`

```ts
cancel(): void
```

Cancels any pending scheduled call. Has no effect if nothing is scheduled.

---

### `isScheduled()`

```ts
isScheduled(): boolean
```

Returns `true` if a call is currently scheduled.

---

### `callNow()`

```ts
callNow(): void
```

Immediately cancels any scheduled timer and calls the wrapped function
synchronously.

---

### `DebounceController.wrap()` (static)

```ts
static wrap(opts: IDebounceOptions): IDebouncingFunction
```

Creates a standalone wrapper function. Calling the returned function is
equivalent to calling `schedule()` on a `DebounceController` instance.

**Returns:** `() => void`

---

## Events

### Event `'error'`

The `'error'` event is emitted when the wrapped function throws during a scheduled execution triggered by `schedule()`. Errors thrown by `callNow()` are rethrown directly instead of being emitted.

> [!WARNING]
> To prevent unhandled exceptions that may crash the program, you MUST ALWAYS listen on the `'error'` event.

```ts
type IErrorEventCallback = (error: unknown) => void;
```

### Event `'triggered'`

The `'triggered'` event is emitted after the wrapped function has been invoked by `schedule()` or `callNow()`. It is emitted in a `finally` block, so it still fires even if the wrapped function throws.

```ts
type ITriggeredEventCallback = () => void;
```

---

## Scoped Types

### Interface `IDebounceOptions`

> Source: [DebounceController.ts](https://github.com/litert/utils.js/blob/master/packages/partials/concurrent/src/Classes/DebounceController.ts)

```ts
import type { IDebounceOptions } from '@litert/concurrent';
```

```ts
interface IDebounceOptions {
    function: IDebouncingFunction;
    delayMs: number;
    maxDelayMs?: number;
}
```

| Property | Type | Description |
| --- | --- | --- |
| `function` | `() => void` | The function to debounce |
| `delayMs` | `number` | Milliseconds to wait after the last `schedule()` call |
| `maxDelayMs` | `number?` | Hard deadline — triggers immediately if elapsed exceeds this; default `Number.MAX_SAFE_INTEGER` |

---

### Interface `IDebounceControllerEvents`

> Source: [DebounceController.ts](https://github.com/litert/utils.js/blob/master/packages/partials/concurrent/src/Classes/DebounceController.ts)

```ts
import type { IDebounceControllerEvents } from '@litert/concurrent';
```

```ts
interface IDebounceControllerEvents {
    'error': [error: unknown];
    'triggered': [];
}
```

| Event | Payload | Description |
| --- | --- | --- |
| `'error'` | `error: unknown` | Emitted when the debounced function throws |
| `'triggered'` | — | Emitted after the debounced function runs successfully |

---

### Type Alias `IDebouncingFunction`

> Source: [DebounceController.ts](https://github.com/litert/utils.js/blob/master/packages/partials/concurrent/src/Classes/DebounceController.ts)

```ts
import type { IDebouncingFunction } from '@litert/concurrent';
```

```ts
type IDebouncingFunction = () => void;
```

The type for functions that can be wrapped by `DebounceController`.

---

## Example

```ts
import { DebounceController } from '@litert/concurrent';

const dc = new DebounceController({
    function: () => console.log('Saved!'),
    delayMs: 500,
    maxDelayMs: 2000,
});

dc.on('triggered', () => console.log('Function ran'));

input.addEventListener('keyup', () => dc.schedule());

// Or use the static helper for a simpler API
const save = DebounceController.wrap({
    function: () => saveDocument(),
    delayMs: 300,
});
```

