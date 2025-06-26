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

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

/**
 * The AbortController with a timeout.
 *
 * When the timeout is reached, the controller will automatically
 * call the `abort` method, which will set the `aborted` flag of the
 * `AbortSignal` to `true` and signal to any observers that the associated
 * activity is to be aborted.
 *
 * If the `abort` method is called before the timeout is reached,
 * the timeout will be cleared and the `aborted` flag will be set to `true`.
 */
export class AbortTimeoutController {

    public readonly signal: AbortSignal;

    private readonly _ac: AbortController;

    private _timer: NodeJS.Timeout | null = null;

    public constructor(timeoutMs: number) {

        const ac = new AbortController();
        this.signal = ac.signal;
        this._ac = ac;

        this._timer = setTimeout(() => {
            this._timer = null;
            this._ac.abort('timeout');
        }, timeoutMs);
    }

    /**
     * Invoking this method will set this object's AbortSignal's aborted flag and signal to any
     * observers that the associated activity is to be aborted.
     * Calling this method multiple times will have no effect.
     * If the timeout is already reached, this method will not change the state of the controller.
     */
    public abort(reason: any): void {

        if (this._timer) {

            clearTimeout(this._timer);
            this._timer = null;
        }

        this._ac.abort(reason);
    }
}
