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
 * Get all property names (including symbols) of an object.
 *
 * @param obj    The object to get property names from
 * @returns     An array of property names (including symbols) of the object.
 */
export function getPropertyNames<T extends IObject>(obj: T): Array<keyof T> {

    if (obj === null || typeof obj !== 'object') {

        throw new TypeError('An object is expected by "getPropertyNames" function.');
    }

    return (Object.getOwnPropertyNames(obj) as any[]).concat(Object.getOwnPropertySymbols(obj)) as Array<keyof T>;
}
