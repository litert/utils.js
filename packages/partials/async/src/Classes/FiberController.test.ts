/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { once } from 'node:events';
import { sleep } from '../Functions/Sleep.js';
import { FiberController } from './FiberController.js';
import * as Errors from '../Errors.js';

NodeTest.describe('Module Async - Class FiberController', async () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    await NodeTest.it('B-M-00001: Should run a fiber execution immediately', async () => {

        let test= 0;
        const fc = new FiberController({
            main: async () => {
                test++;
                await sleep(0);
            }
        });
        NodeAssert.strictEqual(test, 1); // The execution should start immediately
        await fc.waitForExit();
        NodeAssert.strictEqual(fc.isRunning(), false); // The fiber should be finished
        NodeAssert.strictEqual(fc.isExited(), true); // The fiber should be exited
        NodeAssert.strictEqual(fc.isSleeping(), false); // The fiber should not be sleeping
    });

    await NodeTest.it('B-M-00002: Should be able to sleep and woken up', async () => {

        const fc = new FiberController({
            'main': async (ctx) => {

                do {
                    ctx.data.count++;
                    await ctx.sleep();
                    await sleep(0);
                } while (!ctx.data.stop);

            },
            'data': { stop: false, count: 0 },
        });

        for (let i = 0; i < 5; i++) {

            while (fc.isRunning()) {
                await sleep(0);
            }
            if (fc.isSleeping()) {
                fc.resume();
            }
        }

        NodeAssert.strictEqual(fc.data.count, 5); // The count should be 5
        fc.data.stop = true; // Stop the fiber execution

        await fc.waitForExit();
    });

    await NodeTest.it('B-M-00003: Fiber execution should received abort signal after abort method is called', async () => {

        let v = 0;
        const fc = new FiberController({
            async main(ctx) {
                await once(ctx.signal, 'abort'); // Wait for the abort signal
                v++;
            }
        });

        fc.abort();

        await fc.waitForExit();

        NodeAssert.strictEqual(v, 1, 'The fiber execution should receive the abort signal');
        NodeAssert.strictEqual(fc.isExited(), true); // The fiber should be exited
    });

    await NodeTest.it('B-M-00004: WaitForSleep should be resolved after the fiber went sleep', async () => {

        let v = 0;
        const fc = new FiberController({
            async main(ctx) {

                await sleep(0);
                v++;
                await ctx.sleep();
                v++;
            }
        });

        NodeAssert.strictEqual(fc.isRunning(), true);
        NodeAssert.strictEqual(v, 0);

        await fc.waitForSleep();
        NodeAssert.strictEqual(v, 1);
        fc.resume();

        await fc.waitForExit();

        NodeAssert.strictEqual(v, 2, 'The fiber execution should receive the abort signal');
        NodeAssert.strictEqual(fc.isExited(), true); // The fiber should be exited
    });

    await NodeTest.it('B-M-00005: WaitForSleep should return immediately if the fiber is already sleeping', async () => {

        let v = 0;
        const fc = new FiberController({
            async main(ctx) {

                v++;
                await ctx.sleep();
                v++;

            }
        });

        NodeAssert.strictEqual(v, 1);
        await sleep(0);
        NodeAssert.strictEqual(v, 1);

        if (!fc.isSleeping()) {
            NodeAssert.fail('The fiber should be sleeping');
        }
        await fc.waitForSleep();
        NodeAssert.strictEqual(v, 1);
        fc.resume();
        await fc.waitForExit();

        NodeAssert.strictEqual(v, 2);
        NodeAssert.strictEqual(fc.isExited(), true); // The fiber should be exited
    });

    await NodeTest.it('B-M-00006: Resume method should return false if the fiber is not sleeping', async () => {

        const fc = new FiberController({
            main: async () => { await sleep(0); }
        });

        NodeAssert.strictEqual(fc.isRunning(), true); // The fiber should be running
        NodeAssert.strictEqual(fc.resume(), false, 'Resume should return false if the fiber is running');

        await fc.waitForExit();

        NodeAssert.strictEqual(fc.isExited(), true); // The fiber should be exited
        NodeAssert.strictEqual(fc.resume(), false, 'Resume should return false if the fiber is exited');
    });

    // ─── Black-Box: Failure Flow ─────────────────────────

    await NodeTest.it('B-F-00001: Sleep method should throw FiberError after exited', async () => {

        let fCtx: any = null;

        const fc = new FiberController({
            async main(ctx) { fCtx = ctx; }
        });

        await fc.waitForExit();
        NodeAssert.strictEqual(fc.isExited(), true);

        await NodeAssert.rejects(
            fCtx.sleep(),
            (e: unknown) => {
                NodeAssert.ok(e instanceof Errors.E_FIBER_EXITED, 'Should be a FiberError');
                return true;
            }
        );
    });

    await NodeTest.it('B-F-00002: WaitForSleep method should throw FiberError after exited', async () => {

        const fc = new FiberController({
            async main() {}
        });

        await fc.waitForExit();
        NodeAssert.strictEqual(fc.isExited(), true);

        await NodeAssert.rejects(
            fc.waitForSleep(),
            (e: unknown) => {
                NodeAssert.ok(e instanceof Errors.E_FIBER_EXITED, 'Should be a FiberError');
                return true;
            }
        );
    });

    await NodeTest.it('B-F-00003: Wait method should throw the error thrown by the execution', async () => {

        const e = new Error('Test error');
        const fc = new FiberController({
            main: async () => { throw e; }
        });

        try {
            await fc.waitForExit();
            NodeAssert.fail('Expected an error to be thrown when calling sleep on an exited fiber');
        }
        catch (err) {
            NodeAssert.strictEqual(err, e); // The error should be the one thrown by the execution
            NodeAssert.ok(true, 'Error thrown as expected when calling sleep on an exited fiber');
        }

        NodeAssert.strictEqual(fc.isExited(), true); // The fiber should be exited
    });

    await NodeTest.it('B-F-00004: Sleep method throw FiberError when the fiber exits while sleeping', async () => {

        let pr: any = null;
        const fc = new FiberController({
            async main(ctx) { pr = ctx.sleep(); }
        });

        await fc.waitForExit();

        await NodeAssert.rejects(
            pr,
            (e: unknown) => {
                NodeAssert.ok(e instanceof Errors.E_FIBER_EXITED, 'Should be a FiberError');
                return true;
            }
        );

        NodeAssert.strictEqual(fc.isExited(), true);
    });

    await NodeTest.it('B-F-00005: WaitForHibernation should throw FiberError if the fiber exits without hibernation', async () => {

        const fc = new FiberController({
            async main() { await sleep(0); }
        });

        await NodeAssert.rejects(
            fc.waitForSleep(),
            (e: unknown) => {
                NodeAssert.ok(e instanceof Errors.E_FIBER_EXITED, 'Should be a FiberError');
                return true;
            }
        );

        NodeAssert.strictEqual(fc.isExited(), true);
    });

    await NodeTest.it('B-F-00006: Sleep method should throw error after abort method is called', async () => {

        let v = 0;
        const fc = new FiberController({
            async main(ctx) {

                try {
                    if (!ctx.signal.aborted) { // when not aborted yet
                        await ctx.sleep();
                    }
                }
                catch {
                    v++;
                }
            }
        });

        await sleep(0);

        fc.abort();

        await fc.waitForExit();

        NodeAssert.strictEqual(v, 1, 'sleep should throw an error after abort is called');
        NodeAssert.strictEqual(fc.isExited(), true); // The fiber should be exited
    });

    await NodeTest.it('B-F-00007: Sleep method should immediately throw error if abort method is already called', async () => {

        let v = 0;
        const fc = new FiberController({
            async main(ctx) {

                await sleep(0);

                try {

                    if (ctx.signal.aborted) { // when already aborted
                        await ctx.sleep();
                    }
                }
                catch {
                    v++;
                }
            }
        });

        fc.abort();

        await fc.waitForExit();

        NodeAssert.strictEqual(v, 1, 'sleep should throw an error after abort is called');
        NodeAssert.strictEqual(fc.isExited(), true); // The fiber should be exited
    });

    await NodeTest.it('B-F-00008: Abort() while fiber is sleeping should reject the sleep promise with FiberError', async () => {

        let sleepError: unknown = null;
        const fc = new FiberController({
            async main(ctx) {
                try {
                    await ctx.sleep();
                }
                catch (e) {
                    sleepError = e;
                }
            }
        });

        await fc.waitForSleep();
        NodeAssert.strictEqual(fc.isSleeping(), true);

        fc.abort();
        await fc.waitForExit();

        NodeAssert.ok(sleepError instanceof Errors.E_ABORTED, 'sleep rejection should be a FiberError');
    });

    // ─── Black-Box: Edge Cases ───────────────────────────

    await NodeTest.it('B-E-00001: Ctx.sleep() when fiber is already SLEEPING returns immediately', async () => {

        let secondSleepResolved = false;
        const fc = new FiberController({
            async main(ctx) {
                // First call puts the fiber to sleep
                const firstSleep = ctx.sleep();
                // Second call while still in SLEEPING state should resolve without error
                await ctx.sleep();
                secondSleepResolved = true;
                // Resolve the first call's pending wait so the fiber can exit
                await firstSleep;
            }
        });

        await sleep(0);
        // Fiber is now sleeping via the second sleep() call (which resolved immediately)
        // and waiting on firstSleep's promise
        fc.resume();
        await fc.waitForExit();

        NodeAssert.strictEqual(secondSleepResolved, true, 'Second sleep() call while sleeping should resolve immediately');
    });
});
