# Function `sleep`

Source: [Sleep.ts](https://github.com/litert/utils.js/blob/master/packages/partials/async/src/Functions/Sleep.ts)

Pauses execution for a specified number of milliseconds. Safe for durations longer than `2147483647` ms (~24.8 days) — the JavaScript `setTimeout` maximum. Optionally accepts an `AbortSignal` to cancel the sleep early.

[TOC]

## Import

```ts
import { sleep } from '@litert/utils-async';
```

## Signature

```ts
async function sleep(delayMs: number, signal?: AbortSignal): Promise<void>;
```

## Parameters

- Parameter `delayMs: number`

  Duration to sleep in milliseconds. Must be a non-negative safe integer.

- Parameter `signal?: AbortSignal`

  Optional abort signal. If the signal fires before the delay expires, the sleep is cancelled and the promise rejects with [`E_ABORTED`](../Errors.md#e_aborted).

## Return Value

A `Promise<void>` that resolves after `delayMs` milliseconds.

## Error Handling

- `TypeError` — Thrown (not rejected) if `delayMs` is not a non-negative safe integer.
- `E_ABORTED` — The promise rejects if the `signal` fires before the sleep completes. If the signal was already aborted when `sleep` is called, it rejects immediately.

## Examples

```ts
import { sleep } from '@litert/utils-async';

// Simple delay
await sleep(1000); // waits 1 second

// Abortable sleep
const ac = new AbortController();
setTimeout(() => ac.abort(), 500);

await sleep(2000, ac.signal); // resolves after ~500ms due to abort
```
