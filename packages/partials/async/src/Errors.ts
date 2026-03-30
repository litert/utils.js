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

import { type IDict, UtilityError } from '@litert/utils-ts-types';

export interface IAsyncErrorContext extends IDict {

    /**
     * The promise that is still unresolved when the error is thrown,
     * which can be used to track the original asynchronous task.
     *
     * @optional
     */
    unresolvedPromise?: Promise<unknown>;
}

/**
 * The error thrown when an operation exceeds the specified timeout.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export class E_TIMEOUT extends UtilityError<IAsyncErrorContext> {

    public readonly unresolvedPromise?: Promise<unknown>;

    public constructor(ctx: IAsyncErrorContext = {}, origin: unknown = null) {
        super('timeout', 'Operation timed out.', ctx, origin);
        this.unresolvedPromise = ctx.unresolvedPromise;
    }
}

/**
 * The error thrown when an operation is aborted.
 *
 * You can use the `E_ABORTED.isAbortedError` static method to check if a given
 * error is an instance of `E_ABORTED` or a standard `AbortError`
 * (with name 'AbortError').
 *
 * In the new ECMAScript runtime, the `v instanceof E_ABORTED` operator may also
 * work as `E_ABORTED.isAbortedError(v)`.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export class E_ABORTED extends UtilityError<IAsyncErrorContext> {

    public constructor(context: IAsyncErrorContext = {}, origin: unknown = null) {
        super('aborted', 'Operation aborted.', context, origin);
    }

    public static override [Symbol.hasInstance](v: unknown): boolean {

        return this.isAbortedError(v);
    }

    /**
     * Check if the given value is an instance of E_ABORTED or a standard AbortError (with name 'AbortError').
     * @param v The error to check.
     * @returns True if the error is an E_ABORTED instance or a standard AbortError, false otherwise.
     */
    public static isAbortedError(v: unknown): boolean {

        return v?.constructor === E_ABORTED || (v instanceof Error && v.name === 'AbortError');
    }
}

/**
 * The error thrown when trying to resume a fiber that has already exited.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export class E_FIBER_EXITED extends UtilityError<IAsyncErrorContext> {

    public constructor(context: IAsyncErrorContext = {}, origin: unknown = null) {
        super('fiber_exited', 'Fiber has already exited.', context, origin);
    }
}
