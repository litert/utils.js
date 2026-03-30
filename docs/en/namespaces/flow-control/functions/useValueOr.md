# Function `useValueOr`

> **Package:** `@litert/utils-flow-control`
> **Source:** [packages/partials/flow-control/src/Functions/UseValueOr.ts](https://github.com/litert/utils.js/blob/master/packages/partials/flow-control/src/Functions/UseValueOr.ts)

Tests whether `value` passes a check function. If the check returns `true`, the original value is returned; otherwise the fallback `elseValue` is returned. Useful for inline conditional value selection without a ternary chain.

---

## Import

```ts
import { useValueOr } from '@litert/utils-flow-control';
```

---

## Signature

```ts
function useValueOr<T>(value: T, check: (v: T) => boolean, elseValue: T): T;
```

---

## Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `T` | The value to test; returned as-is if it passes `check` |
| `check` | `(v: T) => boolean` | Predicate — return `true` to accept `value`, `false` to use `elseValue` |
| `elseValue` | `T` | Fallback value returned when `check(value)` is `false` |

---

## Return Value

`value` if `check(value)` is `true`, otherwise `elseValue`.

---

## Examples

```ts
import { useValueOr } from '@litert/utils-flow-control';

const port = useValueOr(
    process.env.PORT ? parseInt(process.env.PORT) : 0,
    v => v > 0,
    3000
);
console.log(port); // The parsed port if valid, otherwise 3000
```
