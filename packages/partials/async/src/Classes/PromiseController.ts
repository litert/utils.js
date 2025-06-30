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

import type { IDict } from '@litert/utils-ts-types';
import type { IPromiseRejecter, IPromiseResolver } from '../Typings';
import { TimeoutError } from '../Functions/WithTimeout';

/**
 * The controller for promises, which allows you to decouple the resolver/rejecter with the
 * promise object.
 */
export class PromiseController<T = unknown, TError = unknown> {

    /**
     * The resolver function for the promise, which can be used to turn the promise object
     * into the `RESOLVED` state.
     *
     * Because of the feature of the promises, calling this method multiple times or after
     * called `reject` method, will not change the state of the promise.
     */
    public readonly resolve!: IPromiseResolver<T>;

    /**
     * The rejecter function for the promise, which can be used to turn the promise object
     * into the `REJECTED` state.
     *
     * Because of the feature of the promises, calling this method multiple times or after
     * called `resolve` method, will not change the state of the promise.
     */
    public readonly reject!: IPromiseRejecter<TError>;

    /**
     * The promise object that is controlled by this controller.
     *
     * **REMEMBER: ALWAYS CATCH THE REJECTION OF THE PROMISE!**
     */
    public readonly promise: Promise<T>;

    private _timer: NodeJS.Timeout | null = null;

    /**
     * The controller for promises, which allows you to decouple the resolver/rejecter with the
     * promise object.
     *
     * @param timeoutMs The timeout in milliseconds. If zero is provided, the promise will not
     *                  have a timeout.
     *
     * @throws {TypeError} If the `timeoutMs` is not a safe integer.
     * @throws {TimeoutError} If the promise is not resolved or rejected within the timeout.
     */
    public constructor(timeoutMs: number = 0) {

        if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 0) {

            throw new TypeError('The "timeoutMs" must be an integer.');
        }

        this.promise = new Promise<T>((resolve, reject) => {

            if (timeoutMs > 0) {

                (this as IDict).resolve = (d: T) => {
                    if (this._timer) {
                        clearTimeout(this._timer);
                        this._timer = null;
                        resolve(d);
                    }
                };

                (this as IDict).reject = (e: unknown) => {
                    if (this._timer) {
                        clearTimeout(this._timer);
                        this._timer = null;
                        reject(e);
                    }
                };

                this._timer = setTimeout(() => {

                    this._timer = null;
                    reject(new TimeoutError(this.promise));

                }, timeoutMs);
            }
            else {

                (this as IDict).resolve = resolve;
                (this as IDict).reject = reject;
            }
        });
    }
}
