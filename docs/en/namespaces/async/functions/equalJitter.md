# Function: `equalJitter()`

> **Source:** [AutoRetry.ts](https://github.com/litert/utils.js/blob/master/packages/partials/async/src/Functions/AutoRetry.ts)

## Import

```ts
import { equalJitter } from '@litert/utils-async';
```

## Signature

```ts
function equalJitter(delay: number): number;
```

## Description

Returns a uniformly random value in `[delay / 2, delay)`. Use this as the `jitter` option in [`compositeRetryDelayGenerator()`](./compositeRetryDelayGenerator.md) to add jitter while guaranteeing a minimum half-delay wait.

## Parameters

- Parameter `delay: number` — The input delay in milliseconds. The result is always at least `delay / 2`.

## Return Value

A random number in the range `[delay / 2, delay)`.

## Example

```ts
import { equalJitter } from '@litert/utils-async';

equalJitter(1000); // random number in [500, 1000)
```
