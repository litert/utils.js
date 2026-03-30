# Function `getPropertyNames`

Source: [GetPropertyNames.ts](https://github.com/litert/utils.js/blob/master/packages/partials/object/src/Functions/GetPropertyNames.ts)

Returns all own property names **and** symbol keys of an object, combining the results of `Object.getOwnPropertyNames` and `Object.getOwnPropertySymbols`.

[TOC]

## Import

```ts
import { getPropertyNames } from '@litert/utils-object';
```

## Signature

```ts
function getPropertyNames<T extends IObject>(obj: T): Array<keyof T>;
```

## Parameters

- Parameter `obj: T`

  The object to inspect. Must be a non-null object.

## Return Value

An array of all own property names (strings) and own symbol keys of the object, typed as `Array<keyof T>`.

## Error Handling

- `TypeError` — Thrown when `obj` is `null` or not an object.

## Examples

```ts
import { getPropertyNames } from '@litert/utils-object';

const sym = Symbol('id');
const obj = { name: 'Alice', age: 30, [sym]: 'secret' };

console.log(getPropertyNames(obj)); // ['name', 'age', Symbol(id)]
```
