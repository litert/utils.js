# Function `autoRetry`

Source: [AutoRetry.ts](https://github.com/litert/utils.js/blob/master/packages/partials/async/src/Functions/AutoRetry.ts)

Automatically retries a failing async function up to a configurable number of times. Between attempts, an optional `beforeRetry` callback is invoked — use it for delay, logging, or early-exit logic. When all retries are exhausted, the last error is re-thrown.

[TOC]

## Import

```ts
import { autoRetry, DEFAULT_BEFORE_RETRY } from '@litert/utils-async';
```

## Signature

```ts
async function autoRetry<TResult>(opts: IRetryOptions<TResult>): Promise<TResult>;
```

## Parameters

- Parameter `opts: IRetryOptions<TResult>`

  See [`IRetryOptions`](#interface-iretryoptions).

## Return Value

The result of the first successful invocation of `opts.function`.

## Error Handling

- `TypeError` — Thrown synchronously if `opts.maxRetries` is not a positive integer.
- `E_ABORTED` — Thrown if the abort signal fires during execution. The retry loop stops immediately and the error is propagated.
- Any error from `opts.beforeRetry` (non-abort) — Propagated immediately, stopping the retry loop.
- Last error from `opts.function` — Re-thrown when all retries are exhausted.

## Scoped Types

### Interface `IRetryOptions<TResult>`

> Source: [AutoRetry.ts](https://github.com/litert/utils.js/blob/master/packages/partials/async/src/Functions/AutoRetry.ts)

```ts
import type { IRetryOptions } from '@litert/utils-async';
```

Options for the `autoRetry` function.

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `maxRetries` | `number` | Yes | — | Maximum number of retries **after** the first call fails. Must be a positive integer. |
| `function` | `(context: IRetryContext) => Promise<TResult>` | Yes | — | The async function to try. Receives an `IRetryContext` object. |
| `beforeRetry` | `IBeforeRetryCallback` | No | [`DEFAULT_BEFORE_RETRY`](#constant-default_before_retry) | Called before each retry. Throw to stop retrying. Use it for delay, logging, or condition checks. |
| `signal` | `AbortSignal` | No | — | Optional abort signal to cancel the retry loop. |

---

### Interface `IRetryContext`

> Source: [AutoRetry.ts](https://github.com/litert/utils.js/blob/master/packages/partials/async/src/Functions/AutoRetry.ts)

```ts
import type { IRetryContext } from '@litert/utils-async';
```

Context passed to the `function` and `beforeRetry` callbacks of `autoRetry`.

| Property | Type | Description |
| --- | --- | --- |
| `retriedTimes` | `number` | How many retries have been performed so far (`0` on the first call). |
| `error` | `unknown` | The last error thrown by the main function (`null` on the first call). |
| `signal` | `AbortSignal?` | The abort signal passed in `IRetryOptions.signal`. |

---

### Type Alias `IBeforeRetryCallback`

> Source: [AutoRetry.ts](https://github.com/litert/utils.js/blob/master/packages/partials/async/src/Functions/AutoRetry.ts)

```ts
import type { IBeforeRetryCallback } from '@litert/utils-async';
```

The type of the callback called before each retry attempt. Throwing an error stops the retry loop.

```ts
type IBeforeRetryCallback = (context: IRetryContext) => void | Promise<void>;
```

---

## Scoped Constants

### Constant `DEFAULT_BEFORE_RETRY`

> Source: [AutoRetry.ts](https://github.com/litert/utils.js/blob/master/packages/partials/async/src/Functions/AutoRetry.ts)

```ts
import { DEFAULT_BEFORE_RETRY } from '@litert/utils-async';
```

The default `beforeRetry` callback used by `autoRetry` when no custom `beforeRetry` is provided. Applies exponential backoff with full jitter, capped at 30 seconds:

- Base delay: 1 000 ms
- Multiplier: 2× per attempt
- Jitter: full (uniform random in `[0, delay)`)
- Max delay: 30 000 ms

```ts
const DEFAULT_BEFORE_RETRY: IBeforeRetryCallback;
```

---

## Examples

### Basic retry

```ts
import { autoRetry } from '@litert/utils-async';

const result = await autoRetry({
    maxRetries: 5,
    function: async (ctx) => {
        if (ctx.retriedTimes > 0) {
            console.log(`Retry #${ctx.retriedTimes}`);
        }
        return await fetchData();
    },
});
```

### Custom delay with abort support

```ts
import { autoRetry, sleep, createExponentialBackoffDelayGenerator, compositeRetryDelayGenerator, fullJitter } from '@litert/utils-async';

const ac = new AbortController();

const genDelay = compositeRetryDelayGenerator({
    delayGenerator: createExponentialBackoffDelayGenerator(500, 2),
    jitter: fullJitter,
    maxDelay: 10000,
});

const result = await autoRetry({
    maxRetries: 10,
    signal: ac.signal,
    function: async () => fetchData(),
    beforeRetry: async (ctx) => {
        console.log(`Retry #${ctx.retriedTimes + 1}, last error: ${ctx.error}`);
        await sleep(genDelay(ctx.retriedTimes), ctx.signal);
    },
});
```
