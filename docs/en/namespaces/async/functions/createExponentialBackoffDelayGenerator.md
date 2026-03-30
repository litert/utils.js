# Function: `createExponentialBackoffDelayGenerator()`

> **Source:** [AutoRetry.ts](https://github.com/litert/utils.js/blob/master/packages/partials/async/src/Functions/AutoRetry.ts)

## Import

```ts
import { createExponentialBackoffDelayGenerator } from '@litert/utils-async';
```

## Signature

```ts
function createExponentialBackoffDelayGenerator(
    base?: number,
    factor?: number,
): IRetryDelayGenerator;
```

## Description

Creates a delay generator that returns `base * factor^attempt` for each attempt number. Use this with [`compositeRetryDelayGenerator()`](./compositeRetryDelayGenerator.md) or directly in an `autoRetry` `beforeRetry` callback.

## Parameters

- Parameter `base?: number` (default: `1000`) — Base delay in milliseconds for attempt 0.
- Parameter `factor?: number` (default: `2`) — Multiplier applied for each successive attempt.

## Return Value

An [`IRetryDelayGenerator`](../Typings.md#iretrydelaygenerator) function that accepts an attempt number and returns the computed delay in milliseconds.

## Error Handling

- `RangeError` — Thrown by the returned generator if `attempt` is negative or non-integer.

## Example

```ts
import { createExponentialBackoffDelayGenerator } from '@litert/utils-async';

const gen = createExponentialBackoffDelayGenerator(100, 2);
gen(0); // 100
gen(1); // 200
gen(2); // 400
gen(3); // 800
```
