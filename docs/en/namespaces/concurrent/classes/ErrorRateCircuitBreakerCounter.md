# Class `ErrorRateCircuitBreakerCounter`

> **Package:** `@litert/concurrent`
> **Import path:** `@litert/concurrent` / `@litert/concurrent/class/CircuitBreaker`
> **Source:** [CircuitBreaker.ErrorRateCounter.ts](https://github.com/litert/utils.js/blob/master/packages/partials/concurrent/src/Classes/CircuitBreaker/CircuitBreaker.ErrorRateCounter.ts)
> **Implements:** [`ICircuitBreakerCounter`](./CircuitBreaker.md#interface-icircuitbreakercounter)

An error-rate based request counter for [`CircuitBreaker`](./CircuitBreaker.md). This counter tracks both total requests and error requests using sliding window counters, and reports blocked when the error rate exceeds a configurable threshold.

This is the recommended counter for new implementations. For backward-compatible absolute-count behavior, see [`LegacyCircuitBreakerCounter`](./LegacyCircuitBreakerCounter.md).

---

## Import

```ts
import { ErrorRateCircuitBreakerCounter } from '@litert/concurrent';
// or
import { ErrorRateCircuitBreakerCounter } from '@litert/concurrent/class/CircuitBreaker';
```

---

## Constructor

### Signature

```ts
new ErrorRateCircuitBreakerCounter(options: IErrorRateCircuitBreakerCounterOptions): ErrorRateCircuitBreakerCounter;
```

### Parameters

- Parameter `options: IErrorRateCircuitBreakerCounterOptions`

  The constructor options. See [`IErrorRateCircuitBreakerCounterOptions`](#interface-ierroRatecircuitbreakercounteroptions) for the full type definition.

  | Option | Type | Default | Description |
  | --- | --- | --- | --- |
  | `errorRateThreshold` | `number` | *(required)* | Error rate threshold to trigger the circuit break, in range `(0, 1)` exclusive |
  | `minRequest` | `number` | *(required)* | Minimum request count before evaluating the error rate, to avoid false positives on low traffic |
  | `createCounter` | `() => ICounter?` | `SlideWindowCounter(...)` | Factory function to create counter instances. Called twice — once for total requests, once for error requests. Each call must return an independent counter instance. |

### Error Handling

- `RangeError` — Thrown when `errorRateThreshold` is not in range `(0, 1)`, or when `minRequest` is not a non-negative integer.

---

## Methods

### Method `record`

Records the result of a request. Always increments the total counter; increments the error counter only when `success` is `false`.

#### Signature

```ts
record(success: boolean): void
```

---

### Method `isBlocked`

Returns `true` if the error rate has reached or exceeded the configured threshold, and the total request count is at least `minRequest`.

#### Signature

```ts
isBlocked(): boolean
```

The blocked condition is:

```
totalRequests >= minRequest AND (errorRequests / totalRequests) >= errorRateThreshold
```

---

### Method `reset`

Resets both the total and error counters to their initial state.

#### Signature

```ts
reset(): void
```

---

## Scoped Types

### Interface `IErrorRateCircuitBreakerCounterOptions`

> Source: [CircuitBreaker.ErrorRateCounter.ts](https://github.com/litert/utils.js/blob/master/packages/partials/concurrent/src/Classes/CircuitBreaker/CircuitBreaker.ErrorRateCounter.ts)

```ts
import type { IErrorRateCircuitBreakerCounterOptions } from '@litert/concurrent';
```

```ts
interface IErrorRateCircuitBreakerCounterOptions {
    errorRateThreshold: number;
    minRequest: number;
    createCounter?: () => ICounter;
}
```

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `errorRateThreshold` | `number` | *(required)* | Error rate threshold to trigger the circuit break. Must be in range `(0, 1)` exclusive. |
| `minRequest` | `number` | *(required)* | Minimum request count before evaluating the error rate. Must be a non-negative integer. Set to `0` to evaluate immediately. |
| `createCounter` | `() => ICounter?` | `SlideWindowCounter({ windowSizeMs: 10000, windowQty: 6 })` | Factory to create counter instances. Called twice to create independent counters for total and error tracking. |

---

## Example

### Basic usage with 50% error rate threshold

```ts
import { CircuitBreaker, ErrorRateCircuitBreakerCounter } from '@litert/concurrent';

const breaker = new CircuitBreaker({
    requestCounter: new ErrorRateCircuitBreakerCounter({
        errorRateThreshold: 0.5,  // open when error rate >= 50%
        minRequest: 10,           // require at least 10 requests
    }),
    cooldownTimeMs: 30_000,
});
```

### Using a custom counter factory

```ts
import { ErrorRateCircuitBreakerCounter, SlideWindowCounter } from '@litert/concurrent';

const counter = new ErrorRateCircuitBreakerCounter({
    errorRateThreshold: 0.3,
    minRequest: 20,
    createCounter: () => new SlideWindowCounter({
        windowSizeMs: 60_000,  // 1-minute window
        windowQty: 6,
    }),
});
```
