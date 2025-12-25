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

    private _ac: AbortController | null;

    private _timer: NodeJS.Timeout | null;

    public constructor(timeoutMs: number) {

        this._ac = new AbortController();

        this.signal = this._ac.signal;

        this._timer = setTimeout(() => {
            this._timer = null;
            this._ac!.abort('timeout');
            this._ac = null;
        }, timeoutMs);
    }

    /**
     * Invoking this method will set this object's AbortSignal's aborted flag and signal to any
     * observers that the associated activity is to be aborted.
     * Calling this method multiple times will have no effect.
     * If the timeout is already reached or the method `destroy` has been called, this method
     * will not change the state of the controller.
     *
     * @example
     * ```ts
     * const atc = new AbortTimeoutController(1000);
     *
     * (async () => {
     *     await asyncJob({ signal: atc.signal });
     * })();
     *
     * atc.abort();
     * ```
     */
    public abort(reason: any): void {

        if (!this._ac) {

            return;
        }

        this._ac.abort(reason);

        this.destroy();
    }

    /**
     * Destroy the controller and clear the timeout if exists.
     *
     * After calling this method, the controller cannot be used anymore.
     */
    public destroy(): void {

        if (this._timer) {

            clearTimeout(this._timer);
            this._timer = null;
        }

        this._ac = null;
    }
}
