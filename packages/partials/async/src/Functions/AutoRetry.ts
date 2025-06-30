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
import * as NodeTimers from 'node:timers/promises';

const DEFAULT_BEFORE_RETRY = async (ctx: IRetryContext): Promise<void> => {

    await NodeTimers.setTimeout(
        (ctx.retriedTimes + 1) * 1000,
        undefined,
        { signal: ctx.signal, }
    );
};

/**
 * The options for the `autoRetry` function.
 */
export interface IRetryOptions<TResult> {

    /**
     * How many times the function should be retried, after the first call failed (which is excluding the first call).
     *
     * This value must be a positive integer.
     */
    'maxRetries': number;

    /**
     * The main function to be called.
     *
     * @param context       The retry context, which contains: retriedTimes, error, signal.
     */
    'function': (context: IRetryContext) => Promise<TResult>;

    /**
     * A callback function to be called before each retry (except the first call, before the first
     * retry). This function is useful if you want to:
     *
     * - perform a delay before the retry
     * - to log the retry attempt.
     * - reset some state.
     * - check if the retry should be performed (throw out the error to stop the retry).
     * - ... (other custom logic)
     *
     * @param context       The retry context, which contains: signal, retriedTimes, error.
     *
     * @returns a `Promise` that resolves when the retry is ready to be performed.
     *
     * @default (ctx) => NodeTimer.promises.setTimeout((ctx.retriedTimes + 1) * 1000, undefined, { signal: ctx.signal, });
     */
    'beforeRetry'?: (context: IRetryContext) => void | Promise<void>;

    /**
     * An optional `AbortSignal` to cancel the retry operations (or the main function if needed).
     *
     * @default undefined
     */
    'signal'?: AbortSignal;
}

/**
 * The context for the retry operation, which contains the current retry state.
 */
export interface IRetryContext {

    /**
     * How many times the function has been retried so far (excluding the first call, so it starts from `0`).
     *
     * If you wanna know it's the first call or a retry, you can check if this value is `0`.
     */
    readonly retriedTimes: number;

    /**
     * The last error thrown by the main function.
     */
    readonly error: unknown;

    /**
     * The AbortSignal used to cancel the retry operation.
     */
    readonly signal?: AbortSignal;
}

/**
 * This function will automatically retry the given function if it fails, until the maximum number of retries is
 * reached, or the function succeeds, or the operation is aborted.
 *
 * > Here is two way to stop the retry:
 * >
 * > - Throw an error in the `beforeRetry` function.
 * > - Abort the `AbortSignal` passed in the options.
 *
 * @param opts  The options for the retry logic.
 *
 * @return A `Promise` that resolves to the result of the given function.
 *
 * @throws {TypeError} If the `maxRetries` option is not a positive integer.
 * @throws If the `beforeRetry` function throws an `AbortError`, the error thrown by the main function by be rethrown,
 *         and the retry will be stopped.
 * @throws If the `beforeRetry` function throws a new error, it will be thrown out and the retry will be stopped.
 * @throws If all retries are exhausted, the last error thrown by the main function will be rethrown.
 * @throws If aborted during calling the main function, the last error thrown by the main function will be rethrown.
 */
export async function autoRetry<TResult>(opts: IRetryOptions<TResult>): Promise<TResult> {

    if (!Number.isSafeInteger(opts.maxRetries) || opts.maxRetries <= 0) {

        throw new TypeError('The "maxRetries" option must be a positive integer.');
    }

    opts.beforeRetry ??= DEFAULT_BEFORE_RETRY;

    let retriedTimes = 0;
    let lastError: unknown = null;

    while (true) {

        try {

            return await opts.function({ retriedTimes, error: lastError, signal: opts.signal, });
        }
        catch (e) {

            if (retriedTimes >= opts.maxRetries || opts.signal?.aborted) {

                throw e;
            }

            lastError = e;

            try {

                const prBR =  opts.beforeRetry({ retriedTimes, error: e, signal: opts.signal, });

                if (prBR instanceof Promise) {

                    await prBR;
                }
            }
            catch (e) {

                if (opts.signal?.aborted && e instanceof Error && e.name === 'AbortError') {

                    throw lastError;
                }

                throw e;
            }

            if (opts.signal?.aborted) {

                throw e;
            }

            retriedTimes++;
        }
    }
}
