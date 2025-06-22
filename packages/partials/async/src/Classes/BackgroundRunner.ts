import { EventEmitter } from 'node:events';
import * as NodeTimer from 'node:timers/promises';

export interface IBackgroundRunnerEvents {

    'error': [error: unknown];
}

export interface IBackgroundRunnerOptions {

    /**
     * The wait function used by `runLater` method to wait before running the callbacks.
     *
     * Feel free to replace it with any other similar function that returns a Promise and waits
     * for a while.
     *
     * @default NodeTimer.setImmediate
     * @see https://nodejs.org/api/timers.html#timerspromisessetimmediatevalue-options
     */
    waitFn?: () => Promise<void>;
}

/**
 * This class helps make the asynchronous callbacks run in the background, when you don't want to
 * know the result of it in the main fiber and especially you don't want to block the main fiber.
 *
 * In this case, you should properly handle the errors thrown by the callback, because
 * the errors will not be caught by the main fiber's error handler.
 *
 * Anyway, even if you forget to handle the errors insides the callback, this class will
 * emit an `error` event with the error thrown by the callback, just don't forget to listen to it.
 */
export class BackgroundRunner extends EventEmitter<IBackgroundRunnerEvents> {

    private readonly _waitFn: () => Promise<void>;

    public constructor(opts: IBackgroundRunnerOptions = {}) {
        super();
        this._waitFn = opts.waitFn ?? NodeTimer.setImmediate;
    }

    /**
     * Runs the given callback immediately, but without waiting for its result in current fiber.
     *
     * @param callback  The callback to run in the background, who must always return a Promise.
     */
    public run(callback: () => Promise<void>): void {

        /**
         * The outer try-catch is to catch any synchronous errors thrown by the callback,
         * before the callback enters the Promise body. e.g.
         *
         * ```ts
         * function myCallback() {
         *     if (someCondition) {
         *         throw new Error('Something went wrong');
         *     }
         *     return new Promise<void>((resolve) => {
         *         // Some asynchronous operation
         *         resolve();
         *     });
         * }
         * ```
         */
        try {

            callback().catch(e => {

                this.emit('error', e);
            });
        }
        catch (e) {

            this.emit('error', e);
        }
    }

    /**
     * Runs the given callback after the wait function resolves, without waiting for its result
     * in current fiber.
     *
     * @param callback  The callback to run in the background. It must always return a Promise.
     * @param wait      The wait function to call before running the callback. It must return a Promise.
     */
    public runLater(callback: () => Promise<void>, wait: () => Promise<void> = this._waitFn): void {

        this.run(async () => {

            await wait();

            return callback();
        });
    }
}
