/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { sleep } from '@litert/utils-async';
import { autoTick } from '@litert/utils-test';
import { LeakyBucketRateLimiter } from './LeakyBucketRateLimiter.js';

NodeTest.describe('Module Concurrent - Class LeakyBucketRateLimiter', async () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    await NodeTest.it('B-M-00001: Should not wait if the bucket is empty', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 10000 });

        const limiter = new LeakyBucketRateLimiter({
            capacity: 2,
            leakIntervalMs: 100,
        });

        const start = Date.now();

        await autoTick(ctx, limiter.challenge());

        NodeAssert.strictEqual(Date.now() - start, 0);
    });

    await NodeTest.it('B-M-00002: Should wait enough time to process each task', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 0 });

        const limiter = new LeakyBucketRateLimiter({
            capacity: 2,
            leakIntervalMs: 100,
        });

        const start = Date.now();

        // the first one, no wait.
        // The next leaking time should be at 100ms later.
        await autoTick(ctx, limiter.challenge());

        const pr = limiter.challenge();
        NodeAssert.strictEqual(limiter.isBlocking(), true);
        // the second one, should wait 100ms.
        // The next leaking time should be at 200ms later.
        await autoTick(ctx, pr);
        NodeAssert.strictEqual(Date.now() - start, 100);

        // the third one, should also wait 100ms.
        // The next leaking time should be at 300ms later.
        await autoTick(ctx, limiter.challenge());
        NodeAssert.strictEqual(Date.now() - start, 200);

        // the fourth one, should also wait 100ms.
        // The next leaking time should be at 400ms later.
        await autoTick(ctx, limiter.challenge());
        NodeAssert.strictEqual(Date.now() - start, 300);

        // Here now is at 300ms, so the bucket is half empty (1/2)
        // only one task can be processed in the next 100ms.
        // so if 2 tasks are challenged, the second one should be rejected.
        await autoTick(ctx, Promise.all([
            NodeAssert.doesNotReject(limiter.challenge()),
            NodeAssert.rejects(limiter.challenge())
        ]));

        // wait for 100ms, so the bucket will become empty again.
        await autoTick(ctx, sleep(100));

        await autoTick(ctx, Promise.all([
            limiter.challenge(),
            limiter.challenge(),
            (async () => {
                await sleep(100);
                await limiter.challenge();
            })(),
        ]));

        await NodeAssert.rejects(async () => {

            await autoTick(ctx, Promise.all([
                limiter.challenge(),
                limiter.challenge(),
                limiter.challenge(),
            ]));
        });
    });

    await NodeTest.it('B-M-00003: Call method should work as same as challenge', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 0 });

        const limiter = new LeakyBucketRateLimiter({
            capacity: 2,
            leakIntervalMs: 100,
        });

        const start = Date.now();

        // the first one, no wait.
        // The next leaking time should be at 100ms later.
        NodeAssert.strictEqual(
            await limiter.call(() => 'first'),
            'first'
        );

        NodeAssert.strictEqual(Date.now() - start, 0);

        const pr = limiter.call(() => 'second');
        NodeAssert.strictEqual(limiter.isBlocking(), true);

        // the second one, should wait 100ms.
        // The next leaking time should be at 200ms later.
        NodeAssert.strictEqual(await autoTick(ctx, pr), 'second');
        NodeAssert.strictEqual(Date.now() - start, 100);

        NodeAssert.strictEqual(
            await autoTick(ctx, limiter.call(() => 'third')),
            'third'
        );
        NodeAssert.strictEqual(Date.now() - start, 200);
    });

    await NodeTest.it('B-M-00004: Wrap method should make wrapped function works like method call', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 0 });

        const limiter = new LeakyBucketRateLimiter({
            capacity: 2,
            leakIntervalMs: 100,
        });

        const start = Date.now();

        const wrapped = limiter.wrap((a: number, b: number) => `result:${a + b}`);

        // the first one, no wait.
        // The next leaking time should be at 100ms later.
        NodeAssert.strictEqual(
            await wrapped(1, 2) as string,
            'result:3'
        );

        NodeAssert.strictEqual(Date.now() - start, 0);

        const pr = wrapped(10, 20);
        NodeAssert.strictEqual(limiter.isBlocking(), true);

        // the second one, should wait 100ms.
        // The next leaking time should be at 200ms later.
        NodeAssert.strictEqual(await autoTick(ctx, pr) as string, 'result:30');
        NodeAssert.strictEqual(Date.now() - start, 100);

        NodeAssert.strictEqual(
            await autoTick(ctx, wrapped(100, 200)) as string,
            'result:300'
        );
        NodeAssert.strictEqual(Date.now() - start, 200);
    });

    await NodeTest.it('B-M-00005: Reset method should remove blocking', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 10000 });

        const limiter = new LeakyBucketRateLimiter({
            capacity: 2,
            leakIntervalMs: 100,
        });

        const start = Date.now();

        const prAllowed: Array<Promise<void>> = [];

        prAllowed.push(limiter.challenge());
        prAllowed.push(limiter.challenge());
        NodeAssert.strictEqual(limiter.isBlocking(), true);
        prAllowed.push(NodeAssert.rejects(limiter.challenge()));

        limiter.reset();

        prAllowed.push(limiter.challenge());
        prAllowed.push(limiter.challenge());
        prAllowed.push(NodeAssert.rejects(limiter.challenge()));

        await autoTick(ctx, Promise.all(prAllowed));

        NodeAssert.strictEqual(Date.now() - start, 100);
    });

    await NodeTest.it('B-M-00006: IsIdle should return true when bucket is idle and false when blocking', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 0 });

        const limiter = new LeakyBucketRateLimiter({
            capacity: 2,
            leakIntervalMs: 100,
        });

        NodeAssert.strictEqual(limiter.isIdle(), true);

        limiter.challenge(); // not awaited — bucket is now scheduled
        NodeAssert.strictEqual(limiter.isIdle(), false);
    });

    // ─── Black-Box: Failure Flow ─────────────────────────

    NodeTest.it('B-F-00001: Should throw error if any option value is invalid', () => {

        for (const v of [ -1, 0, 1.5, NaN, 1n, Symbol('sss'), Infinity, -Infinity, '1', {}, [], true, false ]) {

            NodeAssert.throws(() => {

                new LeakyBucketRateLimiter({
                    capacity: v as unknown as number,
                    leakIntervalMs: 1000,
                });
            });
            NodeAssert.throws(() => {

                new LeakyBucketRateLimiter({
                    capacity: 123,
                    leakIntervalMs: v as unknown as number,
                });
            });
        }
    });

    // ─── Black-Box: Edge Cases ───────────────────────────

    await NodeTest.it('B-E-00001: Test for larger capacity', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 0 });

        const limiter = new LeakyBucketRateLimiter({
            capacity: 5,
            leakIntervalMs: 100,
        });

        const start = Date.now();

        await autoTick(ctx, Promise.all([
            limiter.challenge(),
            limiter.challenge(),
            limiter.challenge(),
            limiter.challenge(),
            limiter.challenge(),
        ]));

        NodeAssert.strictEqual(Date.now() - start, 400);

        await autoTick(ctx, Promise.all([
            limiter.challenge(),
            limiter.challenge(),
            limiter.challenge(),
            limiter.challenge(),
            NodeAssert.rejects(limiter.challenge())
        ]));

        NodeAssert.strictEqual(Date.now() - start, 800);

    });
});
