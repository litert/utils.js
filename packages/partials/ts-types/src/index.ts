/**
 * Copyright 2025 Angus.Fenying <fenying@litert.org>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * The type is a type stands for any object values, usefully in generic
 * constraints.
 *
 * > And this helps to avoid the ESLint rule `@typescript-eslint/ban-types`
 * > error.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IObject {}

/**
 * The `IDict` is a lite form of `Record<string, any>`, which is more suitable
 * to express a dictionary object.
 *
 * This type also could be used to express a dictionary, if the second type
 * parameter is specified.
 */
export type IDict<
    T = any,
    TKey extends string | number | symbol = string | number | symbol
> = Record<TKey, T>;

/**
 * The utility type is a type stands for any functions, usefully in generic
 * constraints.
 */
export type IFunction<
    TArgs extends any[] = any,
    TReturn = unknown
> = (...args: TArgs) => TReturn;

/**
 * The utility type is a type stands for any asynchronous functions, usefully
 * in generic constraints.
 */
export type IAsyncFunction<
    TArgs extends any[] = any,
    TReturn = unknown
> = (...args: TArgs) => Promise<TReturn>;

/**
 * The `IDeepPartial<T>` type is a recursive version of the built-in
 * `Partial<T>` type.
 *
 * It makes all properties of an object type `T` optional, including nested
 * properties.
 */
export type IDeepPartial<T extends IObject> = {
    [P in keyof T]?: T[P] extends IObject ? IDeepPartial<T[P]> : T[P];
};

/**
 * The type to express a class constructor (function).
 */
export type IConstructor<T = unknown> = new (...args: any[]) => T;

/**
 * Fundamental data types.
 */
export type IBasicType = string | number | boolean | symbol | null | undefined | bigint;

/**
 * The advanced data types.
 */
export type IAdvancedType = IObject | any[] | IFunction | IConstructor;

/**
 * The utility type that extracts the element type from an array type `T`.
 */
export type IElementOfArray<
    T extends any[]
> = T extends Array<infer U> ? U : never;

/**
 * A a utility type that represents a value that can be either of type `T` or a
 * `Promise` that resolves to type `T`.
 *
 * This type is useful for the return type of functions that can be either
 * synchronous or asynchronous.
 */
export type IMaybeAsync<T> = Promise<T> | T;

/**
 * A utility type that represents a value that can be either of type `T` or an
 * array of type `T`.
 *
 * This type is useful for function parameters or some options that can accept
 * either a single value or multiple values.
 */
export type IMaybeArray<T> = T[] | T;

/**
 * Converts a type to a `Promise` type, if it's already a `Promise`, it will
 * return the same type.
 */
export type IToPromise<T> = T extends Promise<any> ? T : Promise<T>;

/**
 * Asserts that a type is `any` type.
 *
 * @see https://stackoverflow.com/a/55541672
 */
export type IfIsAny<T, TYes, TNo> = 0 extends (1 & T) ? TYes : TNo;

/**
 * Asserts that a type is `never` type.
 */
export type IfIsNever<T, TYes, TNo> = [T] extends [never] ? TYes : TNo;

/**
 * The type to express a JSON safe value, which could be safely passed to
 * `JSON.stringify`, and may be returned by `JSON.parse`.
 *
 * Thus, only the following types are allowed:
 *
 * - Basic Types: `string`, `number`, `boolean`, `null`
 * - Array of JSON safe values
 * - Object with string keys and JSON safe values
 *
 * Note that `undefined`, `function`, `symbol`, `bigint` and other non-JSON
 * safe types are not allowed.
 */
export type IJsonSafeValue = string | number | boolean | null | IJsonSafeValue[] | { [key: string]: IJsonSafeValue; };

/**
 * The utility type that extracts the instance type from a class constructor
 * type `T`, the opposite of `IConstructor`.
 *
 * @example
 * ```ts
 * class MyClass {}
 * type IMyClassConstructor = IConstructor<MyClass>;
 * type IMyClass = IInstanceOf<IMyClassConstructor>; // MyClass
 * const ctor: IMyClassConstructor = MyClass;
 * const inst: IMyClass = new MyClass();
 * ```
 *
 * @see {@link IConstructor}
 */
export type IInstanceOf<T> = T extends IConstructor<infer U> ? U : never;
