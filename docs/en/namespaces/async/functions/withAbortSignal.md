# Function `withAbortSignal`

Source: [WithAbortSignal.ts](https://github.com/litert/utils.js/blob/master/packages/partials/async/src/Functions/WithAbortSignal.ts)

Wraps an async task with an `AbortSignal`. If the signal fires before the task settles, the returned promise rejects with an [`E_ABORTED`](../Errors.md#e_aborted).

> The underlying task **continues running** after the signal fires. To truly cancel it, the task itself must observe the signal.

[TOC]

## Import

```ts
import { withAbortSignal } from '@litert/utils-async';
```

## Signature

```ts
function withAbortSignal<T>(
    signal: AbortSignal,
    asyncTask: Promise<T> | (() => Promise<T>),
    opts?: IWithAbortSignalOptions<T>,
): Promise<T>;
```

## Parameters

- Parameter `signal: AbortSignal`

  The abort signal to observe. If already aborted when called, rejects immediately.

- Parameter `asyncTask: Promise<T> | (() => Promise<T>)`

  The task to run. When the task is a factory function, it is called immediately. If `signal` is already aborted and `asyncTask` is a factory function, it is **not** called.

- Parameter `opts?: IWithAbortSignalOptions<T>`

  Optional. See [`IWithAbortSignalOptions`](#interface-iwithabort-signal-options).

## Return Value

The resolved value of `asyncTask` if it completes before the signal fires.

## Error Handling

- `E_ABORTED` — Rejected if the signal fires. `.context.unresolvedPromise` holds the still-running task, or `undefined` if the signal was already aborted before the task started.

## Scoped Types

### Interface `IWithAbortSignalOptions<T>`

> Source: [WithAbortSignal.ts](https://github.com/litert/utils.js/blob/master/packages/partials/async/src/Functions/WithAbortSignal.ts)

```ts
import type { IWithAbortSignalOptions } from '@litert/utils-async';
```

Options for the `withAbortSignal` function.

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `collectResult` | `(error: unknown \| null, result?: T) => void` | No | Called with the task's eventual result after the abort signal fires. If the task eventually succeeds, `error` is `null` and `result` holds the value. If it fails, `error` holds the reason. |

---

## Examples

```ts
import { withAbortSignal, E_ABORTED } from '@litert/utils-async';

const ac = new AbortController();
setTimeout(() => ac.abort(), 1000);

try {
    const result = await withAbortSignal(ac.signal, () => longRunningTask());
} catch (e) {
    if (e instanceof E_ABORTED) {
        console.log('Task was aborted');
    }
}
```
