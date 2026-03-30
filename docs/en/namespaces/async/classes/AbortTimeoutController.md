# Class `AbortTimeoutController`

Source: [AbortTimeoutController.ts](https://github.com/litert/utils.js/blob/master/packages/partials/async/src/Classes/AbortTimeoutController.ts)

An `AbortController` that automatically fires (calls `abort`) after a configurable timeout, without requiring any external timeout management. Useful for limiting the maximum duration of fetch requests, stream reads, and other `AbortSignal`-aware operations.

[TOC]

## Import

```ts
import { AbortTimeoutController } from '@litert/utils-async';
```

## Constructor

```ts
new AbortTimeoutController(timeoutMs: number)
```

Starts the internal timer. When the timer fires, the `AbortSignal` is automatically aborted with the reason `'timeout'`.

### Parameters

- Parameter `timeoutMs: number` — Duration in milliseconds before the signal is automatically aborted.

## Properties

| Name | Type | Description |
|------|------|-------------|
| `signal` | `AbortSignal` | The underlying AbortSignal. Pass this to any abort-aware operation. |

## Methods

### `abort`

```ts
abort(reason: any): void;
```

Manually aborts the signal with the provided `reason` and clears the timeout. Calling this after the timeout has already fired or after `destroy()` has been called has no effect.

### `destroy`

```ts
destroy(): void;
```

Clears the internal timer without aborting the signal. Call this when the guarded operation completes successfully but before the timeout fires, to free the timer resource.

> After calling `destroy()`, neither the timer nor any additional `abort()` calls will change the signal's state.

## Examples

```ts
import { AbortTimeoutController } from '@litert/utils-async';

const atc = new AbortTimeoutController(5000); // 5 second timeout

try {
    const response = await fetch('https://example.com/api', { signal: atc.signal });
    atc.destroy(); // Clean up timer on success
    return await response.json();
} catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
        console.error('Request timed out or was aborted');
    }
    throw e;
}
```
