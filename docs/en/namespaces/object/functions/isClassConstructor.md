# Function `isClassConstructor()`

Source: [IsClassConstructor.ts](https://github.com/litert/utils.js/blob/master/packages/partials/object/src/Functions/IsClassConstructor.ts)

Checks whether a given value is a native ES2015 class constructor.

> [!NOTE]
> Some built-in Node.js classes (e.g. `EventEmitter`, `Readable`) are not native
> ES2015 classes and will **not** pass this check. However, any user-defined class
> that `extends` such a built-in (e.g. `class MyEmitter extends EventEmitter {}`)
> **is** a native ES2015 class and will pass. Built-in ES2015 classes such as `Map`
> and `WeakMap` also pass.

[TOC]

## Import

```ts
import { isClassConstructor } from '@litert/utils-object';
```

## Signature

```ts
function isClassConstructor(func: unknown): func is IConstructor;
```

## Parameters

- Parameter `func: unknown`

  The value to test. Any value is accepted; non-function values always return `false`.

## Return Value

`true` if `func` is a native ES2015 class constructor; `false` otherwise.

When `true` is returned, TypeScript narrows the type of `func` to
[`IConstructor`](../../../../../../packages/partials/ts-types/src/index.ts) (`new (...args: any[]) => unknown`).

## Examples

```ts
import { isClassConstructor } from '@litert/utils-object';

class MyClass {}
function plainFunction() {}
const arrowFn = () => {};

console.log(isClassConstructor(MyClass));       // true
console.log(isClassConstructor(Map));           // true
console.log(isClassConstructor(WeakMap));       // true
console.log(isClassConstructor(plainFunction)); // false
console.log(isClassConstructor(arrowFn));       // false
console.log(isClassConstructor(42));            // false
console.log(isClassConstructor(null));          // false
```
