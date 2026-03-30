# Errors — `Async`

Source: [Errors.ts](https://github.com/litert/utils.js/blob/master/packages/partials/async/src/Errors.ts)

All error classes in this module extend [`UtilityError`](../ts-types/Errors.md) from `@litert/utils-ts-types`, which provides a `context` property for structured error details and an `origin` property for the original cause.

[TOC]

## Import

```ts
import { E_TIMEOUT, E_ABORTED, E_FIBER_EXITED } from '@litert/utils-async';
```

---

## `E_TIMEOUT`

Thrown when an asynchronous operation exceeds its configured timeout. Extends `UtilityError<IAsyncErrorContext>`.

```ts
class E_TIMEOUT extends UtilityError<IAsyncErrorContext> {
    readonly name: 'timeout';
    readonly message: 'Operation timed out.';
    readonly unresolvedPromise?: Promise<unknown>;

    constructor(ctx?: IAsyncErrorContext, origin?: unknown);
}
```

### Properties

- `unresolvedPromise?: Promise<unknown>`

  A reference to the still-pending Promise when the timeout fired, if provided in the context. Use this to track or collect the eventual result of the original task.

### Usage

```ts
import { withTimeout, E_TIMEOUT } from '@litert/utils-async';

try {
    await withTimeout(1000, fetch('https://example.com/slow'));
} catch (e) {
    if (e instanceof E_TIMEOUT) {
        console.error('Timed out after 1 second');
        console.log('Still pending:', e.unresolvedPromise);
    }
}
```

---

## `E_ABORTED`

Thrown when an asynchronous operation is cancelled via an `AbortSignal`. Extends `UtilityError<IAsyncErrorContext>`.

```ts
class E_ABORTED extends UtilityError<IAsyncErrorContext> {
    readonly name: 'aborted';
    readonly message: 'Operation aborted.';

    constructor(context?: IAsyncErrorContext, origin?: unknown);

    static isAbortedError(v: unknown): boolean;
}
```

> [!NOTE]
> `instanceof E_ABORTED` also returns `true` for standard `DOMException` instances with `name === 'AbortError'`, via `Symbol.hasInstance`. Use `E_ABORTED.isAbortedError(v)` for portable checks that cover both cases.

### Static Methods

- `E_ABORTED.isAbortedError(v: unknown): boolean`

  Returns `true` if `v` is an instance of `E_ABORTED` **or** a standard `AbortError` (a `DOMException` with `name === 'AbortError'`). Useful for portably handling abort errors regardless of origin.

### Usage

```ts
import { sleep, E_ABORTED } from '@litert/utils-async';

const ac = new AbortController();
setTimeout(() => ac.abort(), 500);

try {
    await sleep(2000, ac.signal);
} catch (e) {
    if (e instanceof E_ABORTED) {
        console.log('Sleep was aborted');
    }
}
```

---

## `E_FIBER_EXITED`

Thrown when attempting to resume or interact with a fiber (`FiberController`) that has already finished execution. Extends `UtilityError<IAsyncErrorContext>`.

```ts
class E_FIBER_EXITED extends UtilityError<IAsyncErrorContext> {
    readonly name: 'fiber_exited';
    readonly message: 'Fiber has already exited.';

    constructor(context?: IAsyncErrorContext, origin?: unknown);
}
```

### Usage

```ts
import { FiberController, E_FIBER_EXITED } from '@litert/utils-async';

const fiber = new FiberController({ main: async (ctx) => { /* ... */ } });
await fiber.waitForExit();

try {
    fiber.resume(); // Fiber already exited
} catch (e) {
    if (e instanceof E_FIBER_EXITED) {
        console.error('Cannot resume: fiber has already exited');
    }
}
```
