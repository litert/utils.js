/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import NodeTimer from 'node:timers/promises';
import { autoTickMs } from './AutoTickMs.js';

NodeTest.describe('Module Test - Function AutoTickMs', async () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    await NodeTest.it('B-M-00001: Should automatically run all timers', async (ctx) => {

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

    await NodeTest.it('B-M-00002: Should tick fast if tickMs is set to a larger value', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });

        const DURATION_MS = 3600 * 1000 * 24;
        const TICK_MS = 3600 * 1000;
        const t0 = Date.now();

        await autoTickMs(ctx, NodeTimer.setTimeout(DURATION_MS), { tickMs: TICK_MS });

        NodeAssert.strictEqual(Date.now() - t0, DURATION_MS, 'Mock clock should advance by the full timer duration');
    });

    await NodeTest.it('B-M-00003: Should accept a factory function with custom tickMs', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });

        const t0 = Date.now();

        const ret = await autoTickMs(
            ctx,
            async () => {
                await NodeTimer.setTimeout(5000, null);
                return 'factory-tickMs';
            },
            { tickMs: 100 }
        );

        NodeAssert.strictEqual(Date.now() - t0, 5000, 'Mock clock should advance by the full timer duration');
        NodeAssert.strictEqual(ret, 'factory-tickMs', 'Function should return the correct value from the factory');
    });

    // ─── Black-Box: Failure Flow ─────────────────────────

    await NodeTest.it('B-F-00001: Should reject with the same error when the promise rejects', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });

        const t0 = Date.now();

        await NodeAssert.rejects(
            () => autoTickMs(ctx, async () => {
                await NodeTimer.setTimeout(1000, null);
                await NodeTimer.setTimeout(2000, null);
                throw new Error('Test error');
            }),
            (e: unknown) => {
                NodeAssert.ok(e instanceof Error, 'Error should be an instance of Error');
                NodeAssert.strictEqual((e as Error).message, 'Test error', 'Error message should match');
                return true;
            }
        );

        NodeAssert.strictEqual(Date.now() - t0, 3000, 'Function should wait 3000ms before throwing an error');
    });

    await NodeTest.it('B-F-00002: Should stop ticking timers aborted by signal', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });

        const t0 = Date.now();
        const ac = new AbortController();

        await NodeAssert.rejects(
            () => autoTickMs(ctx, async () => {
                setTimeout(() => ac.abort(new Error('test')), 50);
                await NodeTimer.setTimeout(1000, null, { signal: ac.signal });
                await NodeTimer.setTimeout(2000, null);
                throw new Error('Test error');
            }),
            (e: unknown) => {
                NodeAssert.ok(e instanceof Error, 'Error should be an instance of Error');
                NodeAssert.strictEqual((e as Error).message, 'The operation was aborted', 'Error message should match');
                return true;
            }
        );

        // tick(1ms) advances in discrete steps, so the clock stops at ~50ms when the
        // abort fires — not at the full 1000ms timer duration.
        NodeAssert.strictEqual(Date.now() - t0, 50, 'Function should wait 50ms before throwing an error');
    });

    // ─── Black-Box: Edge Cases ───────────────────────────

    await NodeTest.it('B-E-00001: Should not advance mock time when the promise is already resolved', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });

        const t0 = Date.now();
        await autoTickMs(ctx, Promise.resolve(), { tickMs: 3600 * 1000 });
        await autoTickMs(ctx, () => Promise.resolve(), { tickMs: 3600 * 1000 });

        NodeAssert.strictEqual(Date.now(), t0, 'Mock clock should not advance when the promise is already resolved');
    });
});
