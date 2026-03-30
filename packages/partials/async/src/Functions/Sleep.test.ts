/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import * as TestUtils from '@litert/utils-test';
import { sleep } from './Sleep.js';
import { E_ABORTED } from '../Errors.js';

NodeTest.describe('Module Async - Function Sleep', async () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    await NodeTest.it('B-M-00001: Should wait exactly for the specific duration', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'] });

        const t0 = Date.now();

        await TestUtils.autoTick(ctx, sleep(100));

        NodeAssert.strictEqual(Date.now() - t0, 100);

        await TestUtils.autoTick(ctx, sleep(10000));

        NodeAssert.strictEqual(Date.now() - t0, 10100);
    });

    await NodeTest.it('B-M-00002: Should wait safely even if the duration exceeds 0x7FFFFFFF', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'] });

        const t0 = Date.now();

        await TestUtils.autoTick(ctx, sleep(0x8000_0000));

        const t1 = Date.now();

        NodeAssert.strictEqual(t1 - t0, 0x8000_0000);

        await TestUtils.autoTick(ctx, sleep(0x9000_0000));

        const t2 = Date.now();

        NodeAssert.strictEqual(t2 - t1, 0x9000_0000);
    });

    // ─── Black-Box: Failure Flow ─────────────────────────

    await NodeTest.it('B-F-00001: Should throw E_ABORTED if signal passed in and aborted', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'] });

        const t0 = Date.now();
        const ABORT_AT_MS = 100;
        const SLEEP_DURATION_MS = 10_000;

        const ac = new AbortController();
        setTimeout(() => ac.abort(), ABORT_AT_MS);

        let errors = 0;

        await NodeAssert.rejects(
            TestUtils.autoTickMs(ctx, sleep(SLEEP_DURATION_MS, ac.signal), { tickMs: 1 }),
            (e) => {
                errors++;
                NodeAssert.ok(e instanceof E_ABORTED, 'Error should be an instance of E_ABORTED');
                NodeAssert.strictEqual(Date.now() - t0, ABORT_AT_MS, `Should be aborted at exactly ${ABORT_AT_MS}ms`);
                return true;
            }
        );

        NodeAssert.strictEqual(errors, 1, 'Error should be thrown once');
    });

    NodeTest.it('B-F-00002: Should throw TypeError if delayMs is not a non-negative integer', async () => {

        await NodeAssert.rejects(
            () => sleep(-1),
            { name: 'TypeError', message: 'The delayMs must be a non-negative integer.' }
        );

        await NodeAssert.rejects(
            () => sleep(0.5),
            { name: 'TypeError', message: 'The delayMs must be a non-negative integer.' }
        );

        await NodeAssert.rejects(
            () => sleep(NaN),
            { name: 'TypeError', message: 'The delayMs must be a non-negative integer.' }
        );

        await NodeAssert.rejects(
            () => sleep(Infinity),
            { name: 'TypeError', message: 'The delayMs must be a non-negative integer.' }
        );
    });

    NodeTest.it('B-F-00003: Should throw E_ABORTED immediately if signal is already aborted', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'] });

        const ac = new AbortController();
        ac.abort();

        const t0 = Date.now();

        await NodeAssert.rejects(
            TestUtils.autoTick(ctx, sleep(100, ac.signal)),
            (e) => {
                NodeAssert.ok(e instanceof E_ABORTED, 'Error should be an instance of E_ABORTED');
                NodeAssert.strictEqual(Date.now() - t0, 0, 'Function should throw immediately without advancing mock time');
                return true;
            }
        );
    });

    // ─── Black-Box: Edge Cases ───────────────────────────

    await NodeTest.it('B-E-00001: Should resolve normally for sleep(0) even if signal is already aborted', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'] });

        const ac = new AbortController();
        ac.abort();

        // sleep(0) skips the abort-signal check branch and just yields one event-loop tick
        await TestUtils.autoTick(ctx, sleep(0, ac.signal));

        NodeAssert.ok(true, 'sleep(0) with an aborted signal resolves without throwing');
    });

    await NodeTest.it('B-E-00002: sleep(0) should yield one event-loop tick then resolve', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'] });

        const t0 = Date.now();

        await TestUtils.autoTick(ctx, sleep(0));

        // setTimeout(resolve, 0) does not advance the mock clock
        NodeAssert.strictEqual(Date.now() - t0, 0, 'sleep(0) should not advance mock time');
    });
});
