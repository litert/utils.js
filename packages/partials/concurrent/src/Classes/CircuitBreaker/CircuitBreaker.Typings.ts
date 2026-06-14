/**
 * Copyright 2026 Angus.Fenying <fenying@litert.org>
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

import type { IConstructor } from '@litert/utils-ts-types';
import type { ICounter } from '../../Typings.js';

/**
 * The events emitted by `CircuitBreaker`.
 */
export interface ICircuitBreakerEvents {

    'error': [error: unknown];

    'opened': [];

    ['half_opened']: [];

    'closed': [];
}

/**
 * The basic options for `CircuitBreaker`.
 */
interface ICircuitBreakerOptionsBase {

    /**
     * Cooldown time in milliseconds, after which the circuit breaker will
     * try to recover from OPEN state.
     *
     * Default: 60000 (1 minute)
     */
    cooldownTimeMs?: number;

    /**
     * How many consecutive successful calls are needed to close the circuit
     * breaker after it has been half-opened.
     *
     * Default: 3
     */
    warmupThreshold?: number;

    /**
     * A callback to determine whether the errors thrown by the target
     * function should be treated as a failure or not.
     *
     * Only the failures are counted to trigger the circuit breaker.
     *
     * @default () => true
     */
    isFailure?: (error: unknown) => boolean;

    /**
     * An optional constructor to create the error object that will be thrown
     * when the circuit breaker is open.
     *
     * @default E_BREAKER_OPENED
     */
    errorCtorOnOpen?: IConstructor<Error>;
}

/**
 * The requests counter for `CircuitBreaker`.
 *
 * All logics related to counting requests and determining whether the
 * circuit breaker should open based on the count should be implemented
 * in the counter, and `CircuitBreaker` will just call the counter to
 * record requests and check whether the circuit breaker should open or not.
 */
export interface ICircuitBreakerCounter {

    /**
     * Record the result of requests.
     *
     * @param success Whether the result of a request is successful.
     */
    record(success: boolean): void;

    /**
     * Resets the counter to its initial state.
     */
    reset(): void;

    /**
     * Whether the counter is currently reaching the break threshold.
     */
    isBlocked(): boolean;
}

/**
 * The options for `CircuitBreaker`.
 *
 * @deprecated Use `ICircuitBreakerOptions` instead.
 */
export interface ICircuitBreakerOptionsLegacy
    extends ICircuitBreakerOptionsBase {

    /**
     * How many failures are needed to open the circuit breaker.
     *
     * Default: 5
     * @deprecated Use `requestCounter` with an `ICircuitBreakerCounter`
     *             implementation instead.
     */
    breakThreshold?: number;

    /**
     * The slide window counter to use for counting failures.
     *
     * @default new SlideWindowCounter({
     *   windowSizeMs: 10000,
     *   windowQty: 6
     * })
     * @deprecated Use `requestCounter` with an `ICircuitBreakerCounter`
     *             implementation instead.
     */
    counter?: ICounter;
}

/**
 * The options for `CircuitBreaker`.
 */
export interface ICircuitBreakerOptions extends ICircuitBreakerOptionsBase {

    /**
     * The counter to use for counting requests.
     *
     * For convenience, a built-in `ErrorRateCircuitBreakerCounter` is provided,
     * which counts the error rate of requests and opens the circuit breaker
     * when the error rate exceeds a threshold.
     *
     * > The user could implement their own counter by implementing the
     * > `ICircuitBreakerCounter` interface, and take control of the logic
     * > of counting requests and determining when to open the circuit breaker.
     */
    requestCounter: ICircuitBreakerCounter;
}
