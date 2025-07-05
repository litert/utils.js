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
import { FiberController, IFiberContext, PromiseController, TimeoutError } from '@litert/utils-async';

/**
 * The options for the fiber pool.
 */
export interface IFiberPoolOptions {

    /**
     * The maximum number of fibers in the pool.
     */
    maxFibers: number;

    /**
     * The maximum number of idle fibers in the pool.
     *
     * When a fiber finishes its execution, it should be reuseable,
     * if the idle fibers in this pool are less than this number.
     * Otherwise, the fiber will be closed and released.
     *
     * @default 1
     */
    maxIdleFibers?: number;

    /**
     * The minimum number of idle fibers in the pool.
     *
     * When the idle fibers are less than this number, the rest of the fibers will not be closed
     * even after the idle timeout.
     *
     * @default 1
     */
    minIdleFibers?: number;

    /**
     * How long will an idle
     *
     * @default 10_000
     */
    idleTimeout?: number;

    /**
     * @default 10_000
     */
    defaultWaitTimeout?: number;

    /**
     * The maximum number of waits for a fiber to be picked from the pool.
     *
     * @default 10
     */
    maxWaits?: number;
}

export interface IFiberPoolEvents {

    'error': [error: unknown];
}

export const DEFAULT_MIN_IDLE_FIBERS = 1;

export const DEFAULT_MAX_IDLE_FIBERS = 1;

export const DEFAULT_IDLE_TIMEOUT = 10000;

export const DEFAULT_WAIT_TIMEOUT = 10000;

export const DEFAULT_MAX_WAITS = 10;

export type IFiberFunction<TData, TResult> = (data: TData) => Promise<TResult>;

interface IFiberData {

    'fn': IFiberFunction<unknown, unknown>;

    'data': unknown;

    'result'?: unknown;

    'error'?: unknown;
}

export interface IRunOptions<TData, TResult> {

    /**
     * How long to wait before the fiber gets executed
     *
     * @default The `defaultWaitTimeout` value in the constructor options.
     */
    'waitTimeout'?: number;

    /**
     * The data to be passed to the fiber function.
     */
    'data': TData;

    /**
     * The function to be executed by the fiber.
     */
    'function': IFiberFunction<TData, TResult>;
}

/**
 * The class for managing a pool of fibers.
 *
 * @noInheritDoc
 */
export class FiberPool extends EventEmitter<IFiberPoolEvents> {

    private readonly _opts: Required<IFiberPoolOptions>;

    private readonly _idleFibers: Array<FiberController<IFiberData>> = [];

    /**
     * How many fibers are currently executing functions.
     */
    private _busyFibers: number = 0;

    public constructor(options: IFiberPoolOptions) {

        super();

        this._opts = {
            'maxIdleFibers': options.maxIdleFibers ?? DEFAULT_MAX_IDLE_FIBERS,
            'minIdleFibers': options.minIdleFibers ?? DEFAULT_MIN_IDLE_FIBERS,
            'maxFibers': options.maxFibers,
            'idleTimeout': options.idleTimeout ?? DEFAULT_IDLE_TIMEOUT,
            'defaultWaitTimeout': options.defaultWaitTimeout ?? DEFAULT_WAIT_TIMEOUT,
            'maxWaits': options.maxWaits ?? DEFAULT_MAX_WAITS,
        };
    }

    private readonly _fiberWaits: Array<PromiseController<FiberController<IFiberData>>> = [];

    /**
     * The number of idle fibers in the pool.
     */
    public get idleFibers(): number { return this._idleFibers.length; }

    /**
     * The number of busy fibers in the pool, which are currently executing functions.
     */
    public get busyFibers(): number { return this._busyFibers; }

    /**
     * Close all idle fibers in the pool.
     */
    public close(): void {

        this._opts.maxFibers = 0; // mark the pool as closed.

        while (this._idleFibers.length > 0) {

            this._idleFibers.pop()!.abort(); // abort the fiber to release resources.
        }

        while (this._fiberWaits.length > 0) {

            this._fiberWaits.pop()!.reject(new Error('The fiber pool is closed.')); // reject all waiting fibers.
        }
    }

    /**
     * Check if the fiber pool is closed.
     */
    public isClosed(): boolean {

        return this._opts.maxFibers === 0;
    }

