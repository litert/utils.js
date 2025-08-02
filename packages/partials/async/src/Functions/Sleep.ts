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

import { AbortedError } from '../Errors';

function doSleep(delayMs: number, signal?: AbortSignal): Promise<void> {

    return new Promise<void>((resolve, reject) => {

        const timer = setTimeout(() => { resolve(); }, delayMs);

        if (signal) {

            signal.addEventListener('abort', () => {
                clearTimeout(timer);
                reject(new AbortedError());
            }, { once: true, });
        }
    });
}

const MAX_SAFE_TIMEOUT = 0x7FFFFFFF;

/**
 * Sleep for a specified duration.
 *
 * > This function is safe even if the duration exceeds the maximum wait time
 * > of `2147483647 (0x7FFFFFFF)` milliseconds (approximately 24.8 days).
 *
 * @param delayMs   The duration to sleep in milliseconds.
 * @param signal    An optional `AbortSignal` to allow the sleep to be aborted.
 * @returns  A Promise that resolves after the specified duration.
 * @throws  If the sleep is aborted via the provided `AbortSignal`.
 */
export async function sleep(delayMs: number, signal?: AbortSignal): Promise<void> {

    if (!Number.isSafeInteger(delayMs) || delayMs < 0) {

        throw new TypeError('The delayMs must be a non-negative integer.');
    }

    while (delayMs > MAX_SAFE_TIMEOUT) {

        await doSleep(MAX_SAFE_TIMEOUT, signal);
        delayMs -= MAX_SAFE_TIMEOUT;
    }

    if (delayMs > 0) {

        await doSleep(delayMs, signal);
    }
}
