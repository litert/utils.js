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
 * Check if the object has any of the specified properties.
 *
 * @param obj           The object to check
 * @param properties    The properties to check for
 */
export function hasProperties<T extends IObject>(obj: T, properties: Array<keyof T>): boolean {

    return properties.length > 0 && properties.every(prop => prop in obj);
}
