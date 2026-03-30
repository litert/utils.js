# Function `getConstructor`

Source: [GetConstructor.ts](https://github.com/litert/utils.js/blob/master/packages/partials/object/src/Functions/GetConstructor.ts)

Returns the constructor function of an object by reading its prototype chain.

[TOC]

## Import

```ts
import { getConstructor } from '@litert/utils-object';
```

## Signature

```ts
function getConstructor<T>(obj: T): IConstructor<T>;
```

## Parameters

- Parameter `obj: T`

  The object whose constructor to retrieve. Must be a non-null object instance.

## Return Value

The constructor function of `obj`, typed as `IConstructor<T>`.

## Error Handling

- `TypeError` — Thrown when `obj` is `null` or not an object (i.e., a primitive value).

## Examples

```ts
import { getConstructor } from '@litert/utils-object';

class Animal {}
class Dog extends Animal {}

const dog = new Dog();
console.log(getConstructor(dog) === Dog); // true
console.log(getConstructor(dog) === Animal); // false

// TypeError
getConstructor(null);  // TypeError
getConstructor(42);    // TypeError
```
