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
     * Attempts to acquire the mutex lock.
     *
     * If the mutex is unlocked or already held by the current instance,
     * it will be locked by the current instance, and the method returns true.
     * If the mutex is held by another instance, the method returns false.
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
                return true;

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

        const ret = new MemoryMutex();

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
}
