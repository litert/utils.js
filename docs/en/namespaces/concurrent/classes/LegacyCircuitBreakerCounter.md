# Class ~~`LegacyCircuitBreakerCounter`~~ (⚠️Deprecated)

> **Package:** `@litert/concurrent`
> **Import path:** `@litert/concurrent` / `@litert/concurrent/class/CircuitBreaker`
> **Source:** [CircuitBreaker.LegacyCounter.ts](https://github.com/litert/utils.js/blob/master/packages/partials/concurrent/src/Classes/CircuitBreaker/CircuitBreaker.LegacyCounter.ts)
> **Implements:** [`ICircuitBreakerCounter`](./CircuitBreaker.md#interface-icircuitbreakercounter)

> [!WARNING]
> This class is deprecated. Use [`ErrorRateCircuitBreakerCounter`](./ErrorRateCircuitBreakerCounter.md) for error-rate-based triggering, or implement a custom [`ICircuitBreakerCounter`](./CircuitBreaker.md#interface-icircuitbreakercounter).

A count-based request counter for [`CircuitBreaker`](./CircuitBreaker.md). This counter only tracks the number of failed requests and reports blocked when the failure count reaches a configurable threshold.

This class is provided for backward compatibility with the legacy `breakThreshold` / `counter` constructor options.

---

## Import

```ts
import { LegacyCircuitBreakerCounter } from '@litert/concurrent';
// or
import { LegacyCircuitBreakerCounter } from '@litert/concurrent/class/CircuitBreaker';
```

---

## Constructor

### Signature

```ts
new LegacyCircuitBreakerCounter(threshold?: number, counter?: ICounter): LegacyCircuitBreakerCounter;
```

### Parameters

- Parameter `threshold: number` (Optional)

  The number of failures needed to open the circuit breaker. Defaults to `5`.

- Parameter `counter: ICounter` (Optional)

  The sliding window counter used to track failures. Defaults to `new SlideWindowCounter({ windowSizeMs: 10000, windowQty: 6 })`.

---

## Methods

### Method `record`

Records the result of a request. Only increments the internal counter when `success` is `false`; successful requests are ignored.

#### Signature

```ts
record(success: boolean): void
```

---

### Method `isBlocked`

Returns `true` if the failure count has reached or exceeded the configured threshold.

#### Signature

```ts
isBlocked(): boolean
```

---

### Method `reset`

Resets the internal failure counter to its initial state.

#### Signature

```ts
reset(): void
```

---

## Example

### Equivalent to legacy `breakThreshold` option

```ts
import { CircuitBreaker, LegacyCircuitBreakerCounter } from '@litert/concurrent';

// This:
const breaker = new CircuitBreaker({
    requestCounter: new LegacyCircuitBreakerCounter(5),
    cooldownTimeMs: 30_000,
});

// Is equivalent to the deprecated:
// const breaker = new CircuitBreaker({
//     breakThreshold: 5,
//     cooldownTimeMs: 30_000,
// });
```
