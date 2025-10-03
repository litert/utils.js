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

    public isIdle(): boolean {

        return this._nextLeakingAt <= Date.now();
    }

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

    public async call<TFn extends IFunction>(fn: TFn): Promise<Awaited<ReturnType<TFn>>> {

        await this.challenge();

        return fn() as Awaited<ReturnType<TFn>>;
    }

    public reset(): void {

        this._nextLeakingAt = Date.now();
    }

    public isBlocking(): boolean {

        return this._nextLeakingAt - Date.now() > this._maxWaitMs - this._leakIntervalMs;
    }

    public wrap<T extends IFunction>(fn: T): IFunction<Parameters<T>, IToPromise<ReturnType<T>>> {

        return (async (...args: unknown[]) => {

            await this.challenge();

            return fn(...args);

        }) as unknown as IFunction<Parameters<T>, IToPromise<ReturnType<T>>>;
    }
}
