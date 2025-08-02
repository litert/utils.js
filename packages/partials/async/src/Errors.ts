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
 * The error thrown when an operation exceeds the specified timeout.
 */
export class TimeoutError extends Error {

    public readonly unresolvedPromise: Promise<unknown>;

    public constructor(unresolvedPromise: Promise<unknown>) {
        super('Operation timed out');
        this.name = TimeoutError.name;
        this.unresolvedPromise = unresolvedPromise;
    }
}

/**
 * The error thrown when an operation is aborted.
 */
export class AbortedError extends Error {

    public constructor() {

        super('Operation aborted');
        this.name = TimeoutError.name;
    }
}
