# Function `tryCatch`

> **Package:** `@litert/utils-flow-control`
> **Source:** [packages/partials/flow-control/src/Functions/TryCatch.ts](https://github.com/litert/utils.js/blob/master/packages/partials/flow-control/src/Functions/TryCatch.ts)

An expression-style `try-catch[-finally]` statement. Instead of the `try { ... } catch { ... }` syntax (which cannot be used as an expression), `tryCatch` wraps the same logic as a function call and returns the resulting value. It correctly handles all combinations of synchronous and asynchronous `try`, `catch`, and `finally` bodies — and automatically returns a `Promise` if any of the involved functions is asynchronous.

---

## Import

```ts
import { tryCatch } from '@litert/utils-flow-control';
```

---

## Signature

```ts
function tryCatch<TOk, TErr = never, TFinal extends void | Promise<void> = void>(
    opts: ITryCatchOptions<TOk, TErr, TFinal>
): ITryCatchResult<TOk, TErr, TFinal>;
```

---

## Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `opts` | `ITryCatchOptions<TOk, TErr, TFinal>` | Options object with `try`, `catch`, and optional `finally` bodies. See [ITryCatchOptions](#interface-itrycatchoptions) |

---

## Return Value

The return value of the `try` body, or the return value of the `catch` body if an error was thrown. If any body is asynchronous, a `Promise` is returned automatically.

---

## Error Handling

If the `catch` body or `finally` body throws, the error propagates to the caller normally, just as in a standard `try-catch-finally` statement.

---

## Scoped Types

### Interface `ITryCatchOptions`

> Source: [TryCatch.ts](https://github.com/litert/utils.js/blob/master/packages/partials/flow-control/src/Functions/TryCatch.ts)

```ts
import type { ITryCatchOptions } from '@litert/utils-flow-control';
```

Options for the `tryCatch` function, describing the bodies of the `try`, `catch`, and optionally `finally` clauses.

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `try` | `() => TOk` | Yes | The `try` body. May be synchronous or asynchronous. |
| `catch` | `(e: unknown) => TErr` | Yes | The `catch` body. Receives the thrown error. May be synchronous or asynchronous. The `finally` clause still runs even if `catch` throws. |
| `finally` | `() => TFinal` | No | The `finally` body. Must be synchronous. Runs after `try` or `catch` completes regardless of outcome. To avoid error-handling complexity, ensure this function does not throw. |

---

### Type Alias `ITryCatchResult`

> Source: [TryCatch.ts](https://github.com/litert/utils.js/blob/master/packages/partials/flow-control/src/Functions/TryCatch.ts)

```ts
import type { ITryCatchResult } from '@litert/utils-flow-control';
```

A utility type that computes the exact return type of `tryCatch` based on the inferred types of `TOk`, `TErr`, and `TFinal`.

- If any of `TOk`, `TErr`, or `TFinal` is a `Promise`, the result is a `Promise` of the appropriate union type.
- If all three are synchronous, the result is a synchronous union type.

```ts
type ITryCatchResult<TOk, TErr, TFinal> = /* complex conditional type */;
```

You rarely need to reference this type directly; TypeScript infers it automatically from the arguments you pass to `tryCatch`.

---

## Examples

```ts
import { tryCatch } from '@litert/utils-flow-control';

// Synchronous
const result = tryCatch({
    try: () => JSON.parse('{"ok":true}'),
    catch: () => ({ ok: false }),
});
console.log(result); // { ok: true }

// Asynchronous
const data = await tryCatch({
    try: async () => fetch('/api/data').then(r => r.json()),
    catch: (e) => { console.error(e); return null; },
    finally: () => { console.log('done'); },
});
```
