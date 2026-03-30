/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import * as TestUtils from '@litert/utils-test';
import { withAbortSignal } from './WithAbortSignal.js';
import { E_ABORTED } from '../Errors.js';
import { sleep } from './Sleep.js';

NodeTest.describe('Module Async - Function WithAbortSignal', async () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    await NodeTest.it('B-M-00001: Should resolve with the result of the asynchronous task if not aborted', async () => {

        const controller = new AbortController();

        setTimeout(() => { controller.abort(); }, 100); // Abort after 100ms

        const result = await withAbortSignal(controller.signal, async () => {
            // Simulate a quick task
            await sleep(50);
            return 42;
        });

        NodeAssert.strictEqual(result, 42);
    });

    await NodeTest.it('B-M-00002: Should clean up event listeners after task completion', async () => {

        const controller = new AbortController();

        let abortEventCount = 0;
        const onAbort = () => { abortEventCount += 1; };
        controller.signal.addEventListener('abort', onAbort);

        await withAbortSignal(controller.signal, async () => {
            // Simulate a quick task
            await sleep(50);
        });

        controller.signal.removeEventListener('abort', onAbort);

        // Abort after the task is complete
        controller.abort();

        // The abort event listener should not have been called
        NodeAssert.strictEqual(abortEventCount, 0);
    });

    await NodeTest.it('B-M-00003: Should work with a Promise directly', async () => {

        const controller = new AbortController();

        const promise = new Promise<number>(async (resolve) => {
            // Simulate a quick task
            await sleep(50);
            resolve(99);
        });

        const result = await withAbortSignal(controller.signal, promise);

        NodeAssert.strictEqual(result, 99);
    });

    await NodeTest.it('B-M-00004: Should not collect result if not aborted', async () => {

        const controller = new AbortController();

        let collectorCalled = false;

        const promise = new Promise<number>(async (resolve) => {
            // Simulate a quick task
            await sleep(50);
            resolve(456);
        });

        const result = await withAbortSignal(
            controller.signal,
            promise,
            {
                collectResult: () => {
                    collectorCalled = true;
                },
            },
        );

        NodeAssert.strictEqual(result, 456);
        NodeAssert.strictEqual(collectorCalled, false);
    });

    await NodeTest.it('B-M-00005: Should collect result after aborted', async () => {

        const controller = new AbortController();

        let collectedError: Error | null = null;
        let collectedResult: number | null = null;

        const promise = new Promise<number>(async (resolve) => {
            // Simulate a task that fails
            await sleep(200);
            resolve(123);
        });

        const t = withAbortSignal(
            controller.signal,
            promise,
            {
                collectResult: (err, res) => {
                    collectedError = err as Error | null;
                    collectedResult = res as number | null;
                },
            },
        );

        setTimeout(() => { controller.abort(); }, 100); // Abort after 100ms

        try {
            await t;
            NodeAssert.fail('Expected to throw AbortError');
        } catch (e) {
            NodeAssert.ok(E_ABORTED.isAbortedError(e), 'Should be an E_ABORTED');
        }

        // Wait a bit to ensure the original promise settles
        await sleep(150);

        NodeAssert.strictEqual(collectedError, null);
        NodeAssert.strictEqual(collectedResult, 123);
    });

    await NodeTest.it('B-M-00006: Should collect error after aborted', async () => {

        const controller = new AbortController();

        let collectedError: unknown = null;
        let collectedResult: number | null = null;

        const promise = new Promise<number>(async (_resolve, reject) => {
            // Simulate a task that fails
            await sleep(200);
            reject(new Error('Task failed'));
        });

        const t = withAbortSignal(
            controller.signal,
            promise,
            {
                collectResult: (err, res) => {
                    collectedError = err as Error | null;
                    collectedResult = res ?? null;
                },
            },
        );

        setTimeout(() => { controller.abort(); }, 100);

        try {
            await t;
            NodeAssert.fail('Expected to throw AbortError');
        } catch (e) {
            NodeAssert.ok(E_ABORTED.isAbortedError(e), 'Should be an E_ABORTED');
        }

        // Wait a bit to ensure the original promise settles
        await sleep(150);

        NodeAssert.ok(collectedError instanceof Error);
        NodeAssert.strictEqual(collectedError!.message, 'Task failed');
        NodeAssert.strictEqual(collectedResult, null);
    });

    await NodeTest.it('B-M-00007: Should collect result if already aborted with Promise task', async () => {

        const controller = new AbortController();
        controller.abort();

        let collectedError: unknown = null;
        let collectedResult: number | null = null;

        const okPromise = new Promise<number>(async (resolve) => {
            // Simulate a quick task
            await sleep(50);
            resolve(789);
        });

        try {
            await withAbortSignal(
                controller.signal,
                okPromise,
                {
                    collectResult: (err, res) => {
                        collectedError = err;
                        collectedResult = res ?? null;
                    },
                },
            );
            NodeAssert.fail('Expected to throw AbortError');
        } catch (e) {
            NodeAssert.ok(E_ABORTED.isAbortedError(e), 'Should be an E_ABORTED');
        }

        // Wait a bit to ensure the original promise settles
        await sleep(100);

        NodeAssert.strictEqual(collectedError, null);
        NodeAssert.strictEqual(collectedResult, 789);

        const errPromise = new Promise<number>(async (_resolve, reject) => {
            // Simulate a task that fails
            await sleep(50);
            reject(new Error('Task failed'));
        });

        collectedError = null;
        collectedResult = null;

        try {
            await withAbortSignal(
                controller.signal,
                errPromise,
                {
                    collectResult: (err, res) => {
                        collectedError = err;
                        collectedResult = res ?? null;
                    },
                },
            );
            NodeAssert.fail('Expected to throw AbortError');
        } catch (e) {
            NodeAssert.ok(E_ABORTED.isAbortedError(e), 'Should be an E_ABORTED');
        }

        // Wait a bit to ensure the original promise settles
        await sleep(100);

        NodeAssert.ok(collectedError instanceof Error);
        NodeAssert.strictEqual((collectedError as Error).message, 'Task failed');
        NodeAssert.strictEqual(collectedResult, null);
    });

    // ─── Black-Box: Failure Flow ─────────────────────────

    await NodeTest.it('B-F-00001: Should reject immediately if the signal is already aborted', async () => {

        const controller = new AbortController();
        controller.abort();

        try {
            await withAbortSignal(controller.signal, async () => {
                // Some asynchronous task...
            });
            NodeAssert.fail('Expected to throw AbortError');
        } catch (e) {
            NodeAssert.ok(E_ABORTED.isAbortedError(e), 'Should be an E_ABORTED');
        }
    });

    await NodeTest.it('B-F-00002: Should reject with AbortError when the signal is aborted before the task completes', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });

        const ABORT_AT_MS = 100;
        const controller = new AbortController();
        setTimeout(() => { controller.abort(); }, ABORT_AT_MS);

        await NodeAssert.rejects(
            TestUtils.autoTickMs(ctx, withAbortSignal(controller.signal, () => sleep(1000)), { tickMs: 1 }),
            (e) => {
                NodeAssert.ok(E_ABORTED.isAbortedError(e), 'Should be an E_ABORTED');
                return true;
            }
        );
    });

    await NodeTest.it('B-F-00003: Should reject with the original error if the asynchronous task fails before being aborted', async () => {

        const controller = new AbortController();

        setTimeout(() => { controller.abort(); }, 100); // Abort after 100ms

        try {
            await withAbortSignal(controller.signal, async () => {
                // Simulate a task that fails
                await sleep(50);
                throw new Error('Task failed');
            });
            NodeAssert.fail('Expected to throw Task failed error');
        } catch (e) {
            NodeAssert.strictEqual(e instanceof Error, true);
            NodeAssert.strictEqual((e as Error).message, 'Task failed');
        }
    });

    await NodeTest.it('B-F-00004: Should clean up event listeners after task failed', async () => {

        const controller = new AbortController();

        let abortEventCount = 0;
        const onAbort = () => { abortEventCount += 1; };
        controller.signal.addEventListener('abort', onAbort);

        try {
            await withAbortSignal(controller.signal, async () => {
                // Simulate a task that fails
                await sleep(50);
                throw new Error('Task failed');
            });
            NodeAssert.fail('Expected to throw Task failed error');
        } catch (e) {
            NodeAssert.strictEqual(e instanceof Error, true);
            NodeAssert.strictEqual((e as Error).message, 'Task failed');
        }

        controller.signal.removeEventListener('abort', onAbort);

        // Abort after the task has failed
        controller.abort();

        // The abort event listener should not have been called
        NodeAssert.strictEqual(abortEventCount, 0);
    });

    await NodeTest.it('B-F-00005: Synchronous exception should be wrapped into rejected promise', async () => {

        const controller = new AbortController();

        const t = withAbortSignal(controller.signal, () => {
            throw new Error('Synchronous error');
        });

        NodeAssert.ok(t instanceof Promise);
        try {
            await t;
            NodeAssert.fail('Expected to throw Synchronous error');
        } catch (e) {
            NodeAssert.strictEqual(e instanceof Error, true);
            NodeAssert.strictEqual((e as Error).message, 'Synchronous error');
        }
    });

    await NodeTest.it('B-F-00006: Should not execute asyncTask function when signal already aborted', async () => {

        const controller = new AbortController();
        controller.abort();

        let functionExecuted = false;

        async function taskFunction(): Promise<number> {
            functionExecuted = true;
            return 321;
        }

        try {
            await withAbortSignal(controller.signal, taskFunction);
            NodeAssert.fail('Expected to throw AbortError');
        } catch (e) {
            NodeAssert.ok(E_ABORTED.isAbortedError(e), 'Should be an E_ABORTED');
        }

        await sleep(100); // Wait to ensure function is not executed

        NodeAssert.strictEqual(functionExecuted, false);
    });

    await NodeTest.it('B-F-00007: Should not call collectResult when already aborted with a function task', async () => {

        const controller = new AbortController();
        controller.abort();

        let collectCalled = false;

        await NodeAssert.rejects(
            withAbortSignal(
                controller.signal,
                async () => 42, // function task, not a pre-created Promise
                { collectResult: () => { collectCalled = true; } }
            ),
            (e) => {
                NodeAssert.ok(E_ABORTED.isAbortedError(e), 'Should be an E_ABORTED');
                return true;
            }
        );

        NodeAssert.strictEqual(collectCalled, false, 'collectResult must NOT be called for a function task when already aborted');
    });

    await NodeTest.it('B-F-00008: E_ABORTED should expose the unresolved promise in unresolvedPromise', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });

        const ABORT_AT_MS = 50;
        const RESOLVE_AT_MS = 200;

        const controller = new AbortController();
        setTimeout(() => controller.abort(), ABORT_AT_MS);

        const innerPromise = new Promise<number>((resolve) => {
            setTimeout(() => resolve(42), RESOLVE_AT_MS);
        });

        await NodeAssert.rejects(
            TestUtils.autoTickMs(ctx, withAbortSignal(controller.signal, innerPromise), { tickMs: 1 }),
            (e) => {
                NodeAssert.ok(e instanceof E_ABORTED, 'Should be an E_ABORTED');
                NodeAssert.strictEqual(
                    (e as E_ABORTED).context.unresolvedPromise,
                    innerPromise,
                    'unresolvedPromise should be the original task promise'
                );
                return true;
            }
        );
    });
});
