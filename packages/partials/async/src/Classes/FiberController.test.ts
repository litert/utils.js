import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import * as NodeTimer from 'node:timers/promises';
import { FiberController } from './FiberController';
import { once } from 'node:events';

NodeTest.describe('Class FiberController', async () => {

    await NodeTest.it('Should run a fiber execution immediately', async () => {

        let test= 0;
        const fc = new FiberController({
            main: async () => {
                test++;
                await NodeTimer.setImmediate();
            }
        });
        NodeAssert.strictEqual(test, 1); // The execution should start immediately
        await fc.waitForExit();
        NodeAssert.strictEqual(fc.isRunning(), false); // The fiber should be finished
        NodeAssert.strictEqual(fc.isExited(), true); // The fiber should be exited
        NodeAssert.strictEqual(fc.isSleeping(), false); // The fiber should not be sleeping
    });

    await NodeTest.it('Should be able to sleep and woken up', async () => {

        const fc = new FiberController({
            'main': async (ctx) => {

                do {
                    ctx.data.count++;
                    await ctx.sleep();
                    await NodeTimer.setImmediate();
                } while (!ctx.data.stop);

            },
            'data': { stop: false, count: 0 },
        });

        for (let i = 0; i < 5; i++) {

            while (fc.isRunning()) {
                await NodeTimer.setImmediate();
            }
            if (fc.isSleeping()) {
                fc.resume();
            }
        }

        NodeAssert.strictEqual(fc.data.count, 5); // The count should be 5
        fc.data.stop = true; // Stop the fiber execution

        await fc.waitForExit();
    });

    await NodeTest.it('sleep method should throw error after exited', async () => {

        let fCtx: any = null;

        const fc = new FiberController({
            async main(ctx) { fCtx = ctx; }
        });

        await fc.waitForExit();
        NodeAssert.strictEqual(fc.isExited(), true); // The fiber should be exited

        let v = 0;
        try {
            await fCtx.sleep();
        }
        catch {
            v = 1;
        }
        NodeAssert.strictEqual(v, 1, 'sleep method should throw an error if called after execution done');
    });

    await NodeTest.it('waitForSleep method should throw error after exited', async () => {

        const fc = new FiberController({
            async main() {}
        });

        await fc.waitForExit();
        NodeAssert.strictEqual(fc.isExited(), true); // The fiber should be exited

        let v = 0;
        try {
            await fc.waitForSleep()
        }
        catch {
            v = 1;
        }
        NodeAssert.strictEqual(v, 1, 'waitForSleep method should throw an error if called after execution done');
    });

    await NodeTest.it('wait method should throw the error thrown by the execution', async () => {

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

    await NodeTest.it('sleep method throw error if called after execution done', async () => {

        let pr: any = null;
        const fc = new FiberController({
            async main(ctx) { pr = ctx.sleep(); }
        });

        await fc.waitForExit();

        try {
            await pr;
            NodeAssert.fail('Expected an error to be thrown when calling sleep on an exited fiber');
        }
        catch {
            NodeAssert.ok(true, 'Error thrown as expected when calling sleep on an exited fiber');
        }

        NodeAssert.strictEqual(fc.isExited(), true); // The fiber should be exited
    });

    await NodeTest.it('resume method should return false if the fiber is not sleeping', async () => {

        const fc = new FiberController({
            main: async () => { await NodeTimer.setImmediate(); }
        });

        NodeAssert.strictEqual(fc.isRunning(), true); // The fiber should be running
        NodeAssert.strictEqual(fc.resume(), false, 'Resume should return false if the fiber is running');

        await fc.waitForExit();

        NodeAssert.strictEqual(fc.isExited(), true); // The fiber should be exited
        NodeAssert.strictEqual(fc.resume(), false, 'Resume should return false if the fiber is exited');
    });

    await NodeTest.it('fiber execution should received abort signal after abort method is called', async () => {

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

    await NodeTest.it('waitForSleep should be resolved after the fiber went sleep', async () => {

        let v = 0;
        const fc = new FiberController({
            async main(ctx) {

                await NodeTimer.setImmediate();
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

    await NodeTest.it('waitForHibernation should throw error if the fiber exits without hibernation', async () => {

        let v = 0;
        const fc = new FiberController({
            async main() { await NodeTimer.setImmediate(); }
        });

        try {

            await fc.waitForSleep();
        }
        catch (err) {
            v++;
        }

        NodeAssert.strictEqual(v, 1, 'The fiber execution should receive the abort signal');
        NodeAssert.strictEqual(fc.isExited(), true); // The fiber should be exited
    });

    await NodeTest.it('waitForSleep should return immediately if the fiber is already sleeping', async () => {

        let v = 0;
        const fc = new FiberController({
            async main(ctx) {

                v++;
                await ctx.sleep();
                v++;

            }
        });

        NodeAssert.strictEqual(v, 1);
        await NodeTimer.setImmediate();
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

    await NodeTest.it('sleep method should throw error after abort method is called', async () => {

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

        await NodeTimer.setImmediate();

        fc.abort();

        await fc.waitForExit();

        NodeAssert.strictEqual(v, 1, 'sleep should throw an error after abort is called');
        NodeAssert.strictEqual(fc.isExited(), true); // The fiber should be exited
    });

    await NodeTest.it('sleep method should immediately throw error if abort method is already called', async () => {

        let v = 0;
        const fc = new FiberController({
            async main(ctx) {

                await NodeTimer.setImmediate();

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
});
