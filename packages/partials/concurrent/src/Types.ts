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
export type ISimpleFn = () => unknown;

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
