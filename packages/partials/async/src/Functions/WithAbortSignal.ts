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

import { AbortedError } from '../Errors';

/**
 * The extended options for `withAbortSignal` function.
 */
export interface IWithAbortSignalOptions<T> {

    /**
     * The callback function to receive the result of the asynchronous task if it completes
     * after the signal is aborted.
     *
     * @param result The result of the asynchronous task.
     */
    collectResult?: (error: unknown | null, result?: T) => void;
}

/**
 * Bind an AbortSignal to an asynchronous task.
 *
 * > The real asynchronous task is still running even if the timeout is reached.
 * > If you wanna cancel/abort the task, you should use the AbortSignal inside the task itself.
 *
 * > If the signal is already aborted, the function will immediately reject with an 'AbortError' DOMException.
 *
 * @param signal       The AbortSignal to bind.
 * @param asyncTask    The asynchronous task to execute, which can be a Promise or a function that returns a Promise.
 *
 * @throws {DOMException} If the asynchronous task is aborted, named 'AbortError'.
 * @returns A Promise with the result of the asynchronous task or an abort error.
 *
 * @example
 * ```ts
 * import * as AsyncUtils from '@litert/utils-async';
 *
 * const controller = new AbortController();
 *
 * setTimeout(() => { controller.abort(); }, 1000); // Abort after 1 second
 *
 * await AsyncUtils.withAbortSignal(controller.signal, async () => {
 *     // Some asynchronous task...
 * });
 * ```
 */
export function withAbortSignal<T>(
    signal: AbortSignal,
    asyncTask: Promise<T> | (() => Promise<T>),
    opts?: IWithAbortSignalOptions<T>,
): Promise<T> {

    if (signal.aborted) {

        if (asyncTask instanceof Promise) {

            if (opts?.collectResult) {

                asyncTask.then(
                    (result) => {
                        opts.collectResult!(null, result);
                    },
                    (error) => {
                        opts.collectResult!(error);
                    },
                );
            }

            return Promise.reject(new AbortedError(asyncTask));
        }

        return Promise.reject(new AbortedError(null));
    }

    let pr: Promise<T>;

    try {

        pr = typeof asyncTask === 'function' ? asyncTask() : asyncTask;
    }
    catch (err) {

        return Promise.reject(err);
    }

    return new Promise<T>((resolve, reject) => {

        const onAbort = (): void => {
            reject(new AbortedError(pr));
        };

        signal.addEventListener('abort', onAbort);

        pr.then(
            (result) => {
                if (signal.aborted) {
                    opts?.collectResult?.(null, result);
                    return;
                }
                signal.removeEventListener('abort', onAbort);
                resolve(result);
            },
            (error) => {
                if (signal.aborted) {
                    opts?.collectResult?.(error);
                    return;
                }
                signal.removeEventListener('abort', onAbort);
                reject(error);
            },
        );
    });
}
