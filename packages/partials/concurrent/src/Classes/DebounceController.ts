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
import { EventEmitter } from 'node:events';

export type IDebouncingFunction = () => void;

/**
 * The options for the debounce controller.
 */
export interface IDebounceOptions {

    /**
     * The raw function to be debounced.
     */
    function: IDebouncingFunction;

    /**
     * The delay time in milliseconds before the function is called.
     *
     * If the `call` method is called, a timer will be started, and when the timer expires,
     * the function will be called. Before the timer expires, if the `call` method is called again,
     * the timer will be reset, so the function will not be called until the new timer expires.
     */
    delayMs: number;

    /**
     * The maximum delay time in milliseconds.
     *
     * If the elapsed time since the debounce started is greater than this value,
     * the delay will be ignored, and the function will be called immediately.
     *
     * @default Number.MAX_SAFE_INTEGER
     */
    maxDelayMs?: number;
}

export interface IDebounceControllerEvents {

    'error': [error: unknown];

    'triggered': [];
}

/**
 * The wrapper class for debouncing a function call.
 *
 * @noInheritDoc
 */
export class DebounceController extends EventEmitter<IDebounceControllerEvents> {

    private readonly _rawFunction: IDebouncingFunction;

    /**
     * The delay time in milliseconds before the function is called.
     *
     * If the `call` method is called, a timer will be started, and when the timer expires,
     * the function will be called. Before the timer expires, if the `call` method is called again,
     * the timer will be reset, so the function will not be called until the new timer expires.
     */
    public readonly delayMs: number;

    /**
     * The maximum delay time in milliseconds.
     *
     * If the elapsed time since the debounce started is greater than this value,
     * the delay will be ignored, and the function will be called immediately.
     *
     * @default Number.MAX_SAFE_INTEGER
     */
    public readonly maxDelayMs: number;

    private _startedAt: number | null = null;

    private _timer: NodeJS.Timeout | null = null;

    /**
     * The wrapper class for debouncing a function call.
     *
     * If the debounced function throws an error, it will be emitted as an 'error' event.
     *
     * @param opts - The options for the debounce controller.
     *
     * @throws {RangeError} If the `delayMs` is less than or equal to 0.
     * @throws {RangeError} If the `maxDelayMs` is less than `delayMs`.
     */
    public constructor(opts: IDebounceOptions) {

        super();

        this._rawFunction = opts.function;
        this.delayMs = opts.delayMs;
        this.maxDelayMs = opts.maxDelayMs ?? Number.MAX_SAFE_INTEGER;

        if (!Number.isSafeInteger(this.delayMs) || this.delayMs <= 0) {

            throw new RangeError('The delayMs must be greater than 0.');
        }

        if (!Number.isSafeInteger(this.maxDelayMs) || this.maxDelayMs < this.delayMs) {

            throw new RangeError('The maxDelayMs cannot be less than delayMs.');
        }
    }

    /**
     * Cancel the scheduled call.
     */
    public cancel(): void {

        if (this._timer) {

            clearTimeout(this._timer);
            this._timer = null;
            this._startedAt = null;
        }
    }

    /**
     * Tells whether the function is currently scheduled to be called.
     *
     * @returns `true` if the function is scheduled to be called, `false` otherwise.
     */
    public isScheduled(): boolean {

        return this._timer !== null;
    }

    /**
     * Call the raw function immediately synchronously, ignoring the delay.
     *
     * If there is a scheduled call, it will be cancelled, and the timer will be reset.
     *
     * After the raw function is called, a 'triggered' event will be emitted.
     *
     * @throws The errors thrown by the raw function will be thrown out directly.
     */
    public callNow(): void {

        if (this._timer) {

            clearTimeout(this._timer);
            this._timer = null;
            this._startedAt = null;
        }

        try {

            this._rawFunction();
        }
        finally {

            this.emit('triggered');
        }
    }

    /**
     * Schedule the function to be called after the delay.
     * If there is a scheduled call, it will be reset.
     *
     * After the raw function is called, a 'triggered' event will be emitted.
     *
     * If the raw function throws an error, it will be emitted as an 'error' event.
     */
    public schedule(): void {

        const now = Date.now();

        this._startedAt ??= now;

        const elapsed = now - this._startedAt;

        if (elapsed >= this.maxDelayMs) {

            this._startedAt = null;
            this._timer = null;

            try {

                this._rawFunction();
            }
            catch (err) {

                this.emit('error', err);
            }
            finally {

                this.emit('triggered');
            }

            return;
        }

        if (this._timer) {

            clearTimeout(this._timer);
        }

        this._timer = setTimeout(() => {

            this._startedAt = null;
            this._timer = null;

            try {

                this._rawFunction();
            }
            catch (err) {

                this.emit('error', err);
            }
            finally {

                this.emit('triggered');
            }

        }, Math.max(Math.min(this.delayMs, this.maxDelayMs - elapsed), 0));
    }

    /**
     * Wraps the given function with debouncing.
     *
     * > WARNING: The controller object is hidden insides a closure, which means
     * > that the error event cannot be listened to outside of this function.
     * > That is, the function must not throw any errors, or the error cannot be handled.
     *
     * @param opts - The options for the debounce controller.
     *
     * @return The function wrapped with debouncing.
     */
    public static wrap(opts: IDebounceOptions): IDebouncingFunction {

        const controller = new DebounceController(opts);

        return controller.schedule.bind(controller);
    }
}
