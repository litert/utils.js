# Function: `compositeRetryDelayGenerator()`

> **Source:** [AutoRetry.ts](https://github.com/litert/utils.js/blob/master/packages/partials/async/src/Functions/AutoRetry.ts)

## Import

```ts
import { compositeRetryDelayGenerator } from '@litert/utils-async';
```

## Signature

```ts
function compositeRetryDelayGenerator(opts: IRetryDelayOptions): IRetryDelayGenerator;
```

## Description

Composes a base delay generator with an optional jitter function and an upper-bound cap, returning a new `IRetryDelayGenerator`. This is the recommended way to build production retry delay strategies.

## Parameters

- Parameter `opts: IRetryDelayOptions` — See [`IRetryDelayOptions`](../Typings.md#iretrydelayoptions).

## Return Value

A new [`IRetryDelayGenerator`](../Typings.md#iretrydelaygenerator) that applies jitter and caps the result at `opts.maxDelay`.

## Example

```ts
import {
    autoRetry,
    compositeRetryDelayGenerator,
    createExponentialBackoffDelayGenerator,
    fullJitter,
    sleep,
} from '@litert/utils-async';

const genDelay = compositeRetryDelayGenerator({
    delayGenerator: createExponentialBackoffDelayGenerator(1000, 2),
    jitter: fullJitter,
    maxDelay: 30000,
});

await autoRetry({
    maxRetries: 10,
    function: () => fetchData(),
    beforeRetry: async (ctx) => {
        await sleep(genDelay(ctx.retriedTimes));
    },
});
```
