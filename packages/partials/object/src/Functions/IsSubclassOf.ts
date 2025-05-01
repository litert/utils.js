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

import type { IConstructor } from '@litert/utils-ts-types';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Check if a class constructor is inherited from another class.
 *
 * @param subClass      The (sub) class constructor to check
 * @param parentClass   The (possible) parent class constructor to check against
 */
export function isSubclassOf(subClass: IConstructor, parentClass: IConstructor): boolean {

    return (subClass as any)?.__proto__ === parentClass || (
        (subClass as any)?.__proto__?.prototype !== undefined &&
        isSubclassOf((subClass as any).__proto__, parentClass)
    );
}
