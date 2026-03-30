/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import * as TestUtils from '@litert/utils-test';
import { withTimeout } from './WithTimeout.js';
import { E_TIMEOUT } from '../Errors.js';
import { sleep } from './Sleep.js';

NodeTest.describe('Module Async - Function WithTimeout', async () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    await NodeTest.it('B-M-00001: Should get the real result if promise resolved before timeout', async () => {

        async function theTask(): Promise<number> {

            await sleep(10); // Simulate a slow task

            return 12345;
        }

        NodeAssert.strictEqual(await withTimeout(100, theTask()), 12345);
        NodeAssert.strictEqual(await withTimeout(100, theTask), 12345);
    });

    await NodeTest.it('B-M-00002: Should collect result after timeout', async () => {

        let collectedError: unknown | null = null;
        let collectedResult: number | undefined = undefined;

        async function slowTask(): Promise<number> {

            await sleep(50); // Simulate a slow task
            return 6789;
        }

        try {
            await withTimeout(10, slowTask(), {
                collectResult: (error, result) => {
                    collectedError = error;
                    collectedResult = result;
                },
            });
            NodeAssert.fail('The task should have timed out');
        }
        catch (e) {
            NodeAssert.strictEqual(e instanceof E_TIMEOUT, true);
        }

        // Wait a bit to ensure the slowTask has completed
        await sleep(100);

        NodeAssert.strictEqual(collectedError, null);
        NodeAssert.strictEqual(collectedResult, 6789);
    });

    await NodeTest.it('B-M-00003: Should not call collectResult when task resolves before timeout', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });

        let collectCalled = false;
        const TIMEOUT_MS = 100;
        const TASK_DURATION_MS = 10;

        const result = await TestUtils.autoTickMs(ctx, withTimeout(
            TIMEOUT_MS,
            async () => { await sleep(TASK_DURATION_MS); return 42; },
            { collectResult: () => { collectCalled = true; } }
        ));

        NodeAssert.strictEqual(result, 42, 'Should return the task result');
        NodeAssert.strictEqual(collectCalled, false, 'collectResult must not be called when task finishes before timeout');
    });

    // ─── Black-Box: Failure Flow ─────────────────────────

    await NodeTest.it('B-F-00001: Should trigger timeout if the promise not done in time', async () => {

        async function slowTask(): Promise<number> {

            await sleep(100); // Simulate a slow task
            return 123;
        }

        await Promise.all([
            (async () => {

                try {
                    await withTimeout(10, slowTask());
                }
                catch (e) {

                    NodeAssert.strictEqual(e instanceof E_TIMEOUT, true);
                    NodeAssert.strictEqual((e as E_TIMEOUT).name, 'timeout');
                    NodeAssert.strictEqual((e as E_TIMEOUT).unresolvedPromise instanceof Promise, true);

                    NodeAssert.strictEqual(await (e as E_TIMEOUT).unresolvedPromise, 123);
                }
            })(),
            (async () => {

                try {
                    await withTimeout(10, slowTask);
                }
                catch (e) {

                    NodeAssert.strictEqual(e instanceof E_TIMEOUT, true);
                    NodeAssert.strictEqual((e as E_TIMEOUT).name, 'timeout');
                    NodeAssert.strictEqual((e as E_TIMEOUT).unresolvedPromise instanceof Promise, true);

                    NodeAssert.strictEqual(await (e as E_TIMEOUT).unresolvedPromise, 123);
                }
            })(),
        ])

    });

    await NodeTest.it('B-F-00002: Should trigger timeout with unresolved promise in error', async () => {

        async function slowFailedTask(): Promise<number> {

            await sleep(100); // Simulate a slow task
            throw new Error('Task failed');
        }

        await Promise.all([
            (async () => {

                try {
                    await withTimeout(10, slowFailedTask());
                }
                catch (e) {

                    NodeAssert.strictEqual(e instanceof E_TIMEOUT, true);
                    NodeAssert.strictEqual((e as E_TIMEOUT).name, 'timeout');
                    NodeAssert.strictEqual((e as E_TIMEOUT).unresolvedPromise instanceof Promise, true);

                    try {

                        await (e as E_TIMEOUT).unresolvedPromise;
                        NodeAssert.fail('The unresolved promise should not be resolved');
                    }
                    catch (ee) {

                        NodeAssert.strictEqual(ee instanceof Error, true);
                        NodeAssert.strictEqual((ee as Error).message, 'Task failed');
                    }
                }

            })(),
            (async () => {

                try {
                    await withTimeout(10, slowFailedTask);
                }
                catch (e) {

                    NodeAssert.strictEqual(e instanceof E_TIMEOUT, true);
                    NodeAssert.strictEqual((e as E_TIMEOUT).name, 'timeout');
                    NodeAssert.strictEqual((e as E_TIMEOUT).unresolvedPromise instanceof Promise, true);

                    try {

                        await (e as E_TIMEOUT).unresolvedPromise;
                        NodeAssert.fail('The unresolved promise should not be resolved');
                    }
                    catch (ee) {

                        NodeAssert.strictEqual(ee instanceof Error, true);
                        NodeAssert.strictEqual((ee as Error).message, 'Task failed');
                    }
                }
            })(),
        ])
    });

    await NodeTest.it('B-F-00003: Should get the real exception if promise reject before timeout', async () => {

        async function theTask(): Promise<number> {

            await sleep(10); // Simulate a slow task

            throw new Error('Task failed');
        }

        await NodeAssert.rejects(
            withTimeout(100, theTask()),
            (e) => {
                NodeAssert.ok(e instanceof Error, 'Should be an Error instance');
                NodeAssert.strictEqual((e as Error).message, 'Task failed', 'Error message should match');
                return true;
            }
        );

        await NodeAssert.rejects(
            withTimeout(100, theTask),
            (e) => {
                NodeAssert.ok(e instanceof Error, 'Should be an Error instance');
                NodeAssert.strictEqual((e as Error).message, 'Task failed', 'Error message should match');
                return true;
            }
        );
    });

    await NodeTest.it('B-F-00004: Should collect error after timeout', async () => {

        let collectedError: unknown | null = null;
        let collectedResult: number | undefined = undefined;

        async function slowFailedTask(): Promise<number> {

            await sleep(50); // Simulate a slow task
            throw new Error('Slow task failed');
        }

        try {
            await withTimeout(10, slowFailedTask(), {
                collectResult: (error, result) => {
                    collectedError = error;
                    collectedResult = result;
                },
            });
            NodeAssert.fail('The task should have timed out');
        }
        catch (e) {
            NodeAssert.strictEqual(e instanceof E_TIMEOUT, true);
        }

        // Wait a bit to ensure the slowFailedTask has completed
        await sleep(100);

        NodeAssert.ok(collectedError instanceof Error, 'Collected error should be an Error instance');
        NodeAssert.strictEqual(
            (collectedError as Error).message,
            'Slow task failed',
            'Collected error message should match'
        );
        NodeAssert.strictEqual(collectedResult, undefined);
    });

    await NodeTest.it('B-F-00005: Should not call collectResult when task rejects before timeout', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });

        let collectCalled = false;
        const TIMEOUT_MS = 100;
        const TASK_DURATION_MS = 10;

        await NodeAssert.rejects(
            TestUtils.autoTickMs(ctx, withTimeout(
                TIMEOUT_MS,
                async () => { await sleep(TASK_DURATION_MS); throw new Error('early reject'); },
                { collectResult: () => { collectCalled = true; } }
            )),
            (e) => {
                NodeAssert.ok(e instanceof Error, 'Should be an Error');
                NodeAssert.strictEqual((e as Error).message, 'early reject', 'Error message should match');
                return true;
            }
        );

        NodeAssert.strictEqual(collectCalled, false, 'collectResult must not be called when task rejects before timeout');
    });
});
