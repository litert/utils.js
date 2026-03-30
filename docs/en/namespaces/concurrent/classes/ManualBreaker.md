# Class: `ManualBreaker`

> **Package:** `@litert/concurrent`
> **Import path:** `@litert/concurrent`
> **Source:** [packages/partials/concurrent/src/Classes/ManualBreaker.ts](https://github.com/litert/utils.js/blob/master/packages/partials/concurrent/src/Classes/ManualBreaker.ts)
> **Extends:** `EventEmitter`
> **Implements:** [`IBreaker`](../Typings.md#ibreaker)

A manually controlled circuit breaker. The breaker starts closed (allowing all
calls) by default. Call `open()` to block all traffic and `close()` to resume it.

---

## Constructor

```ts
new ManualBreaker(
    closedByDefault?: boolean,
    errorCtor?: IConstructor<Error>
)
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `closedByDefault` | `boolean?` | `true` | Initial state: `true` = closed (passing), `false` = open (blocking) |
| `errorCtor` | `IConstructor<Error>?` | `E_BREAKER_OPENED` | Error class to throw when open |

---

## Methods

### `close()`

```ts
close(): void
```

Closes the breaker — subsequent calls to `call()` will pass through.

---

### `open()`

```ts
open(): void
```

Opens the breaker — subsequent calls to `call()` will throw.

---

### `isClosed()`

```ts
isClosed(): boolean
```

Returns `true` if the breaker is closed (passing).

---

### `isOpened()`

```ts
isOpened(): boolean
```

Returns `true` if the breaker is open (blocking).

---

### `call(cb)`

```ts
call<TFn extends ISimpleFn>(cb: TFn): ReturnType<TFn>
```

Calls `cb` if the breaker is closed; throws otherwise.

**Throws:** `E_BREAKER_OPENED` (or custom error) when the breaker is open.

---

### `wrap(cb)`

```ts
wrap<T extends ISimpleFn>(cb: T): T
```

Returns a wrapper function that passes calls through the breaker on every
invocation.

---

## Example

```ts
import { ManualBreaker } from '@litert/concurrent';

const breaker = new ManualBreaker();

function handleRequest() {
    try {
        breaker.call(() => processRequest());
    } catch {
        return serviceUnavailable();
    }
}

// During maintenance
breaker.open();
// Resume after maintenance
breaker.close();
```
