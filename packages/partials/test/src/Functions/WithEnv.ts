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

import type * as _ from '@litert/utils-ts-types';

/**
 * Temporarily set environment variables for the duration of the callback, and restore them afterward.
 *
 * This function can handle both synchronous and asynchronous callbacks. If the callback returns a
 * promise, the environment variables will be restored after the promise settles (either fulfills or rejects).
 * If the callback is synchronous, the environment variables will be restored immediately after the
 * callback returns or throws.
 *
 * @param env   An object containing the environment variables to set for the duration of the callback.
 * @param cb   The callback function to execute with the specified environment variables.
 * @returns The return value of the callback function.
 * @throws Any error thrown by the callback function will be propagated after restoring the environment variables.
 *
 * @example
 * ```ts
 * withEnv({ MY_VAR: 'value' }, () => {
 *     console.log(process.env.MY_VAR); // Output: 'value'
 * });
 *
 * console.log(process.env.MY_VAR); // Output: undefined (restored to original state)
 * ```
 */
export function withEnv<T extends () => any>(env: _.IDict, cb: T): ReturnType<T> {

    const backup: _.IDict = {};

    for (const key in env) {

        backup[key] = process.env[key];
        process.env[key] = env[key];
    }

    let isSync = true;

    try {

        const ret = cb();

        if (ret instanceof Promise) {

            isSync = false;

            return ret.finally(() => {

                for (const key in backup) {

                    if (backup[key] === undefined) {
                        delete process.env[key];
                    }
                    else {
                        process.env[key] = backup[key];
                    }
                }
            }) as ReturnType<T>;
        }

        return ret;
    }
    finally {

        if (isSync) {

            for (const key in backup) {

                if (backup[key] === undefined) {

                    delete process.env[key];
                }
                else {

                    process.env[key] = backup[key];
                }
            }
        }
    }
}
