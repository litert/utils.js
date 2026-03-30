# Class `PromiseController<T, TError>`

Source: [PromiseController.ts](https://github.com/litert/utils.js/blob/master/packages/partials/async/src/Classes/PromiseController.ts)

Decouples a Promise's `resolve` and `reject` callbacks from the promise itself. Instead of creating a Promise and capturing its settlement functions in closure variables, you instantiate a `PromiseController` and access `.resolve`, `.reject`, and `.promise` as public properties.

Optionally accepts a timeout: if the promise is not settled within `timeoutMs` milliseconds, a [`E_TIMEOUT`](../Errors.md#e_timeout) is thrown.

[TOC]

## Import

```ts
import { PromiseController } from '@litert/utils-async';
```

## Constructor

```ts
new PromiseController<T = unknown, TError = unknown>(timeoutMs?: number)
```

### Parameters

- Parameter `timeoutMs?: number` (default: `0`) — Optional timeout in milliseconds. Pass `0` (or omit) for no timeout. If the promise is not settled before this duration, it rejects with `E_TIMEOUT`.

### Error Handling

- `TypeError` — Thrown if `timeoutMs` is not a safe integer or is negative.
- `E_TIMEOUT` — Rejects the `.promise` if the timeout fires.

## Properties

| Name | Type | Description |
|------|------|-------------|
| `promise` | `Promise<T>` | The controlled promise. **Always attach a rejection handler.** |
| `resolve` | `IPromiseResolver<T>` | Resolves the promise. Safe to call multiple times (only the first call has effect). |
| `reject` | `IPromiseRejecter<TError>` | Rejects the promise. Safe to call multiple times (only the first call has effect). |

## Examples

### Decouple producer from consumer

```ts
import { PromiseController } from '@litert/utils-async';

const pc = new PromiseController<string>();

// Consumer:
pc.promise.then(val => console.log('Got:', val)).catch(console.error);

// Producer (somewhere else):
setTimeout(() => pc.resolve('hello'), 1000);
```

### With timeout

```ts
import { PromiseController, E_TIMEOUT } from '@litert/utils-async';

const pc = new PromiseController<string>(2000);

pc.promise.catch(e => {
    if (e instanceof E_TIMEOUT) {
        console.error('Promise timed out');
    }
});

// If resolve/reject is not called within 2 seconds, promise rejects.
```
