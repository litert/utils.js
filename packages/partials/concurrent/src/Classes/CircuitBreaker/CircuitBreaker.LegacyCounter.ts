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
 * The legacy counter for `CircuitBreaker`, which only counts the number of
 * failed requests and opens the circuit breaker when the number of failed
 * requests exceeds a threshold.
 *
 * This counter is provided for backward compatibility, and it is recommended
 * to switch to the `ErrorRateCircuitBreakerCounter` for new implementations,
 * which is based on error rate.
 *
 * @deprecated Use `ErrorRateCircuitBreakerCounter` or a custom counter instead
 */
export class LegacyCircuitBreakerCounter implements tL.ICircuitBreakerCounter {

    private readonly _counter: ICounter;

    private readonly _breakThreshold: number;

    public constructor(
        threshold: number = 5,
        counter: ICounter = new SlideWindowCounter({
            windowSizeMs: 10000,
            windowQty: 6,
        }),
    ) {

        this._breakThreshold = threshold;
        this._counter = counter;
    }

    public record(success: boolean): void {

        if (!success) {

            this._counter.increase();
        }
    }

    public isBlocked(): boolean {

        return this._counter.getTotal() >= this._breakThreshold;
    }

    public reset(): void {

        this._counter.reset();
    }
}
