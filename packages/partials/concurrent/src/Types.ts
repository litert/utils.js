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

import type { IFunction, IMaybeAsync, IToPromise } from '@litert/utils-ts-types';

/**
 * The interface for counter.
 */
export interface ICounter {

    /**
     * Get the total valid counts in the counter.
     */
    getTotal(): number;

    /**
     * Increase the counter by one.
     */
    increase(): number;

    /**
     * Reset the counter.
     */
    reset(): void;
}

/**
 * A type alias for a simple function without parameters.
 */
export type ISimpleFn = IFunction<[]>;

/**
 * The interface for breakers.
 */
export interface IBreaker {

    /**
     * Call the given function if the breaker is closed, or throw an error if
     * the breaker is open.
     *
     * @param cb    The function to be called.
     *
     * @returns     The return value of the given function.
     *
     * @throws      An error if the breaker is open, or if the given function throws an error.
     */
    call<T extends IFunction>(fn: T): ReturnType<T>;

    /**
     * Wrap the given function, returning a new function that limited by the breaker.
     *
     * @param fn    The function to be wrapped.
     *
     * @returns     The wrapped function.
     */
    wrap<T extends IFunction>(fn: T): T;
}

/**
 * The interface for synchronous rate limiters.
 */
export interface ISyncRateLimiter {

    /**
     * Check whether the limiter is blocking all access now.
     */
    isLimited(): boolean;

    /**
     * Check whether the limiter is empty now.
     */
    isEmpty(): boolean;

    /**
     * Manually challenge the rate limiter. If it's limited, an error will be
     * thrown, so that the request is rejected.
     * Otherwise, the function will consume a token and return normally, which
     * means that the request is allowed to proceed.
     */
    challenge(): void;

    /**
     * Reset the internal context to unlimited state.
     */
    reset(): void;

    /**
     * Call the given function if the limiter is not limited, or throw an error if
     * the limiter is limited.
     *
     * @param cb    The function to be called.
     *
     * @returns     The return value of the given function.
     *
     * @throws      An error if the limiter is limited, or if the given function throws an error.
     */
    call<T extends IFunction>(fn: T): ReturnType<T>;

    /**
     * Wrap the given function with rate limiting challenge.
     *
     * @param fn    The function to be wrapped.
     *
     * @returns     The new wrapped function.
     */
    wrap<T extends IFunction>(fn: T): T;
}

/**
 * The interface for asynchronous rate limiters.
 */
export interface IAsyncRateLimiter {

    /**
     * Check whether the limiter is blocking all access now.
     */
    isLimited(): IMaybeAsync<boolean>;

    /**
     * Manually challenge the rate limiter. If it's limited, an error will be
     * thrown, so that the request is rejected.
     *
     * Otherwise, the function will consume a token and return normally, which
     * means that the request is allowed to proceed.
     */
    challenge(): Promise<void>;

    /**
     * Reset the internal context to unlimited state.
     */
    reset(): IMaybeAsync<void>;

    /**
     * Call the given function if the limiter is not limited, or throw an error if
     * the limiter is limited.
     *
     * @param cb    The function to be called.
     *
     * @returns     The return value of the given function.
     *
     * @throws      An error if the limiter is limited, or if the given function throws an error.
     */
    call<T extends IFunction>(fn: T): Promise<
        ReturnType<T> extends Promise<any> ?
            Awaited<ReturnType<T>> :
            ReturnType<T>
    >;

    /**
     * Wrap the given function with rate limiting challenge.
     *
     * @param fn    The function to be wrapped.
     *
     * @returns     The new wrapped function.
     */
    wrap<T extends IFunction>(fn: T): IFunction<Parameters<T>, IToPromise<ReturnType<T>>>;
}

/**
 * The default error thrown when the rate limit is exceeded.
 */
export const E_RATE_LIMITED = class extends Error {

    public constructor() {
        super('The rate limit has been exceeded.');
        this.name = 'rate_limited';
    }
};

/**
 * The error thrown when a breaker is open.
 */
export const E_BREAKER_OPENED = class extends Error {

    public constructor() {
        super('The breaker is open.');
        this.name = 'breaker_opened';
    }
};
