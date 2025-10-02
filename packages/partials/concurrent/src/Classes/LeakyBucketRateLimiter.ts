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

import type { IConstructor, IFunction, IToPromise } from '@litert/utils-ts-types';
import { E_RATE_LIMITED, IAsyncRateLimiter } from '../Types';
import { sleep } from '@litert/utils-async';

/**
 * The options for `LeakyBucketRateLimiter`.
 */
export interface ILeakyBucketRateLimiterOptions {

    /**
     * The maximum pending task quantity in the bucket.
     */
    capacity: number;

    /**
     * The interval (in milliseconds) to leak one task.
     */
    leakIntervalMs: number;

    /**
     * The error constructor to be used when the rate limit is exceeded.
     *
     * @default E_RATE_LIMITED
     * @see {@link E_RATE_LIMITED}
     */
    errorCtorOnLimited?: IConstructor<Error>;
}

/**
 * A rate limiter implementation, using leaky bucket algorithm.
 */
export class LeakyBucketRateLimiter implements IAsyncRateLimiter {

    private _nextLeakingAt: number = Date.now();

    private readonly _maxWaitMs: number;

    private readonly _leakIntervalMs: number;

    private readonly _errCtor: IConstructor<Error>;

    public constructor(opts: ILeakyBucketRateLimiterOptions) {

        for (const k of ['capacity', 'leakIntervalMs'] as const) {

            if (!Number.isSafeInteger(opts[k]) || opts[k] <= 0) {

                throw new TypeError(`Invalid option: ${k}`);
            }
        }

        this._maxWaitMs = opts.capacity * opts.leakIntervalMs;
        this._leakIntervalMs = opts.leakIntervalMs;
        this._errCtor = opts.errorCtorOnLimited ?? E_RATE_LIMITED;
    }

    /**
     * Challenge the rate limiter. If it's limited, an error will be thrown.
     * Otherwise, the function will wait until the task is able to be processed.
     */
    public async challenge(): Promise<void> {

        const ttl = this._leak();

        if (ttl > 0) {

            await sleep(ttl);
        }
    }

    private _leak(): number {

        const now = Date.now();

        const elapsed = this._nextLeakingAt - now;

        if (elapsed > this._maxWaitMs - this._leakIntervalMs) {

            throw new this._errCtor();
        }

        if (elapsed <= 0) {

            this._nextLeakingAt = now + this._leakIntervalMs;
            return 0;
        }

        this._nextLeakingAt += this._leakIntervalMs;

        return elapsed;
    }

    /**
     * Call the given function if the limiter is not limited, or throw an error if
     * the limiter is limited.
     *
     * @param cb    The function to be called.
     * @returns     The return value of the given function.
     * @throws      An error if the limiter is limited, or if the given function throws an error.
     */
    public async call<TFn extends IFunction>(fn: TFn): Promise<Awaited<ReturnType<TFn>>> {

        await this.challenge();

        return fn() as Awaited<ReturnType<TFn>>;
    }

    /**
     * Reset the internal context.
     */
    public reset(): void {

        this._nextLeakingAt = Date.now();
    }

    /**
     * Check whether the rate limiter is blocking all access now.
     */
    public isLimited(): boolean {

        return this._nextLeakingAt - Date.now() > this._maxWaitMs - this._leakIntervalMs;
    }

    /**
     * Wrap the given function with rate limiting challenge.
     *
     * @param fn    The function to be wrapped.
     * @returns     The new wrapped function.
     */
    public wrap<T extends IFunction>(fn: T): IFunction<Parameters<T>, IToPromise<ReturnType<T>>> {

        return (async (...args: unknown[]) => {

            await this.challenge();

            return fn(...args);

        }) as unknown as IFunction<Parameters<T>, IToPromise<ReturnType<T>>>;
    }
}
