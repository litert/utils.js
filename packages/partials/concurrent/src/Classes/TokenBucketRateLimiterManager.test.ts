/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { TokenBucketRateLimiterManager } from './TokenBucketRateLimiterManager.js';

NodeTest.describe('Module Concurrent - Class TokenBucketRateLimiterManager', () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    NodeTest.it('B-M-00001: Should not limit until reach the threshold', (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'] });

        const limiter = new TokenBucketRateLimiterManager({
            capacity: 3,
            refillIntervalMs: 1000,
        });

        NodeAssert.doesNotThrow(() => limiter.challenge('a'));
        NodeAssert.doesNotThrow(() => limiter.challenge('b'));
        NodeAssert.doesNotThrow(() => limiter.challenge('a'));
        NodeAssert.doesNotThrow(() => limiter.challenge('b'));
        NodeAssert.doesNotThrow(() => limiter.challenge('a'));
        NodeAssert.doesNotThrow(() => limiter.challenge('b'));
        NodeAssert.strictEqual(limiter.isBlocking('a'), true);
        NodeAssert.strictEqual(limiter.isBlocking('b'), true);
        NodeAssert.throws(() => limiter.challenge('a'));
        NodeAssert.throws(() => limiter.challenge('b'));
    });

    NodeTest.it('B-M-00002: Should recover one token after one refill interval', (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'] });

        const limiter = new TokenBucketRateLimiterManager({
            capacity: 3,
            refillIntervalMs: 1000,
        });

        NodeAssert.doesNotThrow(() => limiter.challenge('a'));
        NodeAssert.doesNotThrow(() => limiter.challenge('a'));
        NodeAssert.doesNotThrow(() => limiter.challenge('a'));
        NodeAssert.strictEqual(limiter.isBlocking('a'), true);
        NodeAssert.throws(() => limiter.challenge('a'));

        NodeAssert.doesNotThrow(() => limiter.challenge('b'));
        NodeAssert.doesNotThrow(() => limiter.challenge('b'));
        NodeAssert.doesNotThrow(() => limiter.challenge('b'));
        NodeAssert.strictEqual(limiter.isBlocking('b'), true);
        NodeAssert.throws(() => limiter.challenge('b'));

        ctx.mock.timers.tick(1000);

        NodeAssert.strictEqual(limiter.isBlocking('a'), false);

        NodeAssert.doesNotThrow(() => limiter.challenge('a'));
        NodeAssert.strictEqual(limiter.isBlocking('a'), true);
        NodeAssert.throws(() => limiter.challenge('a'));

        NodeAssert.strictEqual(limiter.isBlocking('b'), false);

        NodeAssert.doesNotThrow(() => limiter.challenge('b'));
        NodeAssert.strictEqual(limiter.isBlocking('b'), true);
        NodeAssert.throws(() => limiter.challenge('b'));
    });

    NodeTest.it('B-M-00003: Should recover 2 tokens after 2 refill intervals', (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'] });

        const limiter = new TokenBucketRateLimiterManager({
            capacity: 3,
            refillIntervalMs: 1000,
        });

        NodeAssert.doesNotThrow(() => limiter.challenge('a'));
        NodeAssert.doesNotThrow(() => limiter.challenge('a'));
        NodeAssert.doesNotThrow(() => limiter.challenge('a'));
        NodeAssert.strictEqual(limiter.isBlocking('a'), true);
        NodeAssert.throws(() => limiter.challenge('a'));

        NodeAssert.doesNotThrow(() => limiter.challenge('b'));
        NodeAssert.doesNotThrow(() => limiter.challenge('b'));
        NodeAssert.doesNotThrow(() => limiter.challenge('b'));
        NodeAssert.strictEqual(limiter.isBlocking('b'), true);
        NodeAssert.throws(() => limiter.challenge('b'));

        ctx.mock.timers.tick(2000);

        NodeAssert.strictEqual(limiter.isBlocking('a'), false);
        NodeAssert.doesNotThrow(() => limiter.challenge('a'));

        NodeAssert.strictEqual(limiter.isBlocking('a'), false);
        NodeAssert.doesNotThrow(() => limiter.challenge('a'));

        NodeAssert.strictEqual(limiter.isBlocking('a'), true);
        NodeAssert.throws(() => limiter.challenge('a'));

        NodeAssert.strictEqual(limiter.isBlocking('b'), false);
        NodeAssert.doesNotThrow(() => limiter.challenge('b'));

        NodeAssert.strictEqual(limiter.isBlocking('b'), false);
        NodeAssert.doesNotThrow(() => limiter.challenge('b'));

        NodeAssert.strictEqual(limiter.isBlocking('b'), true);
        NodeAssert.throws(() => limiter.challenge('b'));
    });

    NodeTest.it('B-M-00004: Should not recover tokens until one refill interval', (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'] });

        const limiter = new TokenBucketRateLimiterManager({
            capacity: 3,
            refillIntervalMs: 1000,
        });

        NodeAssert.doesNotThrow(() => limiter.challenge('a'));
        NodeAssert.doesNotThrow(() => limiter.challenge('a'));
        NodeAssert.doesNotThrow(() => limiter.challenge('a'));
        NodeAssert.strictEqual(limiter.isBlocking('a'), true);
        NodeAssert.throws(() => limiter.challenge('a'));

        NodeAssert.doesNotThrow(() => limiter.challenge('b'));
        NodeAssert.doesNotThrow(() => limiter.challenge('b'));
        NodeAssert.doesNotThrow(() => limiter.challenge('b'));
        NodeAssert.strictEqual(limiter.isBlocking('b'), true);
        NodeAssert.throws(() => limiter.challenge('b'));

        for (let i = 0; i < 9; i++) {
            ctx.mock.timers.tick(100);
            NodeAssert.strictEqual(limiter.isBlocking('a'), true);
            NodeAssert.throws(() => limiter.challenge('a'));

            NodeAssert.strictEqual(limiter.isBlocking('b'), true);
            NodeAssert.throws(() => limiter.challenge('b'));
        }

        ctx.mock.timers.tick(100);
        NodeAssert.strictEqual(limiter.isBlocking('a'), false);
        NodeAssert.doesNotThrow(() => limiter.challenge('a'));
        NodeAssert.strictEqual(limiter.isBlocking('a'), true);

        NodeAssert.strictEqual(limiter.isBlocking('b'), false);
        NodeAssert.doesNotThrow(() => limiter.challenge('b'));
        NodeAssert.strictEqual(limiter.isBlocking('b'), true);
    });

    NodeTest.it('B-M-00005: Reset method should refills all tokens and reset the time', () => {

        const limiter = new TokenBucketRateLimiterManager({
            capacity: 3,
            refillIntervalMs: 1000,
        });

        NodeAssert.doesNotThrow(() => limiter.challenge('a'));
        NodeAssert.doesNotThrow(() => limiter.challenge('b'));
        NodeAssert.doesNotThrow(() => limiter.challenge('a'));
        NodeAssert.doesNotThrow(() => limiter.challenge('b'));
        NodeAssert.strictEqual(limiter.isBlocking('a'), false);
        NodeAssert.strictEqual(limiter.isBlocking('b'), false);

        limiter.reset('a');
        limiter.reset('b');

        NodeAssert.strictEqual(limiter.isBlocking('a'), false);
        NodeAssert.strictEqual(limiter.isBlocking('b'), false);
        NodeAssert.doesNotThrow(() => limiter.challenge('a'));
        NodeAssert.doesNotThrow(() => limiter.challenge('b'));
        NodeAssert.doesNotThrow(() => limiter.challenge('a'));
        NodeAssert.doesNotThrow(() => limiter.challenge('b'));
        NodeAssert.doesNotThrow(() => limiter.challenge('a'));
        NodeAssert.doesNotThrow(() => limiter.challenge('b'));
        NodeAssert.strictEqual(limiter.isBlocking('a'), true);
        NodeAssert.strictEqual(limiter.isBlocking('b'), true);
        NodeAssert.throws(() => limiter.challenge('a'));
        NodeAssert.throws(() => limiter.challenge('b'));
    });

    NodeTest.it('B-M-00006: Call method should works as same as challenge', (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'] });

        const limiter = new TokenBucketRateLimiterManager({
            capacity: 3,
            refillIntervalMs: 1000,
        });

        NodeAssert.doesNotThrow(() => limiter.challenge('a'));
        NodeAssert.doesNotThrow(() => limiter.challenge('b'));
        NodeAssert.doesNotThrow(() => limiter.challenge('a'));
        NodeAssert.doesNotThrow(() => limiter.challenge('b'));
        NodeAssert.doesNotThrow(() => limiter.challenge('a'));
        NodeAssert.doesNotThrow(() => limiter.challenge('b'));
        NodeAssert.strictEqual(limiter.isBlocking('a'), true);
        NodeAssert.strictEqual(limiter.isBlocking('b'), true);
        NodeAssert.throws(() => limiter.challenge('a'));
        NodeAssert.throws(() => limiter.challenge('b'));

        ctx.mock.timers.tick(3000);

        NodeAssert.strictEqual('123', limiter.call('a', () => '123'));
        NodeAssert.strictEqual('123', limiter.call('b', () => '123'));
        NodeAssert.strictEqual('123', limiter.call('a', () => '123'));
        NodeAssert.strictEqual('123', limiter.call('b', () => '123'));
        NodeAssert.strictEqual('123', limiter.call('a', () => '123'));
        NodeAssert.strictEqual('123', limiter.call('b', () => '123'));
        NodeAssert.strictEqual(limiter.isBlocking('a'), true);
        NodeAssert.strictEqual(limiter.isBlocking('b'), true);

        NodeAssert.throws(() => limiter.call('a', () => '123'));
        NodeAssert.throws(() => limiter.call('b', () => '123'));
    });

    NodeTest.it('B-M-00007: Method clean should recycle unused buckets', (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 1000000 });

        const limiter = new TokenBucketRateLimiterManager({
            capacity: 3,
            refillIntervalMs: 1000,
        });

        NodeAssert.strictEqual(limiter.isBlocking('a'), false);
        NodeAssert.strictEqual(limiter.isBlocking('b'), false);

        for (let i = 0; i < 3; i++) {
            NodeAssert.doesNotThrow(() => limiter.challenge('a'));
            NodeAssert.doesNotThrow(() => limiter.challenge('b'));
        }

        NodeAssert.throws(() => limiter.challenge('a'));
        NodeAssert.throws(() => limiter.challenge('b'));
        
        NodeAssert.strictEqual(Object.keys((limiter as any)._buckets).length, 2);

        limiter.clean();

        NodeAssert.strictEqual(Object.keys((limiter as any)._buckets).length, 2);

        ctx.mock.timers.tick(3000);

        limiter.clean();

        NodeAssert.strictEqual(Object.keys((limiter as any)._buckets).length, 0);
    });

    NodeTest.it('B-M-00008: Method clean should recycle unused buckets but delay by cleanDelayMs', (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 1000000 });

        const limiter = new TokenBucketRateLimiterManager({
            capacity: 3,
            refillIntervalMs: 1000,
            cleanDelayMs: 5000,
        });

        NodeAssert.strictEqual(limiter.isBlocking('a'), false);
        NodeAssert.strictEqual(limiter.isBlocking('b'), false);

        for (let i = 0; i < 3; i++) {
            NodeAssert.doesNotThrow(() => limiter.challenge('a'));
            NodeAssert.doesNotThrow(() => limiter.challenge('b'));
        }

        NodeAssert.throws(() => limiter.challenge('a'));
        NodeAssert.throws(() => limiter.challenge('b'));
        
        NodeAssert.strictEqual(Object.keys((limiter as any)._buckets).length, 2);

        limiter.clean();

        NodeAssert.strictEqual(Object.keys((limiter as any)._buckets).length, 2);

        ctx.mock.timers.tick(3000);

        limiter.clean();

        NodeAssert.strictEqual(Object.keys((limiter as any)._buckets).length, 2);

        ctx.mock.timers.tick(4999);

        limiter.clean();

        NodeAssert.strictEqual(Object.keys((limiter as any)._buckets).length, 2);

        ctx.mock.timers.tick(1);

        limiter.clean();

        NodeAssert.strictEqual(Object.keys((limiter as any)._buckets).length, 0);
    });

    // ─── Black-Box: Failure Flow ─────────────────────────

    NodeTest.it('B-F-00001: Should throw error if any option value is invalid', () => {

        for (const v of [ -1, 1.5, NaN, 1n, Symbol('sss'), Infinity, -Infinity, '1', {}, [], true, false ]) {

            NodeAssert.throws(() => {

                new TokenBucketRateLimiterManager({
                    capacity: v as unknown as number,
                    refillIntervalMs: 1000,
                });
            });
            NodeAssert.throws(() => {

                new TokenBucketRateLimiterManager({
                    capacity: 123,
                    refillIntervalMs: v as unknown as number,
                });
            });
            NodeAssert.throws(() => {

                new TokenBucketRateLimiterManager({
                    capacity: 123,
                    refillIntervalMs: 12345,
                    initialTokens: v as unknown as number,
                });
            });
            NodeAssert.throws(() => {

                new TokenBucketRateLimiterManager({
                    capacity: 123,
                    refillIntervalMs: 12345,
                    cleanDelayMs: v as unknown as number,
                });
            });
        }
        NodeAssert.throws(() => {

            new TokenBucketRateLimiterManager({
                capacity: 0,
                refillIntervalMs: 1000,
            });
        });
        NodeAssert.throws(() => {

            new TokenBucketRateLimiterManager({
                capacity: 123,
                refillIntervalMs: 0,
            });
        });
        NodeAssert.throws(() => {

            new TokenBucketRateLimiterManager({
                capacity: 123,
                refillIntervalMs: 12345,
                initialTokens: 124,
            });
        });
    });

    // ─── Black-Box: Edge Cases ───────────────────────────

    NodeTest.it('B-E-00001: Should reset last refill-time to now if a long gap passed', (ctx) => {

        // If not, the time will always be long time ago,
        // and the tokens will be refilled to full capacity.
        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'] });

        const limiter = new TokenBucketRateLimiterManager({
            capacity: 3,
            refillIntervalMs: 1000,
        });

        NodeAssert.doesNotThrow(() => limiter.challenge('a'));
        NodeAssert.doesNotThrow(() => limiter.challenge('b'));
        NodeAssert.doesNotThrow(() => limiter.challenge('a'));
        NodeAssert.doesNotThrow(() => limiter.challenge('b'));
        ctx.mock.timers.tick(1000);

        NodeAssert.doesNotThrow(() => limiter.challenge('a'));
        NodeAssert.doesNotThrow(() => limiter.challenge('b'));
        NodeAssert.doesNotThrow(() => limiter.challenge('a'));
        NodeAssert.doesNotThrow(() => limiter.challenge('b'));

        NodeAssert.strictEqual(limiter.isBlocking('a'), true);
        NodeAssert.strictEqual(limiter.isBlocking('b'), true);

        ctx.mock.timers.tick(1000000);

        NodeAssert.strictEqual(limiter.isBlocking('a'), false);
        NodeAssert.strictEqual(limiter.isBlocking('b'), false);

        NodeAssert.doesNotThrow(() => limiter.challenge('a'));
        NodeAssert.doesNotThrow(() => limiter.challenge('b'));
        NodeAssert.doesNotThrow(() => limiter.challenge('a'));
        NodeAssert.doesNotThrow(() => limiter.challenge('b'));
        NodeAssert.doesNotThrow(() => limiter.challenge('a'));
        NodeAssert.doesNotThrow(() => limiter.challenge('b'));
    });

    NodeTest.it('B-E-00002: Should process the case if time reversed', (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 1000000 });

        const limiter = new TokenBucketRateLimiterManager({
            capacity: 3,
            refillIntervalMs: 1000,
        });

        NodeAssert.strictEqual(limiter.isBlocking('a'), false);
        NodeAssert.strictEqual(limiter.isBlocking('b'), false);

        NodeAssert.doesNotThrow(() => limiter.challenge('a'));
        NodeAssert.doesNotThrow(() => limiter.challenge('b'));
        NodeAssert.doesNotThrow(() => limiter.challenge('a'));
        NodeAssert.doesNotThrow(() => limiter.challenge('b'));
        NodeAssert.doesNotThrow(() => limiter.challenge('a'));
        NodeAssert.doesNotThrow(() => limiter.challenge('b'));
        NodeAssert.strictEqual(limiter.isBlocking('a'), true);
        NodeAssert.strictEqual(limiter.isBlocking('b'), true);
        NodeAssert.throws(() => limiter.challenge('a'));
        NodeAssert.throws(() => limiter.challenge('b'));

        ctx.mock.timers.setTime(900000);

        NodeAssert.strictEqual(limiter.isBlocking('a'), true);
        NodeAssert.strictEqual(limiter.isBlocking('b'), true);
        NodeAssert.throws(() => limiter.challenge('a'));
        NodeAssert.throws(() => limiter.challenge('b'));
        ctx.mock.timers.setTime(999000);
        NodeAssert.strictEqual(limiter.isBlocking('a'), true);
        NodeAssert.strictEqual(limiter.isBlocking('b'), true);
        NodeAssert.throws(() => limiter.challenge('a'));
        NodeAssert.throws(() => limiter.challenge('b'));
        ctx.mock.timers.tick(1000);
        NodeAssert.strictEqual(limiter.isBlocking('a'), true);
        NodeAssert.strictEqual(limiter.isBlocking('b'), true);
        NodeAssert.throws(() => limiter.challenge('a'));
        NodeAssert.throws(() => limiter.challenge('b'));
        ctx.mock.timers.tick(1000);
        NodeAssert.strictEqual(limiter.isBlocking('a'), false);
        NodeAssert.strictEqual(limiter.isBlocking('b'), false);
        NodeAssert.doesNotThrow(() => limiter.challenge('a'));
        NodeAssert.doesNotThrow(() => limiter.challenge('b'));
    });
});
