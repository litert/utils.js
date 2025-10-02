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
import { E_BREAKER_OPENED, IBreaker, ISimpleFn } from '../Types';

/**
 * A manual breaker implementation, which can be used to control the flow of
 * function calls, by manually open or close the breaker.
 *
 * @noInheritDoc
 */
export class ManualBreaker extends EventEmitter implements IBreaker {

    private _closed: boolean;

    private readonly _errorCtor: IConstructor<Error>;

    /**
     * @param closedByDefault Whether the breaker is closed by default.
     * @param errorCtor  The error constructor to be used when the breaker is open.
     */
    public constructor(
        closedByDefault: boolean = true,
        errorCtor: IConstructor<Error> = E_BREAKER_OPENED
    ) {
        super();
        this._closed = !!closedByDefault;
        this._errorCtor = errorCtor;
    }

    /**
     * Close the breaker, allowing all calls to `call()`.
     */
    public close(): void {

        this._closed = true;
    }

    /**
     * Open the breaker, blocking all calls to `call()`.
     */
    public open(): void {

        this._closed = false;
    }

    /**
     * Call the given function if the breaker is closed, or throw an error if
     * the breaker is open.
     *
     * @param cb    The function to be called.
     * @returns     The return value of the given function.
     * @throws      An error if the breaker is open, or if the given function throws an error.
     */
    public call<TFn extends ISimpleFn>(cb: TFn): ReturnType<TFn> {

        if (this._closed) {

            return cb() as ReturnType<TFn>;
        }

        const ctor = this._errorCtor;

        throw new ctor();
    }

    /**
     * Check whether the breaker is opened.
     */
    public isOpened(): boolean {

        return !this._closed;
    }

    /**
     * Check whether the breaker is closed.
     */
    public isClosed(): boolean {

        return this._closed;
    }

    /**
     * Wrap the given function with the breaker, returning a new function
     * which will be controlled by the breaker.
     *
     * @param cb    The function to be wrapped.
     * @returns     A new function which will be controlled by the breaker.
     */
    public wrap<TFn extends ISimpleFn>(cb: TFn): TFn {

        return (() => this.call(cb)) as TFn;
    }
}
