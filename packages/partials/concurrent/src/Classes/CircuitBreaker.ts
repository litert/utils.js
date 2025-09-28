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

import type { IConstructor } from '@litert/utils-ts-types';
import { EventEmitter } from 'node:events';
import { SlideWindowCounter } from './SlideWindowCounter';
import { E_BREAKER_OPENED, ISimpleFn } from './ManualBreaker';

export { E_BREAKER_OPENED, ISimpleFn };

export interface ICircuitBreakerEvents {

    'error': [error: unknown];

    'opened': [];

    ['half_opened']: [];

    'closed': [];
}

enum EState {
    CLOSED,
    OPENED,
    HALF_OPENED
}

export type IStrategyFn = (failures: number, openedAt: number) => number;

export interface ICircuitBreakerOptions {

    /**
     * Cooldown time in milliseconds, after which the circuit breaker will
     * try to recover from OPEN state.
     *
     * Default: 60000 (1 minute)
     */
    cooldownTimeMs?: number;

    /**
     * How many failures are needed to open the circuit breaker.
     *
     * Default: 5
     */
    breakThreshold?: number;

    /**
     * How many successful calls are needed to close the circuit breaker
     * after it has been half-opened.
     *
     * Default: 3
     */
    warmupThreshold?: number;

    /**
     * A callback to determine whether the errors thrown by the target function
     * should be treated as a failure or not.
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

    /**
     * The slide window counter to use for counting failures.
     *
     * @default new SlideWindowCounter({
     *   windowSizeMs: 10000,
     *   windowQty: 6
     * })
     */
    counter?: ICounter;
}

/**
 * The interface type of a counter.
 */
export interface ICounter {

    /**
     * Count up by the specified quantity.
     *
     * @param qty The quantity to count up with, always a positive integer. [Default: 1]
     *
     * @returns the total of the valid counts after counting up.
     */
    count(): number;

    /**
     * Reset the counter to zero.
     */
    reset(): void;

    /**
     * Get the total of the valid counts within the Slide window.
     */
    getTotal(): number;
}

const DEFAULT_OPTIONS: Required<ICircuitBreakerOptions> = {
    'cooldownTimeMs': 60000,
    'breakThreshold': 5,
    'warmupThreshold': 3,
    'isFailure': () => true,
    'errorCtorOnOpen': E_BREAKER_OPENED,
    'counter': null as unknown as ICounter,
};

export class CircuitBreaker extends EventEmitter<ICircuitBreakerEvents> {

    private readonly _cooldownTimeMs: number;

    private _nextAttemptAt: number = 0;

    /**
     * How many failures have occurred under CLOSED state.
     */
    private readonly _failureCount: ICounter;

    /**
     * How many successful calls have occurred under HALF_OPEN state.
     */
    private _warmUpOkCount: number = 0;

    /**
     * How many calls have been made (maybe not done yet) under HALF_OPEN state.
     */
    private _warmUpCallCount: number = 0;

    private _state: EState = EState.CLOSED;

    private readonly _isFailure: (error: unknown) => boolean;

    /**
     * The minimum number of failures to trigger the breaker.
     */
    private readonly _breakThreshold: number;

    /**
     * The maximum number of calls allowed under HALF_OPEN state.
     *
     * This is to prevent too many calls being made when the service is still unstable.
     */
    private readonly _warmupThreshold: number;

    private _warmUpBatchCount: number = 0;

    /**
     * The constructor of errors to be thrown when the breaker is open.
     */
    private readonly _errorCtorOnOpen: IConstructor<Error>;

    public constructor(options: ICircuitBreakerOptions = {}) {

        super();
        this._cooldownTimeMs = options.cooldownTimeMs ?? DEFAULT_OPTIONS.cooldownTimeMs;
        this._breakThreshold = options.breakThreshold ?? DEFAULT_OPTIONS.breakThreshold;
        this._warmupThreshold = options.warmupThreshold ?? DEFAULT_OPTIONS.warmupThreshold;

        for (const p of ['cooldownTimeMs', 'breakThreshold', 'warmupThreshold'] as const) {

            const v = this[`_${p}`];

            if (!Number.isSafeInteger(v) || v <= 0) {

                throw new TypeError(`The option "${p}" must be a positive integer.`);
            }
        }

        this._isFailure = options.isFailure ?? DEFAULT_OPTIONS.isFailure;
        this._errorCtorOnOpen = options.errorCtorOnOpen ?? DEFAULT_OPTIONS.errorCtorOnOpen;

        for (const p of ['isFailure', 'errorCtorOnOpen'] as const) {

            const v = this[`_${p}`];

            if (typeof v !== 'function') {

                throw new TypeError(`The option "${p}" must be a function.`);
            }
        }

        this._failureCount = options.counter ?? new SlideWindowCounter({
            windowSizeMs: 10000,
            windowQty: 6,
        });
    }

