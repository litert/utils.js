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
import { E_RATE_LIMITED, ICounter } from '../Types';

/**
 * The options for `CountingRateLimiter`.
 */
export interface ICountingRateLimiterOptions {

    /**
     * The maximum allowed counts in the counting window.
     */
    limits: number;

    /**
     * The counter instance to be used.
     */
    counter: ICounter;

    /**
     * The error constructor to be used when the rate limit is exceeded.
     *
     * @default E_RATE_LIMITED
     * @see {@link E_RATE_LIMITED}
     */
    errorCtorOnLimited?: IConstructor<Error>;
}

/**
 * A rate limiter implementation working with a counter.
 */
export class CountingRateLimiter {

    private readonly _counter: ICounter;

    private readonly _errCtor: IConstructor<Error>;

    private readonly _limits: number;

    public constructor(opts: ICountingRateLimiterOptions) {

        this._limits = opts.limits;
        this._counter = opts.counter;
        this._errCtor = opts.errorCtorOnLimited ?? E_RATE_LIMITED;
    }

    /**
     * Challenge the rate limiter. If it's limited, an error will be thrown.
     * Otherwise, the internal counter will be increased by one,
     * and the function will return normally.
     */
    public challenge(): void {

        this._counter.increase();

        if (this.isLimited()) {

            throw new this._errCtor();
        }
    }

    /**
     * Reset the internal counter.
     */
    public reset(): void {

        this._counter.reset();
    }

    /**
     * Check whether the rate limiter is limited now.
     */
    public isLimited(): boolean {

        return this._counter.getTotal() > this._limits;
    }

    /**
     * Wrap the given function with rate limiting challenge.
     *
     * @param fn    The function to be wrapped.
     * @returns     The new wrapped function.
     */
    public wrap<T extends IFunction>(fn: T): T {

        return ((...args: unknown[]) => {

            this.challenge();

            return fn(...args);

        }) as T;
    }
}
