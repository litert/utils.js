import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import * as NodeTimer from 'node:timers/promises';
import { autoTick } from './AutoTick';

NodeTest.describe('Function autoTick', async () => {

    await NodeTest.it('Should automatically run all timers', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });

        const t0 = Date.now();

        const ret = await autoTick(ctx, (async () => {
            await NodeTimer.setTimeout(1000, null);
            await NodeTimer.setTimeout(2000, null);
            await NodeTimer.setTimeout(3000, null);
            await NodeTimer.setTimeout(4000, null);
            return 123;
        })());

        NodeAssert.strictEqual(Date.now() - t0, 10000, 'Function should wait 10000ms before resolving');
        NodeAssert.strictEqual(ret, 123, 'Function should return the correct value');
    });

    await NodeTest.it('Should throw the same error if the Promise rejected', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });

        const t0 = Date.now();

        try {
            await autoTick(ctx, (async () => {
                await NodeTimer.setTimeout(1000, null);
                await NodeTimer.setTimeout(2000, null);
                throw new Error('Test error');
            })());
            NodeAssert.fail('Function should throw an error');
        }
        catch (e) {

            NodeAssert.strictEqual(e instanceof Error, true, 'Error should be an instance of Error');
            NodeAssert.strictEqual((e as Error).message, 'Test error', 'Error message should match');
        }

        NodeAssert.strictEqual(Date.now() - t0, 3000, 'Function should wait 3000ms before throwing an error');
    });

    await NodeTest.it('Should count the full timer duration even if aborted by signal', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });

        const t0 = Date.now();

        try {
            const ac = new AbortController();
            await autoTick(ctx, (async () => {
                setTimeout(() => ac.abort(new Error('test')), 50);
                await NodeTimer.setTimeout(1000, null, { signal: ac.signal });
                await NodeTimer.setTimeout(2000, null);
                throw new Error('Test error');
            })());
            NodeAssert.fail('Function should throw an error');
        }
        catch (e) {

            NodeAssert.strictEqual(e instanceof Error, true, 'Error should be an instance of Error');
            NodeAssert.strictEqual((e as Error).message, 'The operation was aborted', 'Error message should match');
        }

        // In fact without the autoTick function, (about) 50ms is expected, but with it, the full 1000ms is counted
        // because the autoTick function always ticks the full duration of the timer.
        // So the total time should be 1000ms instead of 50ms.
        NodeAssert.strictEqual(Date.now() - t0, 1000, 'Function should wait 1000ms before throwing an error');
    });
});
