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
 * The options for `SlideWindowCounter`.
 */
export interface ISlideWindowCounterOptions {

    /**
     * The size of the slide window in milliseconds.
     *
     * @default 10000 (10 seconds)
     */
    windowSizeMs?: number;

    /**
     * The number of windows to divide the slide window into.
     *
     * @default 3
     */
    windowQty?: number;
}

interface IWindow {

    time: number;

    count: number;

    next: IWindow | null;
}

const EMPTY_RING_INDEX = -1;

/**
 * A counter that based on a slide time window.
 * The counts are divided into several windows, which are organized in a circular array (ring)
 */
export class SlideWindowCounter {

    public readonly windowSize: number;

    public readonly windowQty: number;

    private readonly _maxWindowAge: number = 0;

    private _headOffset: number = 0;

    private _curOffset: number = EMPTY_RING_INDEX;

    private _total: number = 0;

    private readonly _windows: IWindow[] = [];

    public constructor(options: ISlideWindowCounterOptions = {}) {

        this.windowSize = options.windowSizeMs ?? 10000;
        this.windowQty = options.windowQty ?? 3;

        for (const t of ['windowQty', 'windowSize'] as const) {

            if (!Number.isSafeInteger(this[t]) || this[t] <= 0) {

                throw new Error(`The ${t} option must be a positive integer.`);
            }
        }

        this._maxWindowAge = this.windowSize * this.windowQty;

        for (let i = 0; i < this.windowQty; i++) {

            this._windows.push({ time: 0, count: 0, next: null });
        }
    }

    /**
     * Get the total of the valid counts within the slide window.
     */
    public getTotal(): number {

        return this._total;
    }

    /**
     * Reset the counter to zero.
     */
    public reset(): void {

        this._headOffset = 0;
        this._curOffset = EMPTY_RING_INDEX;
        this._total = 0;
    }

    /**
     * Get how many windows are currently active, for storage.
     */
    public getWindows(): number {

        if (this._curOffset === EMPTY_RING_INDEX) {
            return 0;
        }

        return this._curOffset < this._headOffset ?
            this.windowQty + this._curOffset - this._headOffset + 1 :
            this._curOffset - this._headOffset + 1;
    }

    /**
     * Count up by the specified quantity.
     *
     * @param qty The quantity to count up with, always a positive integer. [Default: 1]
     *
     * @returns the total of the valid counts after counting up.
     */
    public count(step: number = 1): number {

        const NOW = Date.now();

        /**
         * If there is no current window, or the current window is expired (all windows are expired),
         * starts over from the first window.
         */
        if (this._curOffset === EMPTY_RING_INDEX || this._windows[this._curOffset].time + this._maxWindowAge <= NOW) {

            this._curOffset = 0;
            this._headOffset = 0;

            const curWnd = this._windows[0];

            curWnd.time = NOW;

            return this._total = curWnd.count = step;
        }

        // All windows can not starts before the valid time
        const wndValidAfter = NOW - this._maxWindowAge;

        // Cleanup expired windows
        for (let i = this._headOffset; i !== this._curOffset; i = (i + 1) % this.windowQty) {

            const w = this._windows[i];

            if (w.time > wndValidAfter) {
                break;
            }

            this._total -= w.count;
            this._headOffset = (this._headOffset + 1) % this.windowQty;
        }

        let w = this._windows[this._curOffset];

        // keep using current window until reaches the beginning of the next window
        if (w.time + this.windowSize > NOW) {

            w.count += step;
        }
        else {

            this._curOffset = (this._curOffset + 1) % this.windowQty;

            w = this._windows[this._curOffset];
            w.time = NOW;
            w.count = step;
        }

        this._total += step;

        return this._total;
    }
}
