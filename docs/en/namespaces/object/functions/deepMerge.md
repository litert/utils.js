# Function `deepMerge`

Source: [DeepMerge.ts](https://github.com/litert/utils.js/blob/master/packages/partials/object/src/Functions/DeepMerge.ts)

Recursively merges two objects and returns a new merged object. Neither input is modified. When a key exists in both objects, the value from the second object takes precedence; for nested objects and arrays, the merge is applied recursively.

[TOC]

## Import

```ts
import { deepMerge } from '@litert/utils-object';
```

## Signature

```ts
function deepMerge<T1 extends IObject, T2 extends IObject>(
    obj1: T1,
    obj2: T2,
    opts?: IDeepMergeOptions,
): IMergeObject<T1, T2>;
```

## Parameters

- Parameter `obj1: T1`

  The base object. Its keys and values form the starting point of the merge.

- Parameter `obj2: T2`

  The override object. Its values take precedence over `obj1` when conflicts occur.

- Parameter `opts?: IDeepMergeOptions`

  Optional tuning options. See [`IDeepMergeOptions`](#interface-ideepmerge-options).

## Return Value

A new `IMergeObject<T1, T2>` object. The original objects are not mutated.

## Scoped Types

### Type Alias `IMergeObject<T1, T2>`

> Source: [DeepMerge.ts](https://github.com/litert/utils.js/blob/master/packages/partials/object/src/Functions/DeepMerge.ts)

```ts
import type { IMergeObject } from '@litert/utils-object';
```

Computes the recursive merge result type for two object types. For each key:
- If the key exists only in `T2`, the `T2` value type is used.
- If the key exists only in `T1`, the `T1` value type is used.
- If the key exists in both and both are objects, the types are recursively merged.
- If both are arrays, they are merged element-by-element recursively.
- Otherwise, the `T2` value type wins.

```ts
type IMergeObject<T1 extends IObject, T2 extends IObject> = { ... };
```

---

### Interface `IDeepMergeOptions`

> Source: [DeepMerge.ts](https://github.com/litert/utils.js/blob/master/packages/partials/object/src/Functions/DeepMerge.ts)

```ts
import type { IDeepMergeOptions } from '@litert/utils-object';
```

Options accepted by the `deepMerge` function.

```ts
interface IDeepMergeOptions {
    arrayAsValue?: boolean;
    nullAsEmptyObject?: boolean;
}
```

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `arrayAsValue` | `boolean?` | `false` | When `true`, arrays are treated as plain values (the second array fully replaces the first instead of being merged element-by-element). |
| `nullAsEmptyObject` | `boolean?` | `false` | When `true`, a `null` value in either object is treated as an empty object `{}` during the merge, preventing a `null` from overwriting an existing object value. |

---

## Examples

```ts
import { deepMerge } from '@litert/utils-object';

const base = { a: 1, b: { x: 10, y: 20 }, c: [1, 2, 3] };
const patch = { b: { y: 99, z: 30 }, c: [4, 5] };

const result = deepMerge(base, patch);
// {
//   a: 1,
//   b: { x: 10, y: 99, z: 30 },  ← merged recursively
//   c: [4, 5, 3]                  ← merged element-by-element
// }
```

### Using `arrayAsValue`

```ts
const result = deepMerge(base, patch, { arrayAsValue: true });
// c: [4, 5]  ← patch replaces base entirely
```

### Using `nullAsEmptyObject`

```ts
const result = deepMerge({ settings: { theme: 'dark' } }, { settings: null }, { nullAsEmptyObject: true });
// settings: { theme: 'dark' }  ← null treated as {}, not overwriting
```
