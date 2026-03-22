import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import NodeTimer from 'node:timers/promises';
import { autoTickMs } from './AutoTickMs.js';

NodeTest.describe('Function autoTickMs', async () => {

    await NodeTest.it('Should automatically run all timers', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });

        const t0 = Date.now();

        const ret = await autoTickMs(ctx, (async () => {
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
            await autoTickMs(ctx, async () => {
                await NodeTimer.setTimeout(1000, null);
                await NodeTimer.setTimeout(2000, null);
                throw new Error('Test error');
            });
            NodeAssert.fail('Function should throw an error');
        }
        catch (e) {

            NodeAssert.strictEqual(e instanceof Error, true, 'Error should be an instance of Error');
            NodeAssert.strictEqual((e as Error).message, 'Test error', 'Error message should match');
        }

        NodeAssert.strictEqual(Date.now() - t0, 3000, 'Function should wait 3000ms before throwing an error');
    });

    await NodeTest.it('Should stop ticking timers aborted by signal', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });

        const t0 = Date.now();

        try {
            const ac = new AbortController();
            await autoTickMs(ctx, async () => {
                setTimeout(() => ac.abort(new Error('test')), 50);
                await NodeTimer.setTimeout(1000, null, { signal: ac.signal });
                await NodeTimer.setTimeout(2000, null);
                throw new Error('Test error');
            });
            NodeAssert.fail('Function should throw an error');
        }
        catch (e) {

            NodeAssert.strictEqual(e instanceof Error, true, 'Error should be an instance of Error');
            NodeAssert.strictEqual((e as Error).message, 'The operation was aborted', 'Error message should match');
        }

        /**
         * The first setTimeout will be triggered after 50ms, which will abort the
         * first `sleep` function call. So the result is that the first `sleep`
         * function call will not reach its full duration of 1000ms, but throws
         * an error after 50ms.
         * That why the total duration should be about 50ms, neither 1000ms nor 3000ms.
         */
        NodeAssert.strictEqual(Date.now() - t0, 50, 'Function should wait 50ms before throwing an error');
    });

    await NodeTest.it('Should tick fast if tickMs is set to a larger value', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });

        // if tickMs is still 1ms, it will tick a total of 3600*1000*24 times,
        // which may cause high CPU usage and a long test time.
        // By setting tickMs to 3600*1000ms, it will tick only 24 times, which is more efficient.
        await autoTickMs(ctx, NodeTimer.setTimeout(3600 * 1000 * 24), { 'tickMs': 3600 * 1000 });
    });

    await NodeTest.it('Should tick 0 for an empty asynchronous task', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });

        // if tickMs is still 1ms, it will tick a total of 3600*1000*24 times,
        // which may cause high CPU usage and a long test time.
        // By setting tickMs to 3600*1000ms, it will tick only 24 times, which is more efficient.
        const t0 = Date.now();
        await autoTickMs(ctx, Promise.resolve(), { 'tickMs': 3600 * 1000 });
        await autoTickMs(ctx, (() => { return; }) as unknown as Promise<void>, { 'tickMs': 3600 * 1000 });

        NodeAssert.strictEqual(Date.now(), t0, 'Function should not tick any timers');
    });
});
