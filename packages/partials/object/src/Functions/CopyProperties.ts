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

/**
 * Copy properties from one object to another.
 *
 * > This function is aimed to solve the problem of the typescript syntax error when copying
 * > properties from a source object to a destination object, even if both objects are the same
 * > type.
 *
 * @param dst           The destination object where properties will be copied to
 * @param src           The source object from which properties will be copied
 * @param properties    The list of properties to copy
 */
export function copyProperties<T extends IObject>(
    dst: T,
    src: Partial<T>,
    properties: Array<keyof T>
): void {

    for (const k of properties) {

        if (src[k] !== undefined) {

            dst[k] = src[k];
        }
    }
}
