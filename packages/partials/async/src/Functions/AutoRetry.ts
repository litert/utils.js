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
import { sleep } from './Sleep';

const DEFAULT_RETRY_DELAY_GENERATOR = compositeRetryDelayGenerator({
    'delayGenerator': createExponentialBackoffDelayGenerator(1000, 2),
    'jitter': fullJitter,
    'maxDelay': 30000,
});

/**
 * The default `beforeRetry` callback function that applies an exponential
 * backoff delay, with a full jitter effect, before each retry attempt.
 * The maximum delay is set to 30 seconds.
 */
export const DEFAULT_BEFORE_RETRY: IBeforeRetryCallback = async (ctx): Promise<void> => {

    await sleep(DEFAULT_RETRY_DELAY_GENERATOR(ctx.retriedTimes), ctx.signal);
};

/**
 * The type of the callback functions that can be used to perform actions
 * before each retry attempt (e.g. waiting for a delay, logging, etc.).
 */
export type IBeforeRetryCallback = (context: IRetryContext) => void | Promise<void>;

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
    'beforeRetry'?: IBeforeRetryCallback;

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
 *
 * @example
 *
 * ```ts
 * const ac = new AbortController(); // Optional, to allow aborting the retry operation
 * await autoRetry({
 *  'maxRetries': 5, // Retry no more than 5 times if the first call fails
 *  'function': async (ctx) => {
 *      // Your function logic here
 *  },
 *  // Optional, `DEFAULT_BEFORE_RETRY` will be used if omitted.
 *  'beforeRetry': async (ctx) => {
 *      // Your beforeRetry logic here
 *  },
 *   // Optional, an AbortSignal to allow the retry operation to be aborted.
 *  'signal': ac.signal,
 * });
 * ```
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

                if (opts.signal?.aborted && (
                    (e instanceof Error && e.name === 'AbortError') ||
                    e instanceof AbortedError
                )) {

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

/**
 * The type of functions that generate delays for each retry attempt.
 */
export interface IRetryDelayGenerator {

    /**
     * Generates a delay for the given retry attempt.
     *
     * @param attempt The retry attempt number, starting from 0.
     */
    // eslint-disable-next-line @typescript-eslint/prefer-function-type
    (attempt: number): number;
}

/**
 * The type of functions that apply a jitter to the delay for retry attempts.
 */
export interface IRetryDelayJitterFunction {

    /**
     * Applies a jitter effect to the delay for each retry attempt.
     *
     * @param delay The delay generated by the retry delay generator.
     */
    // eslint-disable-next-line @typescript-eslint/prefer-function-type
    (delay: number): number;
}

export interface IRetryDelayOptions {

    /**
     * The function that generates the delay for each retry attempt.
     */
    'delayGenerator': IRetryDelayGenerator;

    /**
     * The function that applies a jitter to the delay for each retry attempt.
     */
    'jitter': IRetryDelayJitterFunction;

    /**
     * The maximum delay in milliseconds for the retry attempts.
     */
    'maxDelay': number;
}

/**
 * Create a delay generator function using exponential backoff strategy.
 *
 * > WARNING: No recommended to use this function alone,
 * > use it with `compositeRetryDelayGenerator`.
 *
 * @param base      The base time in milliseconds for the first attempt. [default: 1000]
 * @param factor    The factor by which the wait time increases for each subsequent attempt. [default: 2]
 *
 * @returns A function that generates the delay for each retry attempt.
 *
 * @example
 *
 * ```ts
 * const genDelay = createExponentialBackoffDelayGenerator(100, 2);
 *
 * console.log(genDelay(0)); // 100
 * console.log(genDelay(1)); // 200
 * console.log(genDelay(2)); // 400
 * console.log(genDelay(3)); // 800
 * ```
 */
export function createExponentialBackoffDelayGenerator(
    base: number = 1000,
    factor: number = 2,
): IRetryDelayGenerator {

    return (attempt: number): number => {

        if (attempt < 0 || !Number.isSafeInteger(attempt)) {

            throw new RangeError('Attempt number must be a non-negative integer');
        }

        return base * Math.pow(factor, attempt);
    };
}

/**
 * Apply a full jitter to the delay for retry attempts, which means the final
 * delay will be in the range of `[0, delay)`.
 *
 * @param delay     The original delay.
 * @returns The delay with full jitter applied.
 */
export function fullJitter(delay: number): number {

    return Math.floor(Math.random() * delay);
}

/**
 * Apply a equal jitter to the delay for retry attempts, which means the final
 * delay will be in the range of `[delay / 2, delay)`.
 *
 * @param delay     The original delay.
 * @returns The delay with equal jitter applied.
 */
export function equalJitter(delay: number): number {

    return Math.floor(delay / 2 + Math.random() * delay / 2);
}

/**
 * Create a new retry delay generator by compositing the delay generator,
 * jitter function, and adding a maximum delay protection.
 *
 * @param opts  The options for the retry delay generator.
 *
 * @returns A new retry delay generator.
 *
 * @example
 *
 * ```ts
 * const genDelay = compositeRetryDelayGenerator({
 *   'delayGenerator': createExponentialBackoffDelayGenerator(1000, 2),
 *   'jitter': fullJitter,
 *   'maxDelay': 30000,
 * });
 *
 * await autoRetry({
 *   'maxRetries': 5,
 *   'function': async (ctx) => { ... },
 *   'beforeRetry': async (ctx) => {
 *     await sleep(genDelay(ctx.retriedTimes));
 *   },
 * })
 * ```
 */
export function compositeRetryDelayGenerator(
    opts: IRetryDelayOptions,
): IRetryDelayGenerator {

    const {
        delayGenerator,
        jitter,
        maxDelay,
    } = opts;

    return (i) => Math.min(maxDelay, jitter(delayGenerator(i)));
}
