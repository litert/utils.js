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

import type { IFunction } from '@litert/utils-ts-types';

/**
 * The state data container interface for MemoryMutex.
 */
interface IMutexStoreData {

    /**
     * The lock holder identifier.
     */
    lockedBy: symbol | null;
}

/**
 * The error thrown when failed to acquire the lock.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export class E_LOCK_FAILED extends Error {

    public constructor() {
        super('Failed to acquire the lock.');
        this.name = 'lock_failed';
    }
}

export interface IMemoryMutexOptions {

    /**
     * Indicates whether the mutex is reentrant.
     *
     * When a mutex is reentrant, the same instance can reacquire the lock when
     * it is already holding the lock.
     *
     * @default false
     */
    reentrant?: boolean;
}

/**
 * The class for a simple memory mutex manager object.
 *
 * As a low-level mutex manager, it only provides basic lock/unlock functionalities.
 * The user is responsible for managing the mutex state correctly.
 *
 * However, with the `share` method, multiple instances can share the same mutex
 * state. Each shared instance has its own unique lock identifier, allowing
 * they to compete for the same lock, preventing from accidental unlocking
 * the mutex held by others.
 *
 * @example
 * ```ts
 * const mutex = new MemoryMutex();
 *
 * if (!mutex.lock()) {
 *     throw new Error('Failed to acquire the mutex lock.');
 * }
 *
 * try {
 *     doSth();
 * }
 * finally {
 *     mutex.unlock();
 * }
 * ```
 */
export class MemoryMutex {

    private readonly _store: IMutexStoreData = { lockedBy: null };

    private readonly _lockId: symbol = Symbol('MemoryMutexLockId');

    /**
     * Indicates whether the mutex is reentrant.
     *
     * When a mutex is reentrant, the same instance can reacquire the lock when
     * it is already holding the lock.
     */
    public readonly reentrant: boolean;

    public constructor(opts?: IMemoryMutexOptions) {

        this.reentrant = opts?.reentrant === true;
    }

    /**
     * Attempts to acquire the mutex lock.
     *
     * If the mutex is unlocked it will be locked by the current instance,
     * and this method returns true.
     * If the mutex is held by another instance, the method returns false.
     *
     * > If you want a reentrant lock, you can set the `reentrant` option to true.
     *
     * @returns True if the lock is successfully acquired; otherwise, false.
     *
     * @example
     * ```ts
     * const mutex = new MemoryMutex();
     *
     * if (mutex.lock()) {
     *     try {
     *         doSth();
     *     }
     *     finally {
     *         mutex.unlock();
     *     }
     * }
     * else {
     *     console.log('Failed to acquire the mutex lock.');
     * }
     * ```
     */
    public lock(): boolean {

        switch (this._store.lockedBy) {

            case null:
                this._store.lockedBy = this._lockId;
                return true;

            case this._lockId:

                return this.reentrant;

            default:
                return false;
        }
    }

    /**
     * Releases the mutex lock if it is held by the current instance.
     *
     * @returns True if the lock is successfully released; otherwise, false.
     *
     * @example
     * ```ts
     * const mutex = new MemoryMutex();
     *
     * if (mutex.lock()) {
     *     try {
     *         doSth();
     *     }
     *     finally {
     *         mutex.unlock();
     *     }
     * }
     * ```
     */
    public unlock(): boolean {

        if (this._store.lockedBy === this._lockId) {

            this._store.lockedBy = null;
            return true;
        }

        return false;
    }

    /**
     * Create a new MemoryMutex instance that shares the same mutex state with
     * the current instance.
     *
     * @returns A new MemoryMutex instance sharing the same mutex state.
     *
     * @example
     * ```ts
     * const mutex1 = new MemoryMutex();
     * const mutex2 = mutex1.share();
     * mutex1.lock();
     * console.log(mutex1.lock()); // true
     * console.log(mutex2.lock()); // false
     * console.log(mutex2.isLocked()); // false
     * ```
     */
    public share(): MemoryMutex {

        const ret = new MemoryMutex({ reentrant: this.reentrant });

        Object.assign(ret, { _store: this._store });

        return ret;
    }

    /**
     * Checks if the mutex is locked by this instance.
     *
     * @returns True if the mutex is locked by this instance; otherwise, false.
     *
     * @example
     * ```ts
     * const mutex = new MemoryMutex();
     * console.log(mutex.isLocked()); // false
     * mutex.lock();
     * console.log(mutex.isLocked()); // true
     * ```
     */
    public isLocked(): boolean {

        return this._store.lockedBy === this._lockId;
    }

    /**
     * Runs the given function with the protection of the mutex lock.
     *
     * This method will try to acquire the mutex lock, before executing the function.
     * If it fails to acquire the lock, the method will throw an error, and the function will not be executed.
     *
     * @param fn  The function to run.
     * @returns The result of the function.
     *
     * @throws {E_LOCK_FAILED} If the mutex is not locked.
     *
     * @example
     * ```ts
     * const mutex = new MemoryMutex();
     * const result = mutex.run(() => {
     *     doSth();
     * });
     * ```
     */
    public run<T extends IFunction>(fn: T): ReturnType<T> {

        if (!this.lock()) {

            throw new E_LOCK_FAILED();
        }

        let ret: unknown;

        try {

            ret = fn();
        }
        catch (e) {

            this.unlock();
            throw e;
        }

        if (ret instanceof Promise) {

            ret.then(
                () => { this.unlock(); },
                () => { this.unlock(); },
            );
        }
        else {

            this.unlock();
        }

        return ret as ReturnType<T>;
    }

    /**
     * This method creates a new function with the same signature as the given function,
     * who will be executed with the protection of the mutex lock.
     *
     * If the new function is called, it will try to acquire the mutex lock, before executing the original function.
     * If it fails to acquire the lock, it will throw `E_LOCK_FAILED` error, and the original function will not be executed.
     *
     * @param fn    The function to be wrapped.
     * @returns     A new function with the same signature as the given function, with the protection of the mutex lock.
     *
     * @example
     * ```ts
     * const mutex = new MemoryMutex();
     * const wrapped = mutex.wrap(() => {
     *     doSth();
     * });
     * wrapped();
     * ```
     */
    public wrap<T extends IFunction>(fn: T): T {

        return ((...args: Parameters<T>) => this.run(() => fn(...args))) as T;
    }
}
