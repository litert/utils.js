# Function `hasProperties`

Source: [HasProperties.ts](https://github.com/litert/utils.js/blob/master/packages/partials/object/src/Functions/HasProperties.ts)

Checks whether **all** of the specified properties exist (are present) on an object using the `in` operator, which looks up both own properties and the prototype chain.

[TOC]

## Import

```ts
import { hasProperties } from '@litert/utils-object';
```

## Signature

```ts
function hasProperties<T extends IObject>(obj: T, properties: Array<keyof T>): boolean;
```

## Parameters

- Parameter `obj: T`

  The object to check.

- Parameter `properties: Array<keyof T>`

  The list of property keys to check for. All keys must be present for the function to return `true`. An empty array returns `false`.

## Return Value

`true` if all specified properties exist on `obj`, `false` otherwise (including when `properties` is empty).

## Examples

```ts
import { hasProperties } from '@litert/utils-object';

const user = { name: 'Alice', age: 30 };

console.log(hasProperties(user, ['name', 'age']));        // true
console.log(hasProperties(user, ['name', 'email']));      // false
console.log(hasProperties(user, []));                     // false (empty list)
```
