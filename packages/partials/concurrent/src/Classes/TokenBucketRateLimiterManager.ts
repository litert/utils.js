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
import { E_RATE_LIMITED, ISyncRateLimiterManager } from '../Types';

/**
 * The options for `TokenBucketRateLimiter`.
 */
export interface ITokenBucketRateLimiterOptions {

    /**
     * The maximum token quantity in the bucket.
     */
    capacity: number;

    /**
     * The initial token quantity in the bucket.
     *
     * @default capacity
     */
    initialTokens?: number;

    /**
     * The interval (in milliseconds) to refill one token.
     */
    refillIntervalMs: number;

    /**
     * How long will an unused context be kept (in milliseconds) even after
     * it is full (i.e. no tokens have been consumed, so that it could be
     * cleaned up).
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

    qty: number;

    filledAt: number;
}

/**
 * A rate limiter implementation, using token bucket algorithm.
 *
 * This is a limiter manager that could manage multiple limiters
 * identified by keys, for convenience of usage in multiple contexts.
 */
export class TokenBucketRateLimiterManager implements ISyncRateLimiterManager {

    private readonly _capacity: number;

    private readonly _refillIntervalMs: number;

    private readonly _initialTokens: number;

    private readonly _cleanDelayMs: number;

    private readonly _errCtor: IConstructor<Error>;

    private readonly _buckets: IDict<IBucket> = {};

    public constructor(opts: ITokenBucketRateLimiterOptions) {

        this._capacity = opts.capacity;
        this._refillIntervalMs = opts.refillIntervalMs;
        this._initialTokens = opts.initialTokens ?? opts.capacity;
        this._cleanDelayMs = opts.cleanDelayMs ?? 0;
        this._errCtor = opts.errorCtorOnLimited ?? E_RATE_LIMITED;

        for (const k of ['capacity', 'refillIntervalMs'] as const) {

            if (!Number.isSafeInteger(this[`_${k}`]) || this[`_${k}`] <= 0) {

                throw new TypeError(`Invalid option: ${k}`);
            }
        }

        for (const k of ['initialTokens', 'cleanDelayMs'] as const) {

            if (!Number.isSafeInteger(this[`_${k}`]) || this[`_${k}`] < 0) {

                throw new TypeError(`Invalid option: ${k}`);
            }
        }

        if (this._initialTokens > this._capacity) {

            throw new TypeError('Invalid option: initialTokens');
        }
    }

    private _getContext(key: string): IBucket {

        return this._buckets[key] ??= {
            qty: this._initialTokens,
            filledAt: Date.now()
        };
    }

    /**
     * Challenge the rate limiter. If it's limited, an error will be thrown.
     * Otherwise, the function will consume a token and return normally.
     *
     * @param key   The key to identify the specific limiter.
     */
    public challenge(key: string): void {

        const b = this._getContext(key);

        this._tryRefill(b);

        if (!b.qty) {

            throw new this._errCtor();
        }

        b.qty--;
    }

    public clean(): void {

        for (const k in this._buckets) {

            const b = this._buckets[k];

            if (
                // if the bucket is full
                b.qty === this._capacity ||
                Date.now() - b.filledAt >= (this._capacity - b.qty) * this._refillIntervalMs + this._cleanDelayMs
            ) {

                delete this._buckets[k];
            }
        }
    }

    private _tryRefill(b: IBucket): void {

        const now = Date.now();

        if (b.qty < this._capacity) {

            const fills = Math.max(
                Math.min(
                    this._capacity - b.qty,
                    Math.floor((now - b.filledAt) / this._refillIntervalMs)
                ),
                0, // in case of time going backwards
            );

            if (!fills) {

                return;
            }

            b.qty += fills;

            b.filledAt = b.qty === this._capacity ?
                now :
                b.filledAt + fills * this._refillIntervalMs;
        }
    }

    /**
     * Call the given function if the limiter is not limited, or throw an error if
     * the limiter is limited.
     *
     * @param key   The key to identify the specific limiter.
     * @param fn    The function to be called.
     * @returns     The return value of the given function.
     * @throws      An error if the limiter is limited, or if the given function throws an error.
     */
    public call<T extends IFunction>(key: string, fn: T): ReturnType<T> {

        this.challenge(key);

        return fn() as ReturnType<T>;
    }

    /**
     * Reset the internal context.
     *
     * @param key   The key to identify the specific limiter.
     */
    public reset(key: string): void {

        delete this._buckets[key];
    }

    /**
     * Check whether the rate limiter is blocking all access now.
     *
     * @param key   The key to identify the specific limiter.
     */
    public isBlocking(key: string): boolean {

        if (!this._buckets[key]) {

            return false;
        }

        const b = this._getContext(key);

        this._tryRefill(b);

        return b.qty === 0;
    }

    /**
     * Wrap the given function with rate limiting challenge.
     *
     * @param key   The key to identify the specific limiter.
     * @param fn    The function to be wrapped.
     * @returns     The new wrapped function.
     */
    public wrap<T extends IFunction>(key: string, fn: T): T {

        return ((...args: unknown[]) => {

            this.challenge(key);

            return fn(...args);

        }) as T;
    }
}
