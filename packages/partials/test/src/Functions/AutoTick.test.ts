/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import NodeTimer from 'node:timers/promises';
import { autoTick } from './AutoTick.js';

NodeTest.describe('Module Test - Function AutoTick', async () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    await NodeTest.it('B-M-00001: Should automatically run all timers', async (ctx) => {

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

    await NodeTest.it('B-M-00002: Should accept a factory function as asyncTask', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });

        const t0 = Date.now();

        const ret = await autoTick(ctx, async () => {
            await NodeTimer.setTimeout(500, null);
            await NodeTimer.setTimeout(500, null);
            return 'factory';
        });

        NodeAssert.strictEqual(Date.now() - t0, 1000, 'Mock clock should advance by the full timer duration');
        NodeAssert.strictEqual(ret, 'factory', 'Function should return the correct value from the factory');
    });

    // ─── Black-Box: Failure Flow ─────────────────────────

    await NodeTest.it('B-F-00001: Should reject with the same error when the promise rejects', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });

        const t0 = Date.now();

        await NodeAssert.rejects(
            () => autoTick(ctx, (async () => {
                await NodeTimer.setTimeout(1000, null);
                await NodeTimer.setTimeout(2000, null);
                throw new Error('Test error');
            })()),
            (e: unknown) => {
                NodeAssert.ok(e instanceof Error, 'Error should be an instance of Error');
                NodeAssert.strictEqual((e as Error).message, 'Test error', 'Error message should match');
                return true;
            }
        );

        NodeAssert.strictEqual(Date.now() - t0, 3000, 'Function should wait 3000ms before throwing an error');
    });

    await NodeTest.it('B-F-00002: Should count the full timer duration even if aborted by signal', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });

        const t0 = Date.now();
        const ac = new AbortController();

        await NodeAssert.rejects(
            () => autoTick(ctx, (async () => {
                setTimeout(() => ac.abort(new Error('test')), 50);
                await NodeTimer.setTimeout(1000, null, { signal: ac.signal });
                await NodeTimer.setTimeout(2000, null);
                throw new Error('Test error');
            })()),
            (e: unknown) => {
                NodeAssert.ok(e instanceof Error, 'Error should be an instance of Error');
                NodeAssert.strictEqual((e as Error).message, 'The operation was aborted', 'Error message should match');
                return true;
            }
        );

        // runAll() fires every pending timer at its full scheduled duration, so the mock
        // clock advances to 1000ms even though the abort fires at 50ms.
        NodeAssert.strictEqual(Date.now() - t0, 1000, 'Function should wait 1000ms before throwing an error');
    });
});
