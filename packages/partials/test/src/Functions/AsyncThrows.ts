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

import * as NodeAssert from 'node:assert';
import type * as dTS from '@litert/utils-ts-types';

/**
 * The function asserts that the given async callback throws an error.
 *
 * @param cb        The async callback function to be tested.
 * @param message   Optional. If provided, it can be a string or an error constructor.
 *                  If it's a string, the function checks if the thrown error's message matches it.
 *                  If it's an error constructor, the function checks if the thrown error is an instance of that constructor.
 */
export async function asyncThrows(cb: () => Promise<void>, message?: string | dTS.IConstructor<Error>): Promise<void> {

    try {

        await cb();
    }
    catch (err) {

        if (typeof message === 'function') {

            NodeAssert.ok(err instanceof message, `The error should be an instance of ${message.name}`);
        }
        else if (typeof message === 'string') {

            NodeAssert.strictEqual((err as Error).message, message);
        }
        else if (message !== undefined) {

            NodeAssert.fail('The message should be a string or an error constructor');
        }

        return;
    }

    NodeAssert.fail('An error should have been thrown.');
}
