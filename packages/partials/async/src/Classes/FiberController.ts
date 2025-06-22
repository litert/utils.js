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

import type * as DTypes from '@litert/utils-ts-types';
import { PromiseController } from './PromiseController';

/**
 * The context of the fiber execution, used to exchanged data between the fiber and the controller.
 * It also provides the abort signal to the fiber execution, so that the fiber can be aborted
 * by the controller.
 * Besides, it provides a `sleep` method to pause the fiber execution and wait for
 * the controller to resume it.
 */
export interface IFiberContext<T = DTypes.IDict> {

    /**
     * The data of the fiber, used to store and swap data between fiber and the controller.
     */
    readonly data: T;

    /**
     * The abort signal of the fiber, used to abort the execution of the fiber.
     *
     * This signal object could be passed to all other asynchronous functions that
     * accepting an `AbortSignal` in the parameters.
     *
     * > Only work if the fiber listens to the signal.
     */
    readonly signal: AbortSignal;

    /**
     * The fiber execution could call this method and wait for the controller to resume (or abort)
     * it. This is useful when the fiber execution has nothing to do for a while, something like
     * fiber-pooling management.
     *
     * The fiber execution should always pause itself by waiting for the promise.
     * And if the promise is rejected, the fiber must quit its execution.
     *
     * @throws {Error} If the fiber is not running, it will throw an error.
     */
    sleep(): Promise<void>;
}

/**
 * The function signature of the fiber execution.
 */
export type IFiberExecution<T = DTypes.IDict> = (ctx: IFiberContext<T>) => Promise<void>;

enum EState {
    RUNNING,
    SLEEPING,
    EXITED,
}

/**
 * The options for creating a fiber controller.
 */
export type IFiberOptions<T> = T extends null ? {
    /**
     * The execution function of the fiber, which will be called with the context.
     */
    main: IFiberExecution<T>;
    data?: T;
} : {
    /**
     * The execution function of the fiber, which will be called with the context.
     */
    main: IFiberExecution<T>;

    /**
     * The context data of the fiber, used to store and swap data between fiber and the controller.
     */
    data: T;
};

/**
 * The error thrown by the `FiberController`.
 */
export class FiberError extends Error {

    public constructor(message: string) {
        super(message);
        this.name = FiberError.name;
    }
}

/**
 * A controller class for asynchronous fiber execution.
 *
 * User can control the fiber execution by aborting it, hibernating it, or resuming it, and
 * of course, waiting for it to finish.
 */
export class FiberController<T = null> {

    private readonly _ac = new AbortController();

    private _state: EState = EState.RUNNING;

    /**
     * The promise controller used to resume the fiber execution when it is sleeping.
     */
    private _pcResume: PromiseController<void> | null = null;

    /**
     * The promise controller used to wait for the fiber to exit.
     */
    private readonly _pcExitWait = new PromiseController<void>();

    /**
     * The promise controller used to wait for the fiber to sleep.
     */
    private _pcSleepWait: PromiseController<void> | null = null;

    /**
     * The data of the fiber, used to store and swap data between fiber and the controller.
     */
    public readonly data: T;

    public constructor(options: IFiberOptions<T>) {

        const data = this.data = (options.data ?? null) as T;

        (async () => {

            try {

                await options.main({
                    'data': data,
                    'signal': this._ac.signal,
                    'sleep': async () => {

                        switch (this._state) {
                            case EState.RUNNING:
                                if (this._ac.signal.aborted) {
                                    throw new FiberError('The fiber execution has been aborted.');
                                }
                                this._state = EState.SLEEPING;
                                this._pcResume = new PromiseController<void>();
                                if (this._pcSleepWait) {
                                    this._pcSleepWait?.resolve();
                                    this._pcSleepWait = null;
                                }
                                return this._pcResume.promise;
                            case EState.SLEEPING: // Do nothing if it is already sleeping.
                                return;
                            case EState.EXITED:
                                throw new FiberError('The fiber is not running, can not goto sleep.');
                        }
                    }
                });

                this._pcExitWait.resolve();
            }
            catch (e) {

                this._pcExitWait.reject(e);
            }
            finally {

                this._state = EState.EXITED;

                if (this._pcResume !== null) {

                    this._pcResume.reject(new FiberError('The fiber has exited.'));
                    this._pcResume = null;
                }

                if (this._pcSleepWait !== null) {

                    this._pcSleepWait.reject(new FiberError('The fiber has exited.'));
                    this._pcSleepWait = null;
                }
            }

        })().catch((e) => { this._pcExitWait.reject(e); });
    }

    /**
     * Check if the fiber is under SLEEPING state.
     */
    public isSleeping(): boolean {

        return this._state === EState.SLEEPING;
    }

    /**
     * Check if the fiber is under RUNNING state.
     */
    public isRunning(): boolean {

        return this._state === EState.RUNNING;
    }

    /**
     * Check if the fiber is under EXITED state.
     */
    public isExited(): boolean {

        return this._state === EState.EXITED;
    }

    /**
     * If the fiber is sleeping, wake it up. Otherwise, do nothing.
     *
     * @return {boolean} Returns true if the fiber was successfully woken up, false otherwise.
     */
    public resume(): boolean {

        if (this._state !== EState.SLEEPING || this._pcResume === null) {

            return false;
        }

        this._state = EState.RUNNING;

        this._pcResume.resolve();
        this._pcResume = null;

        return true;
    }

    /**
     * Abort the fiber execution by sending an abort signal.
     *
     * The fiber execution should listen to the signal and quit its execution
     * immediately when the signal is received,
     * if you wanna make the fiber execution controllable with the abort signal.
     */
    public abort(): void {

        this._ac.abort();

        if (this._pcResume !== null) {

            this._pcResume.reject(new FiberError('The fiber has been aborted.'));
            this._pcResume = null;
        }
    }

    /**
     * Wait until the fiber exits.
     */
    public waitForExit(): Promise<void> {

        return this._pcExitWait.promise;
    }

    /**
     * Wait until the fiber goto sleep.
     *
     * @throws {Error} If the fiber is exited,  it will throw an error.
     */
    public waitForSleep(): Promise<void> {

        switch (this._state) {
            case EState.RUNNING:
                this._pcSleepWait ??= new PromiseController<void>();
                return this._pcSleepWait.promise;
            case EState.SLEEPING:
                return Promise.resolve();
            case EState.EXITED:
                return Promise.reject(new FiberError('The fiber is exited, cannot wait for hibernation.'));
        }
    }
}
