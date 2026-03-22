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
 * The options for the {@link autoTickMs} function.
 */
export interface IAutoTickMsOptions {

    /**
     * Milliseconds to advance the mock clock per event loop tick.
     *
     * Increase this value when the total timer duration is very long, to reduce the number
     * of iterations and keep the test fast. For example, set `tickMs` to `3_600_000` (1 hour)
     * when testing a 24-hour timer to reduce iterations from 86,400,000 down to 24.
     *
     * @default 1
     */
    tickMs?: number;
}

const DEFAULT_TICK_MS = 1;

/**
 * Automatically advances the mocked clock by a fixed interval on every event loop tick
 * until the given promise settles.
 *
 * On each event loop tick, this function calls `ctx.mock.timers.tick(tickMs)`, advancing
 * the mock clock by `tickMs` milliseconds. The loop then waits for the next event loop tick
 * before ticking again. Timer callbacks fire only once the mock time reaches their scheduled
 * time, giving precise control over which timer fires at which point.
 *
 * @remarks
 * **Timer mocking must be enabled** before calling this function:
 * ```ts
 * ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });
 * ```
 *
 * **Abort-signal precision:** unlike {@link autoTick} (which uses `runAll()`), this function
 * advances time in discrete steps. If a timer is cancelled by an `AbortController` signal,
 * the promise settles at that point and the mock clock stops advancing — counting only the
 * ticks that actually ran, not the full timer duration.
 *
 * **One extra tick:** because the settlement check happens after each tick, at most one
 * extra `tick(tickMs)` call may occur after the promise settles. The final mock clock value
 * might therefore be at most `tickMs` milliseconds ahead of the exact settlement point.
 *
 * **Performance:** for tests that involve very long total timer durations, set `tickMs` to a
 * larger value (e.g. `3_600_000` for 1-hour steps) to reduce the number of iterations.
 *
 * @param ctx       The test context from `node:test`, used to drive the mocked timers.
 * @param asyncTask The async task to run. Can be an already-created `Promise`, or a
 *                  factory function that returns one. The factory is called immediately.
 * @param options   Optional settings that control the ticking behavior.
 *
 * @returns A promise that resolves or rejects with the same value as `asyncTask`.
 *
 * @example
 * ```ts
 * import * as NodeTest from 'node:test';
 * import NodeTimer from 'node:timers/promises';
 * import { autoTickMs } from '@litert/utils-test';
 *
 * NodeTest.it('timer aborted at 50ms counts only ~50ms of mock time', async (ctx) => {
 *     ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });
 *
 *     const t0 = Date.now();
 *     const ac = new AbortController();
 *
 *     try {
 *         await autoTickMs(ctx, async () => {
 *             setTimeout(() => ac.abort(new Error('abort')), 50);
 *             await NodeTimer.setTimeout(1000, null, { signal: ac.signal });
 *         });
 *     }
 *     catch { // AbortError expected
 *     }
 *
 *     console.log(Date.now() - t0); // ~50
 * });
 * ```
 */
export async function autoTickMs<T>(
    ctx: TestContext,
    asyncTask: Promise<T> | (() => Promise<T>),
    options?: IAutoTickMsOptions,
): Promise<T> {

    let taskFinished = false;

    const tickMs = options?.tickMs ?? DEFAULT_TICK_MS;

    let pr = asyncTask instanceof Promise ? asyncTask : asyncTask();

    (async () => {

        await waitNextTick();

        while (!taskFinished) {

            ctx.mock.timers.tick(tickMs);

            await waitNextTick();
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

function waitNextTick(): Promise<void> {

    return new Promise<void>((resolve) => {

        setImmediate(() => {

            resolve();
        });
    });
}
