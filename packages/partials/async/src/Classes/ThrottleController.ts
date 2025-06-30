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
import type { IAsyncFunction, IDict } from '@litert/utils-ts-types';

type IThrottledCallIdMaker<T extends IAsyncFunction> = (...args: Parameters<T>) => string;

const DEFAULT_CALL_ID = 'default';

/**
 * The wrapper class for throttling an asynchronous function call.
 */
export class ThrottleController<T extends IAsyncFunction> {

    private readonly _fn: T;

    private _promises: IDict<ReturnType<T>> = {};

    private readonly _makeCallId: IThrottledCallIdMaker<T> | null;

    /**
     * The wrapper class for throttling an asynchronous function call.
     *
     * @param fn            The function to be wrapped.
     * @param callIdMaker   A function to generate a unique key for each call based on the arguments.
     *                      If `null` is passed, a default call id will be used, So all calls will be throttled as
     *                      the same call, whatever the arguments are.
     */
    public constructor(fn: T, callIdMaker: IThrottledCallIdMaker<T> | null) {

        this._fn = fn;
        this._makeCallId = callIdMaker;
    }

    /**
     * Call the asynchronous function with throttling.
     * If a call with the same arguments is already in progress, it will return the existing promise.
     * If no call is in progress, it will call the function and return a new promise.
     *
     * > If the `callIdMaker` is set to null, all calls will be throttled as the same call, whatever the arguments are.
     *
     * @param args  The arguments to be passed to the function.
     *
     * @returns A promise returned by the function.
     */
    public async call(...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> {

        const callId = this._makeCallId?.(...args) ?? DEFAULT_CALL_ID;

        let pr = this._promises[callId];

        if (pr !== undefined) {

            return pr as Promise<Awaited<ReturnType<T>>>;
        }

        pr = this._promises[callId] = this._fn(...args) as ReturnType<T>;

        try {

            return await (pr as Promise<Awaited<ReturnType<T>>>);
        }
        finally {

            delete this._promises[callId]; // Reset the promise after it resolves or rejects
        }
    }

    /**
     * Wraps the given function with throttling.
     *
     * @param fn            The function to be wrapped.
     * @param callIdMaker   A function to generate a unique key for each call based on the arguments.
     *                      If `null` is passed, a default call id will be used, So all calls will be throttled as
     *                      the same call, whatever the arguments are.
     *
     * @returns A new function that wrapped with throttling.
     */
    public static wrap<T extends IAsyncFunction>(fn: T, callIdMaker: IThrottledCallIdMaker<T> | null): T {

        const ctrl = new ThrottleController(fn, callIdMaker);

        return (function(...args: Parameters<T>): ReturnType<T> {
            return ctrl.call(...args) as ReturnType<T>;
        }) as unknown as T;
    }
}
