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

/**
 * The error thrown by the `withTimeout` function when the operation exceeds the specified timeout.
 */
export class TimeoutError extends Error {

    public readonly unresolvedPromise: Promise<unknown>;

    public constructor(unresolvedPromise: Promise<unknown>) {
        super('Operation timed out');
        this.name = TimeoutError.name;
        this.unresolvedPromise = unresolvedPromise;
    }
}

/**
 * Bind a timeout to an asynchronous task.
 *
 * > The real asynchronous task is still running even if the timeout is reached.
 * > If you wanna cancel/abort the task, you should consider using `AbortTimeoutController` instead.
 *
 * @param ms            The timeout duration in milliseconds.
 * @param asyncTask     The asynchronous task to execute, which can be a Promise or a function that returns a Promise.
 *
 * @throws {TimeoutError} If the asynchronous task does not complete within the specified timeout.
 * @returns A Promise with the result of the asynchronous task or a timeout error.
 */
export async function withTimeout<T>(ms: number, asyncTask: Promise<T> | (() => Promise<T>)): Promise<T> {

    const pr: Promise<T> = typeof asyncTask === 'function' ? asyncTask() : asyncTask;

    return new Promise<T>((resolve, reject) => {

        let timer: NodeJS.Timeout | null = setTimeout(() => {
            timer = null; // Clear the timer reference
            reject(new TimeoutError(pr));
        }, ms);

        pr.then(
            (result) => {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                    resolve(result);
                }
            },
            (error) => {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                    reject(error);
                }
            },
        );
    });
}
