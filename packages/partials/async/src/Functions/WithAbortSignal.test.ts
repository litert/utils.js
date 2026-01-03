import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import * as NodeTimer from 'node:timers/promises';
import { withAbortSignal } from './WithAbortSignal';

NodeTest.describe('Function withAbortSignal', async () => {

    await NodeTest.it('Should reject immediately if the signal is already aborted', async () => {

        const controller = new AbortController();
        controller.abort();

        try {
            await withAbortSignal(controller.signal, async () => {
                // Some asynchronous task...
            });
            NodeAssert.fail('Expected to throw AbortError');
        } catch (e) {
            NodeAssert.strictEqual(e instanceof DOMException, true);
            NodeAssert.strictEqual((e as DOMException).name, 'AbortError');
        }
    });

    await NodeTest.it('Should reject with AbortError when the signal is aborted before the task completes', async () => {

        const controller = new AbortController();
        setTimeout(() => { controller.abort(); }, 100); // Abort after 100ms

        try {
            await withAbortSignal(controller.signal, async () => {
                // Simulate a long-running task
                await NodeTimer.setTimeout(1000);
            });
            NodeAssert.fail('Expected to throw AbortError');
        } catch (e) {
            NodeAssert.strictEqual(e instanceof DOMException, true);
            NodeAssert.strictEqual((e as DOMException).name, 'AbortError');
        }
    });

    await NodeTest.it('Should resolve with the result of the asynchronous task if not aborted', async () => {

        const controller = new AbortController();

        setTimeout(() => { controller.abort(); }, 100); // Abort after 100ms

        const result = await withAbortSignal(controller.signal, async () => {
            // Simulate a quick task
            await NodeTimer.setTimeout(50);
            return 42;
        });

        NodeAssert.strictEqual(result, 42);
    });

    await NodeTest.it('Should reject with the original error if the asynchronous task fails before being aborted', async () => {

        const controller = new AbortController();

        setTimeout(() => { controller.abort(); }, 100); // Abort after 100ms

        try {
            await withAbortSignal(controller.signal, async () => {
                // Simulate a task that fails
                await NodeTimer.setTimeout(50);
                throw new Error('Task failed');
            });
            NodeAssert.fail('Expected to throw Task failed error');
        } catch (e) {
            NodeAssert.strictEqual(e instanceof Error, true);
            NodeAssert.strictEqual((e as Error).message, 'Task failed');
        }
    });

    await NodeTest.it('Should clean up event listeners after task completion', async () => {

        const controller = new AbortController();

        let abortEventCount = 0;
        const onAbort = () => { abortEventCount += 1; };
        controller.signal.addEventListener('abort', onAbort);

        await withAbortSignal(controller.signal, async () => {
            // Simulate a quick task
            await NodeTimer.setTimeout(50);
        });

        controller.signal.removeEventListener('abort', onAbort);

        // Abort after the task is complete
        controller.abort();

        // The abort event listener should not have been called
        NodeAssert.strictEqual(abortEventCount, 0);
    });

    await NodeTest.it('Should clean up event listeners after task failed', async () => {

        const controller = new AbortController();

        let abortEventCount = 0;
        const onAbort = () => { abortEventCount += 1; };
        controller.signal.addEventListener('abort', onAbort);

        try {
            await withAbortSignal(controller.signal, async () => {
                // Simulate a task that fails
                await NodeTimer.setTimeout(50);
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

    await NodeTest.it('Should work with a Promise directly', async () => {

        const controller = new AbortController();

        const promise = new Promise<number>(async (resolve) => {
            // Simulate a quick task
            await NodeTimer.setTimeout(50);
            resolve(99);
        });

        const result = await withAbortSignal(controller.signal, promise);

        NodeAssert.strictEqual(result, 99);
    });

    await NodeTest.it('synchronous exception should be wrapped into rejected promise', async () => {

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

    await NodeTest.it('Should collect result after aborted', async () => {

        const controller = new AbortController();

        let collectedError: Error | null = null;
        let collectedResult: number | null = null;

        const promise = new Promise<number>(async (resolve) => {
            // Simulate a task that fails
            await NodeTimer.setTimeout(200);
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
            NodeAssert.strictEqual(e instanceof DOMException, true);
            NodeAssert.strictEqual((e as DOMException).name, 'AbortError');
        }

        // Wait a bit to ensure the original promise settles
        await NodeTimer.setTimeout(150);

        NodeAssert.strictEqual(collectedError, null);
        NodeAssert.strictEqual(collectedResult, 123);
    });

    await NodeTest.it('Should collect error after aborted', async () => {

        const controller = new AbortController();

        let collectedError: unknown = null;
        let collectedResult: number | null = null;

        const promise = new Promise<number>(async (_resolve, reject) => {
            // Simulate a task that fails
            await NodeTimer.setTimeout(200);
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
            NodeAssert.strictEqual(e instanceof DOMException, true);
            NodeAssert.strictEqual((e as DOMException).name, 'AbortError');
        }

        // Wait a bit to ensure the original promise settles
        await NodeTimer.setTimeout(150);

        NodeAssert.ok(collectedError instanceof Error);
        NodeAssert.strictEqual(collectedError!.message, 'Task failed');
        NodeAssert.strictEqual(collectedResult, null);
    });

    await NodeTest.it('Should not collect result if not aborted', async () => {

        const controller = new AbortController();

        let collectorCalled = false;

        const promise = new Promise<number>(async (resolve) => {
            // Simulate a quick task
            await NodeTimer.setTimeout(50);
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

    await NodeTest.it('Should not execute asyncTask function when signal already aborted', async () => {

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
            NodeAssert.strictEqual(e instanceof DOMException, true);
            NodeAssert.strictEqual((e as DOMException).name, 'AbortError');
        }

        await NodeTimer.setTimeout(100); // Wait to ensure function is not executed

        NodeAssert.strictEqual(functionExecuted, false);
    });

    await NodeTest.it('Should collect result if already aborted with Promise task', async () => {

        const controller = new AbortController();
        controller.abort();

        let collectedError: unknown = null;
        let collectedResult: number | null = null;

        const okPromise = new Promise<number>(async (resolve) => {
            // Simulate a quick task
            await NodeTimer.setTimeout(50);
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
            NodeAssert.strictEqual(e instanceof DOMException, true);
            NodeAssert.strictEqual((e as DOMException).name, 'AbortError');
        }

        // Wait a bit to ensure the original promise settles
        await NodeTimer.setTimeout(100);

        NodeAssert.strictEqual(collectedError, null);
        NodeAssert.strictEqual(collectedResult, 789);

        const errPromise = new Promise<number>(async (_resolve, reject) => {
            // Simulate a task that fails
            await NodeTimer.setTimeout(50);
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
            NodeAssert.strictEqual(e instanceof DOMException, true);
            NodeAssert.strictEqual((e as DOMException).name, 'AbortError');
        }

        // Wait a bit to ensure the original promise settles
        await NodeTimer.setTimeout(100);

        NodeAssert.ok(collectedError instanceof Error);
        NodeAssert.strictEqual((collectedError as Error).message, 'Task failed');
        NodeAssert.strictEqual(collectedResult, null);
    });
});
