# Function `isSubclassOf`

Source: [IsSubclassOf.ts](https://github.com/litert/utils.js/blob/master/packages/partials/object/src/Functions/IsSubclassOf.ts)

Checks whether a class constructor is a subclass of another class constructor by traversing the prototype chain.

[TOC]

## Import

```ts
import { isSubclassOf } from '@litert/utils-object';
```

## Signature

```ts
function isSubclassOf(subClass: IConstructor, parentClass: IConstructor): boolean;
```

## Parameters

- Parameter `subClass: IConstructor`

  The constructor to test. The function checks whether this is a subclass of `parentClass`.

- Parameter `parentClass: IConstructor`

  The constructor to test against.

## Return Value

`true` if `subClass` is a direct or indirect subclass of `parentClass`. Returns `false` if they are the same class (a class is not considered a subclass of itself).

## Examples

```ts
import { isSubclassOf } from '@litert/utils-object';

class Animal {}
class Mammal extends Animal {}
class Dog extends Mammal {}

console.log(isSubclassOf(Dog, Mammal));  // true
console.log(isSubclassOf(Dog, Animal));  // true
console.log(isSubclassOf(Dog, Dog));     // false (same class)
console.log(isSubclassOf(Animal, Dog));  // false (parent ≠ subclass)
```
