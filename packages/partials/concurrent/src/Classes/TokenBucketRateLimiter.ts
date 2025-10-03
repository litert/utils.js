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

import type { IConstructor, IFunction } from '@litert/utils-ts-types';
import { E_RATE_LIMITED, ISyncRateLimiter } from '../Types';

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
     * The error constructor to be used when the rate limit is exceeded.
     *
     * @default E_RATE_LIMITED
     * @see {@link E_RATE_LIMITED}
     */
    errorCtorOnLimited?: IConstructor<Error>;
}

/**
 * A rate limiter implementation, using token bucket algorithm.
 */
export class TokenBucketRateLimiter implements ISyncRateLimiter {

    private _qty: number;

    private _filledAt: number;

    private readonly _capacity: number;

    private readonly _refillIntervalMs: number;

    private readonly _errCtor: IConstructor<Error>;

    public constructor(opts: ITokenBucketRateLimiterOptions) {

        this._capacity = opts.capacity;
        this._refillIntervalMs = opts.refillIntervalMs;
        this._qty = opts.initialTokens ?? opts.capacity;
        this._filledAt = Date.now();
        this._errCtor = opts.errorCtorOnLimited ?? E_RATE_LIMITED;

        for (const k of ['capacity', 'refillIntervalMs'] as const) {

            if (!Number.isSafeInteger(this[`_${k}`]) || this[`_${k}`] <= 0) {

                throw new TypeError(`Invalid option: ${k}`);
            }
        }

        if (!Number.isSafeInteger(this._qty) || this._qty > this._capacity || this._qty < 0) {

            throw new TypeError('Invalid option: initialTokens');
        }
    }

    public challenge(): void {

        this._tryRefill();

        if (!this._qty) {

            throw new this._errCtor();
        }

        this._qty--;
    }

    public isIdle(): boolean {

        this._tryRefill();

        return this._qty === this._capacity;
    }

    private _tryRefill(): void {

        const now = Date.now();

        if (this._qty < this._capacity) {

            const fills = Math.max(
                Math.min(
                    this._capacity - this._qty,
                    Math.floor((now - this._filledAt) / this._refillIntervalMs)
                ),
                0, // in case of time going backwards
            );

            if (!fills) {
                return;
            }

            this._qty += fills;

            this._filledAt = this._qty === this._capacity ?
                now :
                this._filledAt + fills * this._refillIntervalMs;
        }
    }

    public call<T extends IFunction>(fn: T): ReturnType<T> {

        this.challenge();

        return fn() as ReturnType<T>;
    }

    public reset(): void {

        this._qty = this._capacity;
        this._filledAt = Date.now();
    }

    public isBlocking(): boolean {

        this._tryRefill();

        return this._qty === 0;
    }

    public wrap<T extends IFunction>(fn: T): T {

        return ((...args: unknown[]) => {

            this.challenge();

            return fn(...args);

        }) as T;
    }
}
