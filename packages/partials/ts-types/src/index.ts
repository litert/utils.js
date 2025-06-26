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
 * The type stands for an object.
 *
 * This type could be used to express the base type of an object, in type parameters, or in generic types.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IObject {}

/**
 * The type stands for a map-like object (just a simple object, not a Map class instance).
 *
 * This type also could be used to express a dictionary, if the second type parameter is specified.
 */
export type IDict<
    T = any,
    TKey extends string | number | symbol = string | number | symbol
> = Record<TKey, T>;

/**
 * The type to express a function.
 */
export type IFunction<TArgs extends any[] = any, TReturn = unknown> = (...args: TArgs) => TReturn;

/**
 * The type to express an asynchronous function.
 */
export type IAsyncFunction<TArgs extends any[] = any, TReturn = unknown> = (...args: TArgs) => Promise<TReturn>;

/**
 * Recursively makes all properties of an object type optional.
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
 * The utility type to extract the type of the array elements.
 */
export type IElementOfArray<T extends any[]> = T extends Array<infer U> ? U : never;

/**
 * A utility type to wrap a (returned) type in both `Promise` and non-`Promise`.
 */
export type IMaybeAsync<T> = Promise<T> | T;

/**
 * Converts a type to a `Promise` type, if it's already a `Promise`, it will return the same type.
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
