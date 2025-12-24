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
import type { IAdvancedType, IBasicType, IElementOfArray } from '@litert/utils-ts-types';

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface IDeduplicateFn {

    /**
     * Quickly deduplicate an array and return the result.
     *
     * If the elements in the array are all basic types, the function will process them with
     * simple `===` comparison.
     *
     * If the elements in the array are complex types, the function will not compare them with
     * `===` by default. Instead, a `makeKey` function must be provided to map the elements to
     * values that can be compared with `===`. In this case, if you ensure that the elements are
     * actually comparable with `===`, you can set the `makeKey` function to `null` to use the default.
     * For example, there are multiple references to the same object in the array, and you want to
     * deduplicate them, you can set the `makeKey` function to `null` to use the default `===` simply.
     *
     * @param items             The array to be deduplicated
     * @param makeKey           The function to map items to a unique value for deduplication.
     */
    <T extends IBasicType>(items: readonly T[], makeKey?: (v: T) => any): T[];

    /**
     * Quickly deduplicate an array and return the result.
     *
     * If the elements in the array are all basic types, the function will process them with
     * simple `===` comparison.
     *
     * If the elements in the array are complex types, the function will not compare them with
     * `===` by default. Instead, a `makeKey` function must be provided to map the elements to
     * values that can be compared with `===`. In this case, if you ensure that the elements are
     * actually comparable with `===`, you can set the `makeKey` function to `null` to use the default.
     * For example, there are multiple references to the same object in the array, and you want to
     * deduplicate them, you can set the `makeKey` function to `null` to use the default `===` simply.
     *
     * @param items             The array to be deduplicated
     * @param makeKey           The function to map items to a unique value for deduplication.
     */
    <T extends IAdvancedType>(items: readonly T[], makeKey: null | ((v: T) => any)): T[];
}

/**
 * Quickly deduplicate an array and return the result.
 *
 * If the elements in the array are all basic types, the function will process them with
 * simple `===` comparison, by default.
 *
 * If the elements in the array are complex types, the function will not compare them with
 * `===` by default. Instead, a `makeKey` function must be provided to map the elements to
 * values that can be compared with `===`. In this case, if you ensure that the elements are
 * actually comparable with `===`, you can set the `makeKey` function to `null` to use the default.
 * For example, there are multiple references to the same object in the array, and you want to
 * deduplicate them, you can set the `makeKey` function to `null` to use the default `===` simply.
 */
export const deduplicate = function<T extends any[]>(
    items: Array<IElementOfArray<T>>,
    makeKey?: (v: IElementOfArray<T>) => IElementOfArray<T>
): T {

    if (!items?.length) {

        return [] as unknown as T;
    }

    if (makeKey) {

        const m = new Map<any, any>();

        for (const i of items) {

            const k = makeKey(i);

            if (!m.has(k)) {

                m.set(k, i);
            }
        }

        return Array.from(m.values()) as T;
    }

    return Array.from(new Set(items)) as T;

} as IDeduplicateFn;
