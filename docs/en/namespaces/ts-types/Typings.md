# Typings — ts-types

This module exports static TypeScript utility types. All declarations are compile-time-only — they produce no runtime code.

[TOC]

## Import

```ts
import type {
    IObject, IDict, IFunction, IAsyncFunction, IDeepPartial,
    IConstructor, IBasicType, IAdvancedType, IElementOfArray,
    IMaybeAsync, IMaybeArray, IToPromise,
    IfIsAny, IfIsNever, IInstanceOf,
} from '@litert/utils-ts-types';
```

---

## Interface `IObject`

Source: [index.ts](https://github.com/litert/utils.js/blob/master/packages/partials/ts-types/src/index.ts#L26)

A marker interface representing any object value. Use in generic constraints where `object` would trigger ESLint's `@typescript-eslint/ban-types` rule.

```ts
interface IObject {}
```

**Example:**

```ts
function merge<T extends IObject>(a: T, b: Partial<T>): T { ... }
```

---

## Type Alias `IDict`

Source: [index.ts](https://github.com/litert/utils.js/blob/master/packages/partials/ts-types/src/index.ts#L34)

A lightweight dictionary type. A simplified alias for `Record<TKey, T>`.

### Definition

```ts
type IDict<
    T = any,
    TKey extends string | number | symbol = string | number | symbol
> = Record<TKey, T>;
```

### Parameters

| Parameter | Default | Description |
| --- | --- | --- |
| `T` | `any` | The type of values in the dictionary. |
| `TKey` | `string \| number \| symbol` | The allowed key types. |

**Example:**

```ts
const data: IDict<number> = { a: 1, b: 2 };
const typed: IDict<string, string> = { key: 'value' };
```

---

## Type Alias `IFunction`

Source: [index.ts](https://github.com/litert/utils.js/blob/master/packages/partials/ts-types/src/index.ts#L42)

A utility type representing any function. Use in generic constraints where `Function` would be too broad.

### Definition

```ts
type IFunction<
    TArgs extends any[] = any,
    TReturn = unknown
> = (...args: TArgs) => TReturn;
```

### Parameters

| Parameter | Default | Description |
| --- | --- | --- |
| `TArgs` | `any[]` | The argument types tuple. |
| `TReturn` | `unknown` | The return type. |

---

## Type Alias `IAsyncFunction`

Source: [index.ts](https://github.com/litert/utils.js/blob/master/packages/partials/ts-types/src/index.ts#L50)

A utility type representing any async function. Use in generic constraints for functions returning `Promise`.

### Definition

```ts
type IAsyncFunction<
    TArgs extends any[] = any,
    TReturn = unknown
> = (...args: TArgs) => Promise<TReturn>;
```

### Parameters

| Parameter | Default | Description |
| --- | --- | --- |
| `TArgs` | `any[]` | The argument types tuple. |
| `TReturn` | `unknown` | The resolved value type. |

---

## Type Alias `IDeepPartial`

Source: [index.ts](https://github.com/litert/utils.js/blob/master/packages/partials/ts-types/src/index.ts#L60)

A recursive version of the built-in `Partial<T>` that makes all nested properties optional as well.

### Definition

```ts
type IDeepPartial<T extends IObject> = {
    [P in keyof T]?: T[P] extends IObject ? IDeepPartial<T[P]> : T[P];
};
```

**Example:**

```ts
interface IConfig { server: { host: string; port: number }; debug: boolean; }
type IPartialConfig = IDeepPartial<IConfig>;
// { server?: { host?: string; port?: number }; debug?: boolean; }
```

---

## Type Alias `IConstructor`

Source: [index.ts](https://github.com/litert/utils.js/blob/master/packages/partials/ts-types/src/index.ts#L68)

Represents a class constructor function.

### Definition

```ts
type IConstructor<T = unknown> = new (...args: any[]) => T;
```

### Parameters

| Parameter | Default | Description |
| --- | --- | --- |
| `T` | `unknown` | The instance type the constructor produces. |

---

## Type Alias `IBasicType`

Source: [index.ts](https://github.com/litert/utils.js/blob/master/packages/partials/ts-types/src/index.ts#L73)

A union of all JavaScript primitive types.

### Definition

```ts
type IBasicType = string | number | boolean | symbol | null | undefined | bigint;
```

---

## Type Alias `IAdvancedType`

Source: [index.ts](https://github.com/litert/utils.js/blob/master/packages/partials/ts-types/src/index.ts#L78)

A union of all non-primitive (object) types.

### Definition

```ts
type IAdvancedType = IObject | any[] | IFunction | IConstructor;
```

---

## Type Alias `IElementOfArray`

Source: [index.ts](https://github.com/litert/utils.js/blob/master/packages/partials/ts-types/src/index.ts#L83)

Extracts the element type from an array type `T`.

### Definition

```ts
type IElementOfArray<T extends any[]> = T extends Array<infer U> ? U : never;
```

**Example:**

```ts
type TItem = IElementOfArray<string[]>; // string
type TNum  = IElementOfArray<number[]>; // number
```

---

## Type Alias `IMaybeAsync`

Source: [index.ts](https://github.com/litert/utils.js/blob/master/packages/partials/ts-types/src/index.ts#L95)

A value that can be either `T` or `Promise<T>`. Useful for return types of functions that may be synchronous or asynchronous.

### Definition

```ts
type IMaybeAsync<T> = Promise<T> | T;
```

---

## Type Alias `IMaybeArray`

Source: [index.ts](https://github.com/litert/utils.js/blob/master/packages/partials/ts-types/src/index.ts#L104)

A value that can be either a single `T` or an array `T[]`. Useful for function parameters that accept both forms.

### Definition

```ts
type IMaybeArray<T> = T[] | T;
```

---

## Type Alias `IToPromise`

Source: [index.ts](https://github.com/litert/utils.js/blob/master/packages/partials/ts-types/src/index.ts#L110)

Wraps `T` in `Promise<T>`, unless `T` is already a `Promise` type (in which case it is returned unchanged).

### Definition

```ts
type IToPromise<T> = T extends Promise<any> ? T : Promise<T>;
```

---

## Type Alias `IfIsAny`

Source: [index.ts](https://github.com/litert/utils.js/blob/master/packages/partials/ts-types/src/index.ts#L116)

A conditional type that resolves to `TYes` when `T` is `any`, and `TNo` otherwise.

### Definition

```ts
type IfIsAny<T, TYes, TNo> = 0 extends (1 & T) ? TYes : TNo;
```

---

## Type Alias `IfIsNever`

Source: [index.ts](https://github.com/litert/utils.js/blob/master/packages/partials/ts-types/src/index.ts#L121)

A conditional type that resolves to `TYes` when `T` is `never`, and `TNo` otherwise.

### Definition

```ts
type IfIsNever<T, TYes, TNo> = [T] extends [never] ? TYes : TNo;
```

---

## Type Alias `IInstanceOf`

Source: [index.ts](https://github.com/litert/utils.js/blob/master/packages/partials/ts-types/src/index.ts#L138)

Extracts the instance type from a constructor type `T`. This is the inverse operation of `IConstructor`.

### Definition

```ts
type IInstanceOf<T> = T extends IConstructor<infer U> ? U : never;
```

**Example:**

```ts
class MyClass {}
type IMyClassCtor = IConstructor<MyClass>;
type IMyClass = IInstanceOf<IMyClassCtor>; // MyClass
```
