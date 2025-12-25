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

import { DebounceController, IDebounceOptions } from './DebounceController';

/**
 * The options for the batch buffer.
 */
export interface IBatchBufferOptions<T> extends Pick<IDebounceOptions, 'delayMs' | 'maxDelayMs'> {

    /**
     * The maximum number of data to be stored in the buffer.
     *
     * When the number of buffered data is greater than or equal to this value,
     * the all buffered data will be passed to the callback function immediately,
     * and the buffer will be cleared.
     *
     * NOTE: Don't set this value too large, otherwise the memory usage will be too high.
     *       You should set this value according to your actual use cases.
     */
    maxSize: number;

    /**
     * The callback function to be called to receive the buffered data,
     * when the buffer is full or times out.
     *
     * @param items - The items to be passed to the callback function.
     */
    callback: (items: T[]) => void;
}

/**
 * The batch buffer is a buffer that stores the batch of data in an array,
 * and passes the buffered batch data to the target function callback once the buffer
 * is full, or the timeout is reached since the last data was saved to the buffer.
 *
 * > For example, this class is especially useful when you receive data one by one,
 * > but you don't want to process them one by one, instead, you want to process them in batch.
 * > In this case, you can use this class to buffer the data, and process them in batch
 * > when the buffer is full or the timeout is reached.
 *
 * @example
 * ```ts
 * const buffer = new BatchBuffer({
 *     delayMs: 1000,
 *     maxSize: 5,
 *     callback: (items) => { console.log(items); },
 * });
 *
 * buffer.push(1); // Not full yet, do nothing.
 * buffer.push(2); // Not full yet, do nothing.
 * buffer.push([3, 4, 5]); // Full now, pass the data [1, 2, 3, 4, 5] to the callback function immediately.
 *
 * buffer.push(6); // Not full yet, do nothing.
 * await sleep(1000); // Wait for 1 second.
 *
 * // The callback function will be called with [6] since the timeout is reached.
 * ```
 */
export class BatchBuffer<T> {

    private readonly _dc: DebounceController;

    private _data: T[] = [];

    private readonly _callback: (data: T[]) => void;

    private readonly _maxSize: number;

    public constructor(opts: IBatchBufferOptions<T>) {

        this._callback = opts.callback;
        this._maxSize = opts.maxSize;

        this._dc = new DebounceController({
            'function': () => {

                const items = this._data;
                this._data = [];

                this._callback(items);
            },
            'delayMs': opts.delayMs,
            'maxDelayMs': opts.maxDelayMs,
        });
    }

    /**
     * Add an item to the buffer.
     *
     * If the buffer is full, the items will be passed to the callback function immediately.
     * Otherwise, the items will be passed to the callback function after the delay.
     *
     * @param item - The item to be added to the buffer.
     */
    public push(item: T | T[]): void {

        if (Array.isArray(item)) {

            if (!item.length) {

                return;
            }

            this._data = this._data.concat(item);
        }
        else {

            this._data.push(item);
        }

        if (this._data.length >= this._maxSize) {

            this._dc.callNow();
        }
        else {

            this._dc.schedule();
        }
    }
}
