# Class: `CircuitBreaker`

> **Package:** `@litert/concurrent`
> **Import path:** `@litert/concurrent`
> **Source:** [packages/partials/concurrent/src/Classes/CircuitBreaker.ts](https://github.com/litert/utils.js/blob/master/packages/partials/concurrent/src/Classes/CircuitBreaker.ts)
> **Extends:** `EventEmitter<ICircuitBreakerEvents>`
> **Implements:** [`IBreaker`](../Typings.md#ibreaker)

An automatic circuit breaker with three states:

- **Closed** — all calls pass through; failures are counted.
- **Opened** — all calls throw immediately; after `cooldownTimeMs`, transitions
  to Half-Open.
- **Half-Opened** — one probe call passes through; if it succeeds
  (`warmupThreshold` consecutive successes), the breaker closes; if it fails, it
  re-opens.

Failure counting uses a sliding-window counter (default: 10-second window, 6
sub-windows). Inject a custom `ICounter` instance via the `counter` option to
change the counting strategy.

---

## Constructor

```ts
new CircuitBreaker(opts?: ICircuitBreakerOptions)
```

See [`ICircuitBreakerOptions`](#interface-icircuitbreakeroptions).

---

## Methods

### `call(fn)`

```ts
call<TFn extends ISimpleFn>(fn: TFn): ReturnType<TFn>
```

Calls `fn` according to the current breaker state.

- **Closed:** calls `fn`; counts the failure if it throws and `isFailure` returns `true`.
- **Opened:** throws immediately without calling `fn`.
- **Half-Opened:** lets the call through as a probe; updates state on result.

**Throws:** `E_BREAKER_OPENED` (or custom error) when open.

---

### `open(until?)`

```ts
open(until?: number): void
```

Manually opens the breaker.

| Parameter | Type | Description |
| --- | --- | --- |
| `until` | `number?` | Unix timestamp (ms) when the cooldown ends; defaults to `Date.now() + cooldownTimeMs` |

---

### `close()`

```ts
close(): void
```

Manually closes the breaker (resetting failure counter).

---

### `isOpened()`

```ts
isOpened(): boolean
```

Returns `true` if the breaker is currently in the open state.

---

### `isClosed()`

```ts
isClosed(): boolean
```

Returns `true` if the breaker is in the closed state.

---

### `isHalfOpened()`

```ts
isHalfOpened(): boolean
```

Returns `true` if the breaker is in the half-open state.

---

### `wrap(fn)`

```ts
wrap<T extends ISimpleFn>(fn: T): T
```

Returns a wrapper function that passes each call through the breaker.

---

## Events

### Event `'error'`

The `'error'` event is emitted when an internal error occurs that the breaker cannot handle by itself.

> [!WARNING]
> To prevent unhandled exceptions that may crash the program, you MUST ALWAYS listen on the `'error'` event.

```ts
type IErrorEventCallback = (error: unknown) => void;
```

### Event `'opened'`

The `'opened'` event is emitted when the breaker transitions into the OPENED state, either because `open()` is called or because failures reached the configured threshold.

```ts
type IOpenedEventCallback = () => void;
```

### Event `'half_opened'`

The `'half_opened'` event is emitted when the breaker leaves the OPENED state after the cooldown period and starts allowing warm-up calls.

```ts
type IHalfOpenedEventCallback = () => void;
```

### Event `'closed'`

The `'closed'` event is emitted when the breaker transitions back to the CLOSED state, either because `close()` is called or because enough warm-up calls succeeded.

```ts
type IClosedEventCallback = () => void;
```

---

## Scoped Types

### Interface `ICircuitBreakerOptions`

> Source: [CircuitBreaker.ts](https://github.com/litert/utils.js/blob/master/packages/partials/concurrent/src/Classes/CircuitBreaker.ts)

```ts
import type { ICircuitBreakerOptions } from '@litert/concurrent';
```

```ts
interface ICircuitBreakerOptions {
    cooldownTimeMs?: number;
    breakThreshold?: number;
    warmupThreshold?: number;
    isFailure?: (error: unknown) => boolean;
    errorCtorOnOpen?: IConstructor<Error>;
    counter?: ICounter;
}
```

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `cooldownTimeMs` | `number?` | `60000` | Time (ms) after which the breaker enters half-open state |
| `breakThreshold` | `number?` | `5` | Failure count to trigger open state |
| `warmupThreshold` | `number?` | `3` | Consecutive successes needed to close from half-open |
| `isFailure` | `(err) => boolean?` | `() => true` | Determines whether a thrown error counts as a failure |
| `errorCtorOnOpen` | `IConstructor<Error>?` | `E_BREAKER_OPENED` | Custom error class |
| `counter` | `ICounter?` | `SlideWindowCounter({ windowSizeMs: 10000, windowQty: 6 })` | Custom counter for failure tracking |

---

### Interface `ICircuitBreakerEvents`

> Source: [CircuitBreaker.ts](https://github.com/litert/utils.js/blob/master/packages/partials/concurrent/src/Classes/CircuitBreaker.ts)

```ts
import type { ICircuitBreakerEvents } from '@litert/concurrent';
```

```ts
interface ICircuitBreakerEvents {
    'error': [error: unknown];
    'opened': [];
    'half_opened': [];
    'closed': [];
}
```

| Event | Payload | Description |
| --- | --- | --- |
| `'error'` | `error: unknown` | Emitted when the guarded function throws (failures counted) |
| `'opened'` | — | Emitted when the breaker transitions to open state |
| `'half_opened'` | — | Emitted when the breaker enters half-open state |
| `'closed'` | — | Emitted when the breaker returns to closed (normal) state |

---

## Example

```ts
import { CircuitBreaker } from '@litert/concurrent';

const breaker = new CircuitBreaker({
    breakThreshold: 5,   // open after 5 failures within the window
    cooldownTimeMs: 30_000,
    warmupThreshold: 2,  // need 2 consecutive successes to close again
    isFailure: (err) => !(err instanceof NotFoundError), // don't count 404s
});

breaker.on('opened',      () => console.log('Circuit opened'));
breaker.on('half_opened', () => console.log('Circuit half-open (probing)'));
breaker.on('closed',      () => console.log('Circuit closed'));

function callDownstream() {
    try {
        return breaker.call(() => downstream.fetch());
    } catch (e) {
        if (e instanceof E_BREAKER_OPENED) {
            return cachedResponse();
        }
        throw e;
    }
}
```
