# LiteRT/Utils - TypeScript Types

[![Strict TypeScript Checked](https://badgen.net/badge/TS/Strict "Strict TypeScript Checked")](https://www.typescriptlang.org)
[![npm version](https://img.shields.io/npm/v/@litert/utils-ts-types.svg?colorB=brightgreen)](https://www.npmjs.com/package/@litert/utils-ts-types "Stable Version")
[![License](https://img.shields.io/npm/l/@litert/utils-ts-types.svg?maxAge=2592000?style=plastic)](https://github.com/litert/utils.js/blob/master/LICENSE)
[![node](https://img.shields.io/node/v/@litert/utils-ts-types.svg?colorB=brightgreen)](https://nodejs.org/dist/latest-v8.x/)
[![GitHub issues](https://img.shields.io/github/issues/litert/utils.js.svg)](https://github.com/litert/utils.js/issues)
[![GitHub Releases](https://img.shields.io/github/release/litert/utils.js.svg)](https://github.com/litert/utils.js/releases "Stable Release")

The utility functions/classes/constants about helper types for TypeScript.

## Requirement

- TypeScript v5.0.0 (or newer)
- Node.js v22.0.0 (or newer)

## Installation

```sh
npm i @litert/utils-ts-types --save
```

## Usage

### Type `IObject`

The `IObject` type is a type stands for any object values, usefully in generic constraints.

> And this helps to avoid the ESLint rule `@typescript-eslint/ban-types` error.

```ts
type ISomeType<T extends IObject> = ...;
```

### Type `IDict`

The `IDict` is a lite form of `Record<string, any>`, which is more suitable to express a dictionary object.

```ts
const dictOfAny: IDict = {
    key1: 'value1',
    key2: 42,
    key3: true,
};

const dictOfString: IDict<string> = {
    key1: 'value1',
    key2: '42',
    key3: 'true',
};
```

### Type `IFunction` and `IAsyncFunction`

The `IFunction` type is a type stands for any function values, usefully in generic constraints.

```ts
type ISomeType<T extends IFunction> = ...;
```

### Type `IDeepPartial`

The `IDeepPartial<T>` type is a recursive version of the built-in `Partial<T>` type.
It makes all properties of an object type `T` optional, including nested properties.

### Type `IConstructor`

The `IConstructor` type is a type that represents a class constructor function.

```ts
class MyClass {};

const ctor: IConstructor<MyClass> = MyClass;
```

### Type `IElementOfArray`

The `IElementOfArray<T>` type is a utility type that extracts the element type from an array type `T`.

```ts
type MyArray = string[];

const arr: MyArray = ['a', 'b', 'c'];

const el0: IElementOfArray<MyArray> = arr[0];
```

### Type `IMaybeArray`

The `IMaybeArray<T>` type is a utility type that represents a value that can be either a single value of type `T` or an array of type `T`.

This type is useful for function parameters or some options that can accept either a single value or multiple values.

```ts
interface IOptions {

    tag: IMaybeArray<string>;
}

function processItems(items: IMaybeArray<string>) {

    const itemArray = Array.isArray(items) ? items : [items];
    // ...
}
```

### Type `IMaybeAsync`

The `IMaybeAsync<T>` type is a utility type that represents a value that can be either of type `T` or a `Promise` that resolves to type `T`.
This type is useful for the return type of functions that can be either synchronous or asynchronous.

```ts
function maybeAsync(flag: boolean): IMaybeAsync<string> {
    if (flag) {
        return 'synchronous value';
    } else {
        return Promise.resolve('asynchronous value');
    }
}
```

### Type `IfIsAny`

The `IfIsAny<T, TYes, TNo>` type is a conditional type that checks if the type `T` is `any`.
If `T` is `any`, it resolves to `TYes`; otherwise, it resolves to `TNo`.

### Type `IfIsNever`

The `IfIsNever<T, TYes, TNo>` type is a conditional type that checks if the type `T` is `never`.
If `T` is `never`, it resolves to `TYes`; otherwise, it resolves to `TNo`.

### Class `UtilityError`

The base error class for all errors thrown by the LiteRT utilities. It extends the built-in `Error` class and adds a typed `context` property for structured error information, and an `origin` property for the underlying cause.

```ts
import { UtilityError } from '@litert/utils-ts-types';

class MyError extends UtilityError<{ input: string }> {
    public constructor(input: string, message: string) {
        super('MyError', message, { input });
    }
}

try {
    throw new MyError('bad-value', 'Input is invalid');
} catch (e) {
    if (e instanceof MyError) {
        console.error(`[${e.name}] ${e.message}`, e.context);
    }
}
```

### Type `IDeepReadonly`

The `IDeepReadonly<T>` type is a recursive version of the built-in `Readonly<T>` type.
It makes all properties of an object type `T` readonly, including nested properties.
For an array type, it makes the array itself readonly and also makes all elements of the array deeply readonly.

```ts
const obj: IDeepReadonly<{ a: string; b: { c: string; e: Array<{ f: number }> } }> = {
    a: 'hello',
    b: {
        c: 'world',
        e: [
            { f: 42 },
            { f: 99 },
        ],
    },
};
obj.b.c = 'changed'; // Error: Cannot assign to 'c' because it is a read-only property.
obj.b.e[1].f = 100; // Error: Cannot assign to 'f' because it is a read-only property.
```

## Documentation

- [en-US](https://litert.org/projects/utils.js/en/api/namespaces/ts-types/)

## License

This library is published under [Apache-2.0](https://github.com/litert/utils.js/blob/master/LICENSE) license.

## AI Disclaimer

This project may use AI tools to assist in documentation writing and inspiration for unit test cases, but all code is written and reviewed by human developers.
