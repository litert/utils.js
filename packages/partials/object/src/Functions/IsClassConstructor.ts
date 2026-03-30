/**
 * Copyright 2026 Angus.Fenying <fenying@litert.org>
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

/**
 * This function checks if the given value is a (ES2015) class constructor or not.
 *
 * > Some native NodeJS classes are not native ES2015 class, can not pass the
 * > detection by this function, e.g. `EventEmitter`, `Readable` etc. But their
 * > subclasses (`class extends EventEmitter {}`) is native ES2015 classes,
 * > can pass the detection by this function.
 * > Of course, like `Map`, `WeakMap` etc. are native ES2015 classes, can pass the
 * > detection by this function.
 *
 * @param func  The value to check
 * @returns     True if the value is a class constructor, false otherwise
 */
export function isClassConstructor(func: unknown): func is IConstructor {

    if (typeof func !== 'function') {
        return false;
    }

    if (func.toString().startsWith('class')) {
        return true;
    }

    if (Object.getOwnPropertyDescriptor(func, 'prototype')?.writable === false) {
        return true;
    }

    return false;
}
