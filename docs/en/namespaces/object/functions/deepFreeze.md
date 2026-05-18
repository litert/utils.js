# Function `deepFreeze`

Source: [DeepFreeze.ts](https://github.com/litert/utils.js/blob/master/packages/partials/object/src/Functions/DeepFreeze.ts)

Recursively applies `Object.freeze()` to an object and all of its nested object and array properties, making the entire structure immutable. The return type reflects the deep-readonly transformation as `IDeepReadonly<T>`.

> [!WARNING]
> This function does not clone the object. It freezes the original object and all its nested properties in-place.

[TOC]

## Import

```ts
import { deepFreeze } from '@litert/utils-object';
```

## Signature

```ts
function deepFreeze<T extends IObject>(obj: T): IDeepReadonly<T>;
```

## Parameters

- Parameter `obj: T`

  The object to be deeply frozen. This object and all its nested object and array properties are frozen directly — no clone is made.

## Return Value

`IDeepReadonly<T>` — the same object reference as the input, now fully frozen and typed as deeply readonly. All nested objects and arrays are also frozen.

## Examples

```ts
import { deepFreeze } from '@litert/utils-object';

const obj = deepFreeze({ a: 1, b: [{ c: 2 }, 123] });
obj.a = 10;       // Throws TypeError in strict mode
obj.b[0].c = 99;  // Throws TypeError in strict mode
```

### Circular references

`deepFreeze` tracks already-processed objects internally, so circular references are handled safely without causing infinite loops.

```ts
import { deepFreeze } from '@litert/utils-object';

const a: any = { x: 1 };
a.self = a; // circular reference

deepFreeze(a); // safe — does not recurse infinitely
```
