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

import type { IConstructor, IDict, IFunction } from '@litert/utils-ts-types';
import { E_RATE_LIMITED, IAsyncRateLimiterManager } from '../Types';
import { sleep } from '@litert/utils-async';

/**
 * The options for `LeakyBucketRateLimiterManager`.
 */
export interface ILeakyBucketRateLimiterManagerOptions {

    /**
     * The maximum pending task quantity in the bucket.
     */
    capacity: number;

    /**
     * The interval (in milliseconds) to leak one task.
     */
    leakIntervalMs: number;

    /**
     * How long will an unused context be kept (in milliseconds) even after
     * it is full (i.e. no tokens have been consumed, so that it could be
     * cleaned up).
     *
     * Increasing this value will make the rate limiter consume more memory,
     * but will reduce the chance of re-allocation of contexts if the
     * same keys are used frequently. You should balance this value according to
     * your actual use cases.
     *
     * @default 0 (disabled)
     */
    cleanDelayMs?: number;

    /**
     * The error constructor to be used when the rate limit is exceeded.
     *
     * @default E_RATE_LIMITED
     * @see {@link E_RATE_LIMITED}
     */
    errorCtorOnLimited?: IConstructor<Error>;
}

interface IBucket {

    nextLeakingAt: number;
}

/**
 * A rate limiter implementation, using leaky bucket algorithm.
 *
 * This is a limiter manager that could manage multiple limiters
 * identified by keys, for convenience of usage in multiple contexts.
 */
export class LeakyBucketRateLimiterManager implements IAsyncRateLimiterManager {

    private readonly _buckets: IDict<IBucket> = {};

    private readonly _maxWaitMs: number;

    private readonly _leakIntervalMs: number;

    private readonly _cleanDelayMs: number;

    private readonly _errCtor: IConstructor<Error>;

    public constructor(opts: ILeakyBucketRateLimiterManagerOptions) {

        for (const k of ['capacity', 'leakIntervalMs'] as const) {

            if (!Number.isSafeInteger(opts[k]) || opts[k] <= 0) {

                throw new TypeError(`Invalid option: ${k}`);
            }
        }

        this._maxWaitMs = opts.capacity * opts.leakIntervalMs;
        this._leakIntervalMs = opts.leakIntervalMs;
        this._cleanDelayMs = opts.cleanDelayMs ?? 0;
        this._errCtor = opts.errorCtorOnLimited ?? E_RATE_LIMITED;

        if (!Number.isSafeInteger(this._cleanDelayMs) || this._cleanDelayMs < 0) {

            throw new TypeError(`Invalid option: cleanDelayMs`);
        }
    }

    private _getBucket(key: string): IBucket {

        return this._buckets[key] ??= {
            nextLeakingAt: Date.now()
        };
    }

    public async challenge(key: string): Promise<void> {

        const bucket = this._getBucket(key);

        const ttl = this._leak(bucket);

        if (ttl > 0) {

            await sleep(ttl);
        }
    }

    private _leak(b: IBucket): number {

        const now = Date.now();

        const elapsed = b.nextLeakingAt - now;

        if (elapsed > this._maxWaitMs - this._leakIntervalMs) {

            throw new this._errCtor();
        }

        if (elapsed <= 0) {

            b.nextLeakingAt = now + this._leakIntervalMs;
            return 0;
        }

        b.nextLeakingAt += this._leakIntervalMs;

        return elapsed;
    }

    public size(): number {

        return Object.keys(this._buckets).length;
    }

    public clean(): void {

        const now = Date.now();

        for (const k of Object.keys(this._buckets)) {

            if (this._buckets[k].nextLeakingAt <= now - this._cleanDelayMs) {

                delete this._buckets[k];
            }
        }
    }

    public async call<TFn extends IFunction>(key: string, fn: TFn): Promise<Awaited<ReturnType<TFn>>> {

        await this.challenge(key);

        return fn() as Awaited<ReturnType<TFn>>;
    }

    public reset(key: string): void {

        delete this._buckets[key];
    }

    public isBlocking(key: string): boolean {

        if (!this._buckets[key]) {
            return false;
        }

        const bucket = this._buckets[key];

        return bucket.nextLeakingAt - Date.now() > this._maxWaitMs - this._leakIntervalMs;
    }
}
