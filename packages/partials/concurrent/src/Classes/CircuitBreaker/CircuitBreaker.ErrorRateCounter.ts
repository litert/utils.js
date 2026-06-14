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

import type { ICounter } from '../../Typings.js';
import { SlideWindowCounter } from '../SlideWindowCounter.js';
import type * as tL from './CircuitBreaker.Typings.js';

/**
 * The options for ErrorRateCircuitBreakerCounter.
 */
export interface IErrorRateCircuitBreakerCounterOptions {

    /**
     * The error rate threshold to trigger the circuit break, in range [0, 1].
     *
     * @type float(0, 1)
     */
    errorRateThreshold: number;

    /**
     * The minimum request count to trigger the circuit break, to avoid the
     * case that the error rate is high but the total request count is very
     * low, which may cause false positive.
     *
     * @type uint
     */
    minRequest: number;

    /**
     * The factory to create the counter instance, for both total requests
     * and error requests.
     *
     * The provided factory will be called twice to create two separate
     * counter instances for both total requests and error requests, so the
     * user should make sure that the factory can create multiple independent
     * counter instances.
     *
     * @default () => new SlideWindowCounter({
     *     windowSizeMs: 10000,
     *     windowQty: 6,
     * })
     */
    createCounter?: () => ICounter;
}

const DEFAULT_CTR_FACTORY = (): ICounter => new SlideWindowCounter({
    windowSizeMs: 10000,
    windowQty: 6,
});

/**
 * The error-rate based requests counter for CircuitBreaker, built on sliding
 * window counter algorithm.
 */
export class ErrorRateCircuitBreakerCounter
implements tL.ICircuitBreakerCounter {

    private readonly _totalCounter: ICounter;

    private readonly _errorCounter: ICounter;

    private readonly _breakThreshold: number;

    private readonly _minRequest: number;

    public constructor(opts: IErrorRateCircuitBreakerCounterOptions) {

        this._breakThreshold = opts.errorRateThreshold;
        this._minRequest = opts.minRequest;

        if (
            this._breakThreshold <= 0 ||
            this._breakThreshold >= 1 ||
            Number.isNaN(this._breakThreshold)
        ) {

            throw new RangeError(
                'errorRateThreshold must be a number in range (0, 1)'
            );
        }

        if (!Number.isSafeInteger(this._minRequest) || this._minRequest < 0) {

            throw new RangeError('minRequest must be a non-negative integer');
        }

        this._totalCounter = opts.createCounter?.() ?? DEFAULT_CTR_FACTORY();
        this._errorCounter = opts.createCounter?.() ?? DEFAULT_CTR_FACTORY();
    }

    public record(success: boolean): void {

        this._totalCounter.increase();
        if (!success) {
            this._errorCounter.increase();
        }
    }

    public isBlocked(): boolean {

        const total = this._totalCounter.getTotal();

        if (total < this._minRequest) {

            return false;
        }

        return this._errorCounter.getTotal() / total >= this._breakThreshold;
    }

    public reset(): void {

        this._totalCounter.reset();
        this._errorCounter.reset();
    }
}
