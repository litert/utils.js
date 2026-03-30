# Function `withTimeout`

Source: [WithTimeout.ts](https://github.com/litert/utils.js/blob/master/packages/partials/async/src/Functions/WithTimeout.ts)

Wraps an async task with a deadline. If the task does not settle within `timeoutMs` milliseconds, the returned promise rejects with an [`E_TIMEOUT`](../Errors.md#e_timeout).

> The underlying task **continues running** after a timeout. If you need true cancellation, use [`AbortTimeoutController`](../classes/AbortTimeoutController.md) and pass the signal into the task.

[TOC]

## Import

```ts
import { withTimeout } from '@litert/utils-async';
```

## Signature

```ts
async function withTimeout<T>(
    timeoutMs: number,
    asyncTask: Promise<T> | (() => Promise<T>),
    opts?: IWithTimeoutOptions<T>,
): Promise<T>;
```

## Parameters

- Parameter `timeoutMs: number`

  Maximum wait time in milliseconds.

- Parameter `asyncTask: Promise<T> | (() => Promise<T>)`

  The task to run. Can be an already-started Promise, or a factory function that returns one (called immediately).

- Parameter `opts?: IWithTimeoutOptions<T>`

  Optional. See [`IWithTimeoutOptions`](#interface-iwithtimeoutoptions).

## Return Value

The resolved value of `asyncTask` if it completes before the timeout.

## Error Handling

- `E_TIMEOUT` — Rejected if the task exceeds `timeoutMs`. The `.unresolvedPromise` property holds a reference to the still-pending task.
- Any error thrown by `asyncTask` — Re-thrown if the task fails before the timeout.

## Scoped Types

### Interface `IWithTimeoutOptions<T>`

> Source: [WithTimeout.ts](https://github.com/litert/utils.js/blob/master/packages/partials/async/src/Functions/WithTimeout.ts)

```ts
import type { IWithTimeoutOptions } from '@litert/utils-async';
```

Options for the `withTimeout` function.

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `collectResult` | `(error: unknown \| null, result?: T) => void` | No | Called with the eventual outcome of the underlying task **after** the timeout fires. Use this if you care about the late-arriving result or error. If the task eventually succeeds, `error` is `null` and `result` holds the value. If it fails, `error` holds the reason. |

---

## Examples

```ts
import { withTimeout, E_TIMEOUT } from '@litert/utils-async';

// With a factory function
try {
    const result = await withTimeout(5000, () => fetch('https://api.example.com/data'));
    console.log(result);
} catch (e) {
    if (e instanceof E_TIMEOUT) {
        console.error('Request timed out');
    }
}

// Collect the late result
const result = await withTimeout(1000, longTask(), {
    collectResult: (err, val) => {
        if (!err) console.log('Late result:', val);
    },
}).catch(() => null);
```
