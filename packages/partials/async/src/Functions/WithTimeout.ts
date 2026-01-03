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

import { TimeoutError } from '../Errors';

/**
 * The extended options for `withTimeout` function.
 */
export interface IWithTimeoutOptions<T> {

    /**
     * The callback to receive the result of the asynchronous task after timeout.
     *
     * @param error     The error occurred if the task timed out, otherwise null.
     * @param result    The result of the task if it completed in time.
     */
    collectResult?: (error: unknown | null, result?: T) => void;
}

/**
 * Bind a timeout to an asynchronous task.
 *
 * > The real asynchronous task is still running even if the timeout is reached.
 * > If you wanna cancel/abort the task, you should consider using `AbortTimeoutController` instead.
 * >
 * > Besides, you may need to handle the result of the task even after timeout by yourself,
 * > just use `IWithTimeoutOptions.collectResult` for that.
 *
 * @param timeoutMs     The timeout duration in milliseconds.
 * @param asyncTask     The asynchronous task to execute, which can be a Promise or a function that returns a Promise.
 * @param opts          Additional options for handling the task result.
 *
 * @throws {TimeoutError} If the asynchronous task does not complete within the specified timeout.
 * @returns A Promise with the result of the asynchronous task or a timeout error.
 */
export async function withTimeout<T>(
    timeoutMs: number,
    asyncTask: Promise<T> | (() => Promise<T>),
    opts?: IWithTimeoutOptions<T>,
): Promise<T> {

    const pr: Promise<T> = typeof asyncTask === 'function' ? asyncTask() : asyncTask;

    return new Promise<T>((resolve, reject) => {

        let timer: NodeJS.Timeout | null = setTimeout(() => {
            timer = null; // Clear the timer reference
            reject(new TimeoutError(pr));
        }, timeoutMs);

        pr.then(
            (result) => {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                    resolve(result);
                    return;
                }
                opts?.collectResult?.(null, result);
            },
            (error) => {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                    reject(error);
                    return;
                }
                opts?.collectResult?.(error);
            },
        );
    });
}
