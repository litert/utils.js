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

import type { TestContext } from 'node:test';

/**
 * Automatically advances all mocked timers on every event loop tick until the given
 * promise settles.
 *
 * On each event loop tick, this function calls `ctx.mock.timers.runAll()`, which fires
 * every currently pending timer at its full scheduled duration. The loop continues until
 * `asyncTask` resolves or rejects.
 *
 * @remarks
 * **Timer mocking must be enabled** before calling this function:
 * ```ts
 * ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });
 * ```
 *
 * **Abort-signal behavior:** because `runAll()` fires each timer at its full scheduled
 * duration, the mock clock always counts the entire timer duration — even if the timer is
 * cancelled early by an `AbortController` signal. Use {@link autoTickMs} instead if you
 * need the elapsed mock time to reflect the actual abort point.
 *
 * @param ctx       The test context from `node:test`, used to drive the mocked timers.
 * @param asyncTask The async task to run. Can be an already-created `Promise`, or a
 *                  factory function that returns one. The factory is called immediately.
 *
 * @returns A promise that resolves or rejects with the same value as `asyncTask`.
 *
 * @example
 * ```ts
 * import * as NodeTest from 'node:test';
 * import NodeTimer from 'node:timers/promises';
 * import { autoTick } from '@litert/utils-test';
 *
 * NodeTest.it('resolves correctly with mocked timers', async (ctx) => {
 *     ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });
 *
 *     const result = await autoTick(ctx, async () => {
 *         await NodeTimer.setTimeout(1000);
 *         await NodeTimer.setTimeout(2000);
 *         return 'done';
 *     });
 *
 *     console.log(result); // 'done'
 *     // The test completes instantly — no real time elapsed
 * });
 * ```
 */
export async function autoTick<T>(
    ctx: TestContext,
    asyncTask: Promise<T> | (() => Promise<T>),
): Promise<T> {

    let taskFinished = false;

    let pr = asyncTask instanceof Promise ? asyncTask : asyncTask();

    (async () => {

        while (!taskFinished) {

            ctx.mock.timers.runAll();

            await new Promise<void>((resolve) => {

                setImmediate(() => {

                    resolve();
                });
            });
        }

    // eslint-disable-next-line no-console
    })().catch(console.error);

    try {

        return await pr;
    }
    finally {

        taskFinished = true;
    }
}
