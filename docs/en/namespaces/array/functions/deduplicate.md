# Function `deduplicate`

> **Package:** `@litert/utils-array`
> **Source:** [packages/partials/array/src/Functions/Deduplicate.ts](https://github.com/litert/utils.js/blob/master/packages/partials/array/src/Functions/Deduplicate.ts)

Removes duplicate values from an array and returns a new array without duplicates. For basic types (strings, numbers, etc.), deduplication uses strict equality (`===`) by default. For complex/object types, a `makeKey` function must be provided to map each element to a comparable value, unless the references are known to be unique already (pass `null` expressly to opt into reference equality).

---

## Import

```ts
import { deduplicate } from '@litert/utils-array';
```

---

## Signature

```ts
// Overload 1 — for basic types (optional makeKey)
function deduplicate<T extends IBasicType>(
    items: readonly T[],
    makeKey?: (v: T) => any
): T[];

// Overload 2 — for complex/object types (makeKey required; pass null for reference equality)
function deduplicate<T extends IAdvancedType>(
    items: readonly T[],
    makeKey: null | ((v: T) => any)
): T[];
```

---

## Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `items` | `readonly T[]` | The array to deduplicate |
| `makeKey` | `((v: T) => any) \| null` | Maps each element to a comparable key. Omit for basic types (uses `===`). Pass `null` to use reference equality for complex types |

---

## Return Value

A new array containing only the unique elements in their original order.

---

## Scoped Types

### Interface `IDeduplicateFn`

> Source: [Deduplicate.ts](https://github.com/litert/utils.js/blob/master/packages/partials/array/src/Functions/Deduplicate.ts)

The overloaded function interface type for the `deduplicate` export. It expresses both call signatures: one for arrays of basic types (where `makeKey` is optional) and one for arrays of complex/object types (where `makeKey` is required or explicitly `null`).

```ts
import type { IDeduplicateFn } from '@litert/utils-array';
```

```ts
interface IDeduplicateFn {
    // Overload 1 — basic types
    <T extends IBasicType>(items: readonly T[], makeKey?: (v: T) => any): T[];

    // Overload 2 — complex/object types
    <T extends IAdvancedType>(items: readonly T[], makeKey: null | ((v: T) => any)): T[];
}
```

This interface is the runtime type of the `deduplicate` export. You can use it when declaring function parameters that accept `deduplicate`-compatible callables.

---

## Examples

```ts
import { deduplicate } from '@litert/utils-array';

// Basic types — no makeKey needed
console.log(deduplicate([1, 2, 2, 3, 1]));      // [1, 2, 3]
console.log(deduplicate(['a', 'b', 'a']));       // ['a', 'b']

// Object types — provide makeKey
const users = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }, { id: 1, name: 'Alice' }];
console.log(deduplicate(users, u => u.id));      // [{ id: 1, ... }, { id: 2, ... }]

// Reference equality for objects (pass null)
const obj = { x: 1 };
console.log(deduplicate([obj, obj, { x: 1 }], null)); // [{ x: 1 }, { x: 1 }]
```
