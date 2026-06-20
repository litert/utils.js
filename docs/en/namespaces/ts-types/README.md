# Namespace `ts-types`

Package: `@litert/utils-ts-types`

This namespace provides static TypeScript utility types for use in generic constraints, type-level programming, and common type transformations. It contains no runtime code — all exports are compile-time-only type declarations.

## Install

Use this package only:

```bash
npm i @litert/utils-ts-types
```

Or install the full bundle:

```bash
npm i @litert/utils
```

And then import from it.

```ts
import type * as LibUtils from '@litert/utils';
type MyObj = LibUtils.IObject;

// or
import type { IObject } from '@litert/utils';
```

[TOC]

## Errors

See [Errors.md](./Errors.md) for all exported error classes.

| Class | Description |
| --- | --- |
| [`UtilityError`](./Errors.md) | Base error class for all LiteRT utility errors, carrying structured context. |

## Typings

See [Typings.md](./Typings.md) for all exported interfaces and type aliases.

| Type | Description |
| --- | --- |
| [`IObject`](./Typings.md#interface-iobject) | Base interface for any object value, useful in generic constraints. |
| [`IDict<T, TKey>`](./Typings.md#type-alias-idict) | Lightweight dictionary type (`Record<TKey, T>`). |
| [`IFunction<TArgs, TReturn>`](./Typings.md#type-alias-ifunction) | Type for any function, useful in generic constraints. |
| [`IAsyncFunction<TArgs, TReturn>`](./Typings.md#type-alias-iasyncfunction) | Type for any async function, useful in generic constraints. |
| [`IDeepPartial<T>`](./Typings.md#type-alias-ideeppartial) | Recursively makes all properties of `T` optional. |
| [`IConstructor<T>`](./Typings.md#type-alias-iconstructor) | Type for a class constructor. |
| [`IBasicType`](./Typings.md#type-alias-ibasictype) | Union of all JavaScript primitive types. |
| [`IAdvancedType`](./Typings.md#type-alias-iadvancedtype) | Union of all non-primitive types. |
| [`IElementOfArray<T>`](./Typings.md#type-alias-ielementofarray) | Extracts the element type from an array type. |
| [`IMaybeAsync<T>`](./Typings.md#type-alias-imayebeasync) | `T` or `Promise<T>`. |
| [`IMaybeArray<T>`](./Typings.md#type-alias-imaybearray) | `T` or `T[]`. |
| [`IMaybeVoid<T>`](./Typings.md#type-alias-imaybevoid) | `T` or `void`. |
| [`INullable<T>`](./Typings.md#type-alias-inullable) | `T` or `null`. |
| [`IToPromise<T>`](./Typings.md#type-alias-itopromise) | Wraps `T` in `Promise<T>` unless already a `Promise`. |
| [`IfIsAny<T, TYes, TNo>`](./Typings.md#type-alias-ifisany) | Conditional type: resolves to `TYes` if `T` is `any`. |
| [`IfIsNever<T, TYes, TNo>`](./Typings.md#type-alias-ifisnever) | Conditional type: resolves to `TYes` if `T` is `never`. |
| [`IInstanceOf<T>`](./Typings.md#type-alias-iinstanceof) | Extracts the instance type from a constructor type. |
| [`IDeepReadonly<T>`](./Typings.md#type-alias-ideepreadonly) | Recursively makes all properties and array elements of `T` readonly. |