    public call<TFn extends ISimpleFn>(fn: TFn): ReturnType<TFn> {

        switch (this._state) {
            case EState.CLOSED:
                return this._callOnClosed(fn);
            case EState.OPENED:
                return this._callOnOpen(fn);
            case EState.HALF_OPENED:
                return this._callOnHalfOpen(fn);
        }
    }

    public open(until: number = Date.now() + this._cooldownTimeMs): void {

        this._nextAttemptAt = until;
        this._warmUpCallCount = 0;
        this._warmUpOkCount = 0;
        this._failureCount.reset();

        if (this._state !== EState.OPENED) {

            this._state = EState.OPENED;
            this.emit('opened');
        }
    }

    private _openHalf(): void {

        if (this._state === EState.HALF_OPENED) {
            return;
        }

        this._warmUpBatchCount++;
        this._warmUpCallCount = 0;
        this._warmUpOkCount = 0;
        this._failureCount.reset();
        this._state = EState.HALF_OPENED;
        this.emit('half_opened');
    }

    /**
     * Close the circuit breaker, no matter what state it is in now.
     *
     * This will reset all the counts, and starts to let go all the calls until
     * the breaker gets opened again.
     */
    public close(): void {

        this._failureCount.reset();
        this._warmUpOkCount = 0;
        this._warmUpCallCount = 0;

        if (this._state !== EState.CLOSED) {

            this._state = EState.CLOSED;
            this.emit('closed');
        }
    }

    private _callOnClosed<TFn extends ISimpleFn>(fn: TFn): ReturnType<TFn> {

        try {

            const result = fn();

            if (result instanceof Promise) {

                result.catch(
                    (err) => { this._handleFailureOnClosed(err); }
                );

                return result as unknown as ReturnType<TFn>;
            }

            return result as ReturnType<TFn>;
        }
        catch (err) {

            this._handleFailureOnClosed(err);
            throw err;
        }
    }

    private _handleFailureOnClosed(err: unknown): void {

        if (!this._isFailure(err)) {

            return;
        }

        if (this._failureCount.count() >= this._breakThreshold) {

            this.open();
        }
    }

    private _callOnOpen<TFn extends ISimpleFn>(fn: TFn): ReturnType<TFn> {

        if (Date.now() >= this._nextAttemptAt) {

            this._openHalf();
            return this._callOnHalfOpen(fn);
        }

        const ctor = this._errorCtorOnOpen;
        throw new ctor();
    }

    private _callOnHalfOpen<TFn extends ISimpleFn>(fn: TFn): ReturnType<TFn> {

        if (this._warmUpCallCount >= this._warmupThreshold) {
            const ctor = this._errorCtorOnOpen;
            throw new ctor();
        }

        this._warmUpCallCount++;
        const batchId = this._warmUpBatchCount;

        try {

            const result = fn();

            if (result instanceof Promise) {

                result.then(
                    () => { this._handleWarmUpCallSuccess(batchId); },
                    () => { this._handleWarmUpCallFailure(batchId); },
                );

                return result as unknown as ReturnType<TFn>;
            }

            this._handleWarmUpCallSuccess(batchId);

            return result as ReturnType<TFn>;
        }
        catch (err) {

            this._handleWarmUpCallFailure(batchId);
            throw err;
        }
    }

    private _handleWarmUpCallFailure(batchId: number): void {

        if (this._state !== EState.HALF_OPENED || batchId !== this._warmUpBatchCount) {
            return;
        }

        this.open();
    }

    private _handleWarmUpCallSuccess(batchId: number): void {

        if (this._state !== EState.HALF_OPENED || batchId !== this._warmUpBatchCount) {
            return;
        }

        this._warmUpOkCount++;

        if (this._warmUpOkCount >= this._warmupThreshold) {

            this.close();
        }
    }

    public isOpened(): boolean {

        if (this._state === EState.OPENED) {

            if (Date.now() < this._nextAttemptAt) {

                return true;
            }

            this._openHalf();
        }

        return false;
    }

    public isClosed(): boolean {

        return this._state === EState.CLOSED;
    }

    public isHalfOpened(): boolean {

        switch (this._state) {
            default:
            case EState.CLOSED:
                return false;
            case EState.OPENED:
                if (Date.now() < this._nextAttemptAt) {
                    return false;
                }
                this._openHalf();
                return true;
            case EState.HALF_OPENED:
                return true;
        }
    }

    public wrap<TFn extends ISimpleFn>(fn: TFn): TFn {

        return ((): unknown => this.call(fn)) as TFn;
    }
}