    /**
     * Run a function in a fiber from the pool.
     *
     * @param opts  The options for running the function in a fiber.
     * @returns  A promise that resolves to the result of the function executed in the fiber.
     */
    public async run<TData, TResult>(opts: IRunOptions<TData, TResult>): Promise<TResult> {

        if (this._opts.maxFibers === 0) {

            throw new Error('The fiber pool is closed.');
        }

        const fiber = await this._pickFiber(opts.waitTimeout);

        fiber.data.fn = opts.function as IFiberFunction<unknown, unknown>;
        fiber.data.data = opts.data;

        fiber.resume(); // wake up the fiber to execute the function.

        // wait for the fiber to finish executing the function, and go sleep again.
        try {

            await fiber.waitForSleep();
        }
        // Theoretically, this should never happen.
        // catch (e) {

        //     if (!this.isClosed()) {

        //         const wait = this._fiberWaits.shift();

        //         if (wait) {

        //             wait.resolve(this._createFiber()); // resolve the waiting fiber with a new fiber.
        //         }
        //     }

        //     throw e;
        // }
        finally {

            this._busyFibers--; // decrease the busy fibers count.
        }

        // clean up the context data of the fiber, to avoid memory leak.
        (fiber.data.data as any) = null;
        (fiber.data.fn as any) = null;

        // if error happened during the execution of the function in the fiber,
        if (typeof fiber.data.error !== 'undefined') {

            const e = fiber.data.error;
            delete fiber.data.error; // clean up the error to avoid memory leak.

            this._releaseFiber(fiber);

            throw e;
        }

        const ret = fiber.data.result as TResult;

        delete fiber.data.result; // clean up the result to avoid memory leak.

        this._releaseFiber(fiber);

        return ret;
    }

    private async _pickFiber(timeout: number = this._opts.defaultWaitTimeout): Promise<FiberController<IFiberData>> {

        if (this._idleFibers.length > 0) {

            this._busyFibers++;
            return Promise.resolve(this._idleFibers.pop()!);
        }

        if (this._busyFibers < this._opts.maxFibers) {

            this._busyFibers++;
            return Promise.resolve(this._createFiber());
        }

        if (this._fiberWaits.length >= this._opts.maxWaits) {

            throw new Error('The fiber pool has reached the maximum number of waits.');
        }

        const pc = new PromiseController<FiberController<IFiberData>>(timeout);

        this._fiberWaits.push(pc);

        try {

            const ret = await pc.promise;

            this._busyFibers++;

            return ret;
        }
        catch (e) {

            if (e instanceof TimeoutError) {

                const idx = this._fiberWaits.indexOf(pc);

                if (idx >= 0) {

                    this._fiberWaits.splice(idx, 1); // remove the waiting fiber from the queue.
                }
            }

            throw e;
        }
    }

    private _releaseFiber(fiber: FiberController<IFiberData>): void {

        if (this.isClosed()) {

            // just abort the fiber if the pool is closed.
            fiber.abort();
            return;
        }

        const wait = this._fiberWaits.shift();

        if (wait) {

            wait.resolve(fiber); // resolve the waiting fiber with the current fiber.
            return;
        }

        // check if the idle fibers count is less than the maximum idle fibers,
        // and the maximum fibers is not 0 (which means the pool is closed).
        if (this._idleFibers.length < this._opts.maxIdleFibers) {
            // save the fiber for reuse.
            this._idleFibers.push(fiber);
            return;
        }

        // otherwise, let it go.
        fiber.abort();
    }

    private _createFiber(): FiberController<IFiberData> {

        return new FiberController({
            'main': async (ctx: IFiberContext<IFiberData>) => {

                while (true) {

                    try {

                        await ctx.sleep();
                    }
                    catch { // aborted

                        return;
                    }

                    delete ctx.data.result;
                    delete ctx.data.error;

                    try {

                        const fn = ctx.data.fn;
                        const data = ctx.data.data;

                        ctx.data.result = await fn(data);
                    }
                    catch (e) {

                        ctx.data.error = e;
                    }
                }
            },
            'data': {
                'data': null,
                'fn': null as any,
            }
        });
    }
}
