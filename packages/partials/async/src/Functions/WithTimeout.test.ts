import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import * as NodeTimer from 'node:timers/promises';
import { withTimeout } from './WithTimeout';
import { TimeoutError } from '../Errors';

NodeTest.describe('Function withTimeout', async () => {

    await NodeTest.it('Should trigger timeout if the promise not done in time', async () => {

        async function slowTask(): Promise<number> {

            await NodeTimer.setTimeout(100); // Simulate a slow task
            return 123;
        }

        await Promise.all([
            (async () => {

                try {
                    await withTimeout(10, slowTask());
                }
                catch (e) {

                    NodeAssert.strictEqual(e instanceof TimeoutError, true);
                    NodeAssert.strictEqual((e as TimeoutError).name, 'TimeoutError');
                    NodeAssert.strictEqual((e as TimeoutError).unresolvedPromise instanceof Promise, true);

                    NodeAssert.strictEqual(await (e as TimeoutError).unresolvedPromise, 123);
                }
            })(),
            (async () => {

                try {
                    await withTimeout(10, slowTask);
                }
                catch (e) {

                    NodeAssert.strictEqual(e instanceof TimeoutError, true);
                    NodeAssert.strictEqual((e as TimeoutError).name, 'TimeoutError');
                    NodeAssert.strictEqual((e as TimeoutError).unresolvedPromise instanceof Promise, true);

                    NodeAssert.strictEqual(await (e as TimeoutError).unresolvedPromise, 123);
                }
            })(),
        ])

    });

    await NodeTest.it('Should trigger timeout with unresolved promise in error', async () => {

        async function slowFailedTask(): Promise<number> {

            await NodeTimer.setTimeout(100); // Simulate a slow task
            throw new Error('Task failed');
        }

        await Promise.all([
            (async () => {

                try {
                    await withTimeout(10, slowFailedTask());
                }
                catch (e) {

                    NodeAssert.strictEqual(e instanceof TimeoutError, true);
                    NodeAssert.strictEqual((e as TimeoutError).name, 'TimeoutError');
                    NodeAssert.strictEqual((e as TimeoutError).unresolvedPromise instanceof Promise, true);

                    try {

                        await (e as TimeoutError).unresolvedPromise;
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

                    NodeAssert.strictEqual(e instanceof TimeoutError, true);
                    NodeAssert.strictEqual((e as TimeoutError).name, 'TimeoutError');
                    NodeAssert.strictEqual((e as TimeoutError).unresolvedPromise instanceof Promise, true);

                    try {

                        await (e as TimeoutError).unresolvedPromise;
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

    await NodeTest.it('Should get the real result if promise resolved before timeout', async () => {

        async function theTask(): Promise<number> {

            await NodeTimer.setTimeout(10); // Simulate a slow task

            return 12345;
        }

        NodeAssert.strictEqual(await withTimeout(100, theTask()), 12345);
        NodeAssert.strictEqual(await withTimeout(100, theTask), 12345);
    });

    await NodeTest.it('Should get the real exception if promise reject before timeout', async () => {

        async function theTask(): Promise<number> {

            await NodeTimer.setTimeout(10); // Simulate a slow task

            throw new Error('Task failed');
        }

        try {
            await withTimeout(100, theTask());
            NodeAssert.fail('The task should have thrown an error');
        }
        catch (e) {
            NodeAssert.strictEqual(e instanceof Error && e.message === 'Task failed', true);
        }

        try {
            await withTimeout(100, theTask);
            NodeAssert.fail('The task should have thrown an error');
        }
        catch (e) {
            NodeAssert.strictEqual(e instanceof Error && e.message === 'Task failed', true);
        }
    });

    await NodeTest.it('Should collect result after timeout', async () => {

        let collectedError: unknown | null = null;
        let collectedResult: number | undefined = undefined;

        async function slowTask(): Promise<number> {

            await NodeTimer.setTimeout(50); // Simulate a slow task
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
            NodeAssert.strictEqual(e instanceof TimeoutError, true);
        }

        // Wait a bit to ensure the slowTask has completed
        await NodeTimer.setTimeout(100);

        NodeAssert.strictEqual(collectedError, null);
        NodeAssert.strictEqual(collectedResult, 6789);
    });

    await NodeTest.it('Should collect error after timeout', async () => {

        let collectedError: unknown | null = null;
        let collectedResult: number | undefined = undefined;

        async function slowFailedTask(): Promise<number> {

            await NodeTimer.setTimeout(50); // Simulate a slow task
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
            NodeAssert.strictEqual(e instanceof TimeoutError, true);
        }

        // Wait a bit to ensure the slowFailedTask has completed
        await NodeTimer.setTimeout(100);

        NodeAssert.strictEqual(collectedError instanceof Error && (collectedError as Error).message === 'Slow task failed', true);
        NodeAssert.strictEqual(collectedResult, undefined);
    });
});
