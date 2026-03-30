# Function: `fullJitter()`

> **Source:** [AutoRetry.ts](https://github.com/litert/utils.js/blob/master/packages/partials/async/src/Functions/AutoRetry.ts)

## Import

```ts
import { fullJitter } from '@litert/utils-async';
```

## Signature

```ts
function fullJitter(delay: number): number;
```

## Description

Returns a uniformly random value in `[0, delay)`. Use this as the `jitter` option in [`compositeRetryDelayGenerator()`](./compositeRetryDelayGenerator.md) to spread retries evenly across the full delay window.

## Parameters

- Parameter `delay: number` — The upper bound (exclusive) for the random delay in milliseconds.

## Return Value

A random number in the range `[0, delay)`.

## Example

```ts
import { fullJitter } from '@litert/utils-async';

fullJitter(1000); // random number in [0, 1000)
```
