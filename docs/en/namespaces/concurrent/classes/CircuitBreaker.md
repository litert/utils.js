# Class `CircuitBreaker`

> **Package:** `@litert/concurrent`
> **Import path:** `@litert/concurrent` / `@litert/concurrent/class/CircuitBreaker`
> **Source:** [CircuitBreaker.Impl.ts](https://github.com/litert/utils.js/blob/master/packages/partials/concurrent/src/Classes/CircuitBreaker/CircuitBreaker.Impl.ts)
> **Extends:** `EventEmitter<ICircuitBreakerEvents>`
> **Implements:** [`IBreaker`](../Typings.md#ibreaker)

An automatic circuit breaker with three states:

- **Closed** — all calls pass through; the request counter records successes and failures.
- **Opened** — all calls throw immediately; after `cooldownTimeMs`, transitions to Half-Open.
- **Half-Opened** — warm-up calls pass through; if enough consecutive successes are recorded (`warmupThreshold`), the breaker closes; if any call fails, it re-opens.

Failure counting is fully delegated to an [`ICircuitBreakerCounter`](#interface-icircuitbreakercounter) implementation. Two built-in counters are provided:

- [`ErrorRateCircuitBreakerCounter`](./ErrorRateCircuitBreakerCounter.md) — triggers based on error rate (recommended for new code).
- [`LegacyCircuitBreakerCounter`](./LegacyCircuitBreakerCounter.md) — triggers based on absolute failure count (backward-compatible).

You can also implement a custom counter by conforming to the `ICircuitBreakerCounter` interface.

---

## Import

```ts
import { CircuitBreaker } from '@litert/concurrent';
// or
import { CircuitBreaker } from '@litert/concurrent/class/CircuitBreaker';
```

---

## Constructor

### Signature

```ts
new CircuitBreaker(options?: ICircuitBreakerOptions): CircuitBreaker;
```

### Parameters

- Parameter `options: ICircuitBreakerOptions` (Optional)

  The constructor options. See [`ICircuitBreakerOptions`](#interface-icircuitbreakeroptions) for the full type definition. All fields are optional except `requestCounter`.

  | Option | Type | Default | Description |
  | --- | --- | --- | --- |
  | `requestCounter` | `ICircuitBreakerCounter` | *(required)* | The counter that records request results and determines when to open the breaker |
  | `cooldownTimeMs` | `number?` | `60000` | Time (ms) after which the breaker enters half-open state |
  | `warmupThreshold` | `number?` | `3` | Consecutive successes needed to close from half-open |
  | `isFailure` | `(err) => boolean?` | `() => true` | Determines whether a thrown error counts as a failure |
  | `errorCtorOnOpen` | `IConstructor<Error>?` | `E_BREAKER_OPENED` | Custom error class thrown when the breaker is open |

### Error Handling

- `TypeError` — Thrown when `cooldownTimeMs` or `warmupThreshold` is not a positive integer, or when `isFailure` / `errorCtorOnOpen` is not a function.

---

## Methods

### Method `call`

Calls `fn` according to the current breaker state.

- **Closed:** calls `fn`; records success or failure via the request counter. If the counter reports blocked, the breaker opens.
- **Opened:** throws immediately without calling `fn` (unless the cooldown has expired, in which case it transitions to half-open and proceeds).
- **Half-Opened:** lets the call through as a warm-up probe; updates state on result.

#### Signature

```ts
call<TFn extends ISimpleFn>(fn: TFn): ReturnType<TFn>
```

#### Parameters

- Parameter `fn: TFn`

  The function to be called. Must be a zero-argument function (sync or async).

#### Return Value

Returns the result of `fn()`.

#### Error Handling

- Throws the error configured by `errorCtorOnOpen` (default: [`E_BREAKER_OPENED`](../Errors.md#e_breaker_opened)) when the breaker is open and the cooldown has not expired.
- Re-throws any error thrown by `fn()` (after recording it as a failure).

#### Example

```ts
import { CircuitBreaker, ErrorRateCircuitBreakerCounter } from '@litert/concurrent';

const breaker = new CircuitBreaker({
    requestCounter: new ErrorRateCircuitBreakerCounter({
        errorRateThreshold: 0.5,
        minRequest: 10,
    }),
    cooldownTimeMs: 30_000,
});

try {
    const result = breaker.call(() => fetch('/api/data'));
} catch (e) {
    if (e instanceof E_BREAKER_OPENED) {
        return cachedResponse();
    }
    throw e;
}
```

---

### Method `open`

Manually opens the breaker, regardless of its current state. Resets all internal counters.

#### Signature

```ts
open(until?: number): void
```

#### Parameters

- Parameter `until: number` (Optional)

  Unix timestamp (ms) when the cooldown ends. Defaults to `Date.now() + cooldownTimeMs`.

---

### Method `close`

Manually closes the breaker, regardless of its current state. Resets all internal counters.

#### Signature

```ts
close(): void
```

---

### Method `isOpened`

Returns `true` if the breaker is currently in the open state. If the cooldown has expired, this method also triggers the transition to half-open state.

#### Signature

```ts
isOpened(): boolean
```

---

### Method `isClosed`

Returns `true` if the breaker is in the closed state.

#### Signature

```ts
isClosed(): boolean
```

---

### Method `isHalfOpened`

Returns `true` if the breaker is in the half-open state. If the breaker is in the open state and the cooldown has expired, this method triggers the transition to half-open state.

#### Signature

```ts
isHalfOpened(): boolean
```

---

### Method `wrap`

Returns a wrapper function that passes each call through the breaker.

#### Signature

```ts
wrap<T extends ISimpleFn>(fn: T): T
```

#### Parameters

- Parameter `fn: T`

  The function to be wrapped.

#### Example

```ts
const fetchWithBreaker = breaker.wrap(() => fetch('/api/data'));
// fetchWithBreaker() behaves exactly like breaker.call(() => fetch('/api/data'))
```

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

The `'opened'` event is emitted when the breaker transitions into the OPENED state, either because `open()` is called or because the request counter reported blocked.

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

> Source: [CircuitBreaker.Typings.ts](https://github.com/litert/utils.js/blob/master/packages/partials/concurrent/src/Classes/CircuitBreaker/CircuitBreaker.Typings.ts)

```ts
import type { ICircuitBreakerOptions } from '@litert/concurrent';
```

```ts
interface ICircuitBreakerOptions {
    requestCounter: ICircuitBreakerCounter;
    cooldownTimeMs?: number;
    warmupThreshold?: number;
    isFailure?: (error: unknown) => boolean;
    errorCtorOnOpen?: IConstructor<Error>;
}
```

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `requestCounter` | `ICircuitBreakerCounter` | *(required)* | The counter for recording request results and determining when to open the breaker. Use a built-in counter or implement a custom one. |
| `cooldownTimeMs` | `number?` | `60000` | Time (ms) after which the breaker enters half-open state |
| `warmupThreshold` | `number?` | `3` | Consecutive successes needed to close from half-open |
| `isFailure` | `(err) => boolean?` | `() => true` | Determines whether a thrown error counts as a failure |
| `errorCtorOnOpen` | `IConstructor<Error>?` | `E_BREAKER_OPENED` | Custom error class thrown when the breaker is open |

---

### Interface `ICircuitBreakerCounter`

> Source: [CircuitBreaker.Typings.ts](https://github.com/litert/utils.js/blob/master/packages/partials/concurrent/src/Classes/CircuitBreaker/CircuitBreaker.Typings.ts)

```ts
import type { ICircuitBreakerCounter } from '@litert/concurrent';
```

The interface for request counters used by `CircuitBreaker`. All logic related to counting requests and determining whether the circuit breaker should open is encapsulated in the counter. `CircuitBreaker` delegates to the counter via `record()`, `reset()`, and `isBlocked()`.

```ts
interface ICircuitBreakerCounter {
    record(success: boolean): void;
    reset(): void;
    isBlocked(): boolean;
}
```

| Method | Description |
| --- | --- |
| `record(success)` | Records the result of a request. Called by `CircuitBreaker` on every completed call. |
| `reset()` | Resets the counter to its initial state. Called by `CircuitBreaker` when the breaker opens, closes, or transitions to half-open. |
| `isBlocked()` | Returns `true` if the counter determines that the breaker should open. Called by `CircuitBreaker` after each failure in the CLOSED state. |

Built-in implementations:

- [`ErrorRateCircuitBreakerCounter`](./ErrorRateCircuitBreakerCounter.md) — triggers based on error rate.
- [`LegacyCircuitBreakerCounter`](./LegacyCircuitBreakerCounter.md) — triggers based on absolute failure count (deprecated).

---

### Interface `ICircuitBreakerEvents`

> Source: [CircuitBreaker.Typings.ts](https://github.com/litert/utils.js/blob/master/packages/partials/concurrent/src/Classes/CircuitBreaker/CircuitBreaker.Typings.ts)

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
| `'error'` | `error: unknown` | Emitted when an internal error occurs |
| `'opened'` | — | Emitted when the breaker transitions to open state |
| `'half_opened'` | — | Emitted when the breaker enters half-open state |
| `'closed'` | — | Emitted when the breaker returns to closed (normal) state |

---

## Example

### Using `ErrorRateCircuitBreakerCounter` (recommended)

```ts
import { CircuitBreaker, ErrorRateCircuitBreakerCounter } from '@litert/concurrent';

const breaker = new CircuitBreaker({
    requestCounter: new ErrorRateCircuitBreakerCounter({
        errorRateThreshold: 0.5,  // open when error rate >= 50%
        minRequest: 10,           // require at least 10 requests before evaluating
    }),
    cooldownTimeMs: 30_000,
    warmupThreshold: 2,
    isFailure: (err) => !(err instanceof NotFoundError), // don't count 404s
});

breaker.on('opened',      () => console.log('Circuit opened'));
breaker.on('half_opened', () => console.log('Circuit half-open (probing)'));
breaker.on('closed',      () => console.log('Circuit closed'));
breaker.on('error',       (e) => console.error('Internal error:', e));

function callDownstream() {
    return breaker.call(() => downstream.fetch());
}
```

### Using a custom `ICircuitBreakerCounter`

```ts
import { CircuitBreaker } from '@litert/concurrent';
import type { ICircuitBreakerCounter } from '@litert/concurrent';

class MyCounter implements ICircuitBreakerCounter {
    private _failures = 0;

    record(success: boolean): void {
        if (!success) this._failures++;
    }

    reset(): void {
        this._failures = 0;
    }

    isBlocked(): boolean {
        return this._failures >= 3;
    }
}

const breaker = new CircuitBreaker({
    requestCounter: new MyCounter(),
});
```

---

## Deprecation

> [!WARNING]
> The legacy constructor options (`breakThreshold` and `counter`) are deprecated. Use `requestCounter` with an `ICircuitBreakerCounter` implementation instead.

### Legacy Constructor Options (deprecated)

The constructor also accepts `ICircuitBreakerOptionsLegacy` for backward compatibility:

```ts
import { CircuitBreaker } from '@litert/concurrent';

// Legacy API — still works but deprecated
const breaker = new CircuitBreaker({
    breakThreshold: 5,   // open after 5 failures
    cooldownTimeMs: 30_000,
    warmupThreshold: 2,
    counter: new SlideWindowCounter({ windowSizeMs: 10000, windowQty: 6 }),
});
```

This is equivalent to:

```ts
import { CircuitBreaker, LegacyCircuitBreakerCounter, SlideWindowCounter } from '@litert/concurrent';

const breaker = new CircuitBreaker({
    requestCounter: new LegacyCircuitBreakerCounter(5, new SlideWindowCounter({
        windowSizeMs: 10000,
        windowQty: 6,
    })),
    cooldownTimeMs: 30_000,
    warmupThreshold: 2,
});
```

### Interface `ICircuitBreakerOptionsLegacy` (deprecated)

```ts
import type { ICircuitBreakerOptionsLegacy } from '@litert/concurrent';
```

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `breakThreshold` | `number?` | `5` | Failure count to trigger open state. Use `requestCounter` instead. |
| `counter` | `ICounter?` | `SlideWindowCounter(...)` | Custom counter for failure tracking. Use `requestCounter` instead. |
| `cooldownTimeMs` | `number?` | `60000` | Time (ms) after which the breaker enters half-open state |
| `warmupThreshold` | `number?` | `3` | Consecutive successes needed to close from half-open |
| `isFailure` | `(err) => boolean?` | `() => true` | Determines whether a thrown error counts as a failure |
| `errorCtorOnOpen` | `IConstructor<Error>?` | `E_BREAKER_OPENED` | Custom error class thrown when the breaker is open |
