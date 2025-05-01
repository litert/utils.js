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

import type { IObject } from '@litert/utils-ts-types';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Create a new object with only the specified properties of the given object.
 *
 * > if `null` is passed as the object, an empty object will be returned.
 *
 * @param obj   The object to pick properties from
 * @param keys  The properties to pick
 *
 * @returns A new object with only the specified properties
 */
export function pickProperties<T extends IObject | null, TKeys extends keyof T>(
    obj: T,
    keys: TKeys[],
): Pick<T, TKeys> {

    if (typeof obj !== 'object') {

        throw new TypeError('An object is expected by "pickProperties" function.');
    }

    const ret: Pick<T, TKeys> = {} as any;

    if (obj === null) {

        return ret;
    }

    for (const k of keys) {

        ret[k] = (obj as any)[k];
    }

    return ret;
}
