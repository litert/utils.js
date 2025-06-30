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

import type { TestContext } from 'node:test';

function immediate(): Promise<void> {

    return new Promise<void>((resolve) => {

        setImmediate(() => {

            resolve();
        });
    });
}

/**
 * This function helps to automatically tick all the timers in a test mocking context while waiting for a promise to
 * settle.
 *
 * > WARNING:
 * >
 * > These situations should be used with care:
 * >
 * > - `require('node:timers/promises').setTimeout` with `AbortSignal`, will still count the full timeout duration even
 * >    if the signal is aborted before the timeout. In fact, without this function, the timer will throw an AbortError
 * >    immediately after the signal is aborted.
 *
 * @param ctx   The test context to use for mocking timers.
 * @param pr    The promise to wait for.
 * @returns  A promise that resolves with the result of the input promise.
 */
export async function autoTick<T>(ctx: TestContext, pr: Promise<T>): Promise<T> {

    let done = false;

    (async () => {

        while (!done) {

            ctx.mock.timers.runAll();
            await immediate();
        }

    // eslint-disable-next-line no-console
    })().catch(console.error);

    try {

        return await pr;
    }
    finally {

        done = true;
    }
}
