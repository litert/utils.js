# Class: `SlideWindowCounter`

> **Package:** `@litert/concurrent`
> **Import path:** `@litert/concurrent`
> **Source:** [packages/partials/concurrent/src/Classes/SlideWindowCounter.ts](https://github.com/litert/utils.js/blob/master/packages/partials/concurrent/src/Classes/SlideWindowCounter.ts)

A counter backed by a sliding time window. The window is divided into `windowQty`
sub-windows of equal duration. Counts in expired sub-windows are automatically
discarded when any method is called. The total represents only counts recorded
within the current sliding window.

Also implements [`ICounter`](../Typings.md#icounter), so it can be used directly
with [`CountingRateLimiter`](./CountingRateLimiter.md) and
[`CircuitBreaker`](./CircuitBreaker.md).

---

## Constructor

```ts
new SlideWindowCounter(options?: ISlideWindowCounterOptions)
```

See [`ISlideWindowCounterOptions`](#interface-islidewindowcounteroptions).

**Throws:**
- `Error` — if `windowQty` or `windowSizeMs` is not a positive safe integer.

---

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `windowSize` | `number` (readonly) | Total window duration in milliseconds |
| `windowQty` | `number` (readonly) | Number of sub-windows |

---

## Methods

### `getTotal()`

```ts
getTotal(): number
```

Returns the total count across all active (non-expired) sub-windows.

---

### `increase(step?)`

```ts
increase(step?: number): void
```

Increments the count in the current sub-window.

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `step` | `number?` | `1` | Amount to add |

---

### `reset()`

```ts
reset(): void
```

Clears all sub-window data, resetting the total to zero.

---

### `getWindows()`

```ts
getWindows(): ReadonlyArray<{ time: number; count: number }>
```

Returns a snapshot of the current sub-windows, each with a `time` (start
timestamp) and `count`.

---

## Scoped Types

### Interface `ISlideWindowCounterOptions`

> Source: [SlideWindowCounter.ts](https://github.com/litert/utils.js/blob/master/packages/partials/concurrent/src/Classes/SlideWindowCounter.ts)

```ts
import type { ISlideWindowCounterOptions } from '@litert/concurrent';
```

```ts
interface ISlideWindowCounterOptions {
    windowSizeMs?: number;
    windowQty?: number;
}
```

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `windowSizeMs` | `number?` | `10000` | Total slide window duration in milliseconds |
| `windowQty` | `number?` | `3` | Number of sub-windows to divide the total window into |

---

## Example

```ts
import { SlideWindowCounter } from '@litert/concurrent';

const counter = new SlideWindowCounter({
    windowSizeMs: 10_000, // 10-second window
    windowQty: 5,          // divided into five 2-second sub-windows
});

counter.increase();
counter.increase(3);

console.log(counter.getTotal()); // 4
```
