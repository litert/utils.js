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

import type { IDict, IObject } from '@litert/utils-ts-types';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Transform an object array to a map/dictionary.
 *
 * @param input     The array to be transformed
 * @param key       The key maker function or the property name of the object.
 *
 * @returns        A dictionary where each key is generated from the input array items.
 */
export function toDict<T extends IObject>(
    input: readonly T[],
    key: (keyof T) | ((v: T) => string | number | symbol)
): IDict<T> {

    const result: IDict<T> = {};

    if (typeof key === 'function') {

        for (const item of input) {

            result[key(item)] = item;
        }
    }
    else {

        for (const item of input) {

            result[item[key] as any] = item;
        }
    }

    return result;
}
