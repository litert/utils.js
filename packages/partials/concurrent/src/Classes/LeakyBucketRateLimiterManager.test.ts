import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import * as NodeTimers from 'node:timers/promises';
import { autoTick } from '@litert/utils-test';
import { LeakyBucketRateLimiterManager } from './LeakyBucketRateLimiterManager';

NodeTest.describe('Class LeakyBucketRateLimiterManager', async () => {

    await NodeTest.it('should not wait if the bucket is empty', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 10000 });

        const limiter = new LeakyBucketRateLimiterManager({
            capacity: 2,
            leakIntervalMs: 100,
        });

        const start = Date.now();

        NodeAssert.strictEqual(limiter.size(), 0);

        await autoTick(ctx, Promise.all([
            limiter.challenge('a'),
            limiter.challenge('b'),
        ]));

        NodeAssert.strictEqual(limiter.size(), 2);

        NodeAssert.strictEqual(Date.now() - start, 0);
    });

    await NodeTest.it('should wait enough time to process each task', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 0 });

        const limiter = new LeakyBucketRateLimiterManager({
            capacity: 2,
            leakIntervalMs: 100,
        });

        const start = Date.now();
        NodeAssert.strictEqual(limiter.isBlocking('a'), false);
        NodeAssert.strictEqual(limiter.isBlocking('b'), false);

        // the first one, no wait.
        // The next leaking time should be at 100ms later.
        await autoTick(ctx, Promise.all([
            limiter.challenge('a'),
            limiter.challenge('b'),
        ]));

        const pr = Promise.all([
            limiter.challenge('a'),
            limiter.challenge('b'),
        ]);
        NodeAssert.strictEqual(limiter.isBlocking('a'), true);
        NodeAssert.strictEqual(limiter.isBlocking('b'), true);
        // the second one, should wait 100ms.
        // The next leaking time should be at 200ms later.
        await autoTick(ctx, pr);
        NodeAssert.strictEqual(Date.now() - start, 100);

        // the third one, should also wait 100ms.
        // The next leaking time should be at 300ms later.
        await autoTick(ctx, Promise.all([
            limiter.challenge('a'),
            limiter.challenge('b'),
        ]));
        NodeAssert.strictEqual(Date.now() - start, 200);

        // the fourth one, should also wait 100ms.
        // The next leaking time should be at 400ms later.
        await autoTick(ctx, Promise.all([
            limiter.challenge('a'),
            limiter.challenge('b'),
        ]));
        NodeAssert.strictEqual(Date.now() - start, 300);

        // Here now is at 300ms, so the bucket is half empty (1/2)
        // only one task can be processed in the next 100ms.
        // so if 2 tasks are challenged, the second one should be rejected.
        await autoTick(ctx, Promise.all([
            NodeAssert.doesNotReject(limiter.challenge('a')),
            NodeAssert.doesNotReject(limiter.challenge('b')),
            NodeAssert.rejects(limiter.challenge('a')),
            NodeAssert.rejects(limiter.challenge('b')),
        ]));

        // wait for 100ms, so the bucket will become empty again.
        await autoTick(ctx, NodeTimers.setTimeout(100));

        await autoTick(ctx, Promise.all([
            limiter.challenge('a'),
            limiter.challenge('b'),
            limiter.challenge('a'),
            limiter.challenge('b'),
            (async () => {
                await NodeTimers.setTimeout(100);
                await limiter.challenge('a');
                await limiter.challenge('b');
            })(),
        ]));

        await NodeAssert.rejects(async () => {

            await autoTick(ctx, Promise.all([
                limiter.challenge('a'),
                limiter.challenge('b'),
                limiter.challenge('a'),
                limiter.challenge('b'),
                limiter.challenge('a'),
                limiter.challenge('b'),
            ]));
        });
    });

    await NodeTest.it('call method should work as same as challenge', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 0 });

        const limiter = new LeakyBucketRateLimiterManager({
            capacity: 2,
            leakIntervalMs: 100,
        });

        const start = Date.now();

        // the first one, no wait.
        // The next leaking time should be at 100ms later.
        NodeAssert.deepStrictEqual(
            await Promise.all([
                limiter.call('a', () => 'first'),
                limiter.call('b', () => 'first')
            ]),
            ['first', 'first']
        );

        NodeAssert.strictEqual(Date.now() - start, 0);

        const prs = Promise.all([
            limiter.call('a', () => 'second'),
            limiter.call('b', () => 'second')
        ]);
        NodeAssert.strictEqual(limiter.isBlocking('a'), true);
        NodeAssert.strictEqual(limiter.isBlocking('b'), true);

        // the second one, should wait 100ms.
        // The next leaking time should be at 200ms later.
        NodeAssert.deepStrictEqual(await autoTick(ctx, prs), ['second', 'second']);
        NodeAssert.strictEqual(Date.now() - start, 100);

        NodeAssert.deepStrictEqual(
            await autoTick(ctx, Promise.all([
                limiter.call('a', () => 'third'),
                limiter.call('b', () => 'third')
            ])),
            ['third', 'third']
        );
        NodeAssert.strictEqual(Date.now() - start, 200);
    });

    await NodeTest.it('test for larger capacity', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 0 });

        const limiter = new LeakyBucketRateLimiterManager({
            capacity: 5,
            leakIntervalMs: 100,
        });

        const start = Date.now();

        await autoTick(ctx, Promise.all([
            limiter.challenge('a'),
            limiter.challenge('a'),
            limiter.challenge('a'),
            limiter.challenge('a'),
            limiter.challenge('a'),
        ]));

        NodeAssert.strictEqual(Date.now() - start, 400);

        await autoTick(ctx, Promise.all([
            limiter.challenge('a'),
            limiter.challenge('a'),
            limiter.challenge('a'),
            limiter.challenge('a'),
            NodeAssert.rejects(limiter.challenge('a'))
        ]));

        NodeAssert.strictEqual(Date.now() - start, 800);

    });

    await NodeTest.it('reset method should remove blocking', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 10000 });

        const limiter = new LeakyBucketRateLimiterManager({
            capacity: 2,
            leakIntervalMs: 100,
        });

        const start = Date.now();

        const prAllowed: Array<Promise<void>> = [];

        prAllowed.push(limiter.challenge('a'));
        prAllowed.push(limiter.challenge('a'));
        NodeAssert.strictEqual(limiter.isBlocking('a'), true);
        prAllowed.push(NodeAssert.rejects(limiter.challenge('a')));

        limiter.reset('a');

        prAllowed.push(limiter.challenge('a'));
        prAllowed.push(limiter.challenge('a'));
        prAllowed.push(NodeAssert.rejects(limiter.challenge('a')));

        await autoTick(ctx, Promise.all(prAllowed));

        NodeAssert.strictEqual(Date.now() - start, 100);
    });

    await NodeTest.it('method clean should recycle unused buckets', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 10000 });

        const limiter = new LeakyBucketRateLimiterManager({
            capacity: 2,
            leakIntervalMs: 100,
        });

        NodeAssert.strictEqual(limiter.size(), 0);

        await autoTick(ctx, Promise.all([
            limiter.challenge('a'),
            limiter.challenge('b'),
        ]));

        NodeAssert.strictEqual(limiter.size(), 2);

        limiter.clean();

        NodeAssert.strictEqual(limiter.size(), 2);

        ctx.mock.timers.tick(99);

        limiter.clean();

        NodeAssert.strictEqual(limiter.size(), 2);

        ctx.mock.timers.tick(1);

        limiter.clean();

        NodeAssert.strictEqual(limiter.size(), 0);
        
        await autoTick(ctx, limiter.challenge('a'));

        NodeAssert.strictEqual(limiter.size(), 1);

        limiter.clean();

        NodeAssert.strictEqual(limiter.size(), 1);

        ctx.mock.timers.tick(100);

        limiter.clean();

        NodeAssert.strictEqual(limiter.size(), 0);
    });

    await NodeTest.it('method clean should recycle unused buckets but delay by cleanDelayMs', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 10000 });

        const limiter = new LeakyBucketRateLimiterManager({
            capacity: 2,
            leakIntervalMs: 100,
            cleanDelayMs: 200,
        });

        NodeAssert.strictEqual(limiter.size(), 0);

        await autoTick(ctx, Promise.all([
            limiter.challenge('a'),
            limiter.challenge('b'),
        ]));

        NodeAssert.strictEqual(limiter.size(), 2);

        limiter.clean();

        NodeAssert.strictEqual(limiter.size(), 2);

        ctx.mock.timers.tick(100);

        limiter.clean();

        NodeAssert.strictEqual(limiter.size(), 2);

        ctx.mock.timers.tick(199);

        limiter.clean();

        NodeAssert.strictEqual(limiter.size(), 2);

        ctx.mock.timers.tick(1);

        limiter.clean();

        NodeAssert.strictEqual(limiter.size(), 0);
    });

    NodeTest.it('should throw error if any option value is invalid', () => {

        for (const v of [ -1, 1.5, NaN, 1n, Symbol('sss'), Infinity, -Infinity, '1', {}, [], true, false ]) {

            NodeAssert.throws(() => {

                new LeakyBucketRateLimiterManager({
                    capacity: v as unknown as number,
                    leakIntervalMs: 1000,
                });
            });
            NodeAssert.throws(() => {

                new LeakyBucketRateLimiterManager({
                    capacity: 123,
                    leakIntervalMs: v as unknown as number,
                });
            });
            NodeAssert.throws(() => {

                new LeakyBucketRateLimiterManager({
                    capacity: 123,
                    leakIntervalMs: 1234,
                    cleanDelayMs: v as unknown as number,
                });
            });
        }
        NodeAssert.throws(() => {

            new LeakyBucketRateLimiterManager({
                capacity: 0,
                leakIntervalMs: 1000,
            });
        });
        NodeAssert.throws(() => {

            new LeakyBucketRateLimiterManager({
                capacity: 123,
                leakIntervalMs: 0,
            });
        });
    });
});
