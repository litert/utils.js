import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { TokenBucketRateLimiter } from './TokenBucketRateLimiter';

NodeTest.describe('Class TokenBucketRateLimiter', () => {

    NodeTest.it('should not limit until reach the threshold', (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'] });

        const limiter = new TokenBucketRateLimiter({
            capacity: 3,
            refillIntervalMs: 1000,
        });

        NodeAssert.doesNotThrow(() => limiter.challenge());
        NodeAssert.doesNotThrow(() => limiter.challenge());
        NodeAssert.doesNotThrow(() => limiter.challenge());
        NodeAssert.strictEqual(limiter.isLimited(), true);
        NodeAssert.throws(() => limiter.challenge());
    });

    NodeTest.it('should recover one token after one refill interval', (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'] });

        const limiter = new TokenBucketRateLimiter({
            capacity: 3,
            refillIntervalMs: 1000,
        });

        NodeAssert.doesNotThrow(() => limiter.challenge());
        NodeAssert.doesNotThrow(() => limiter.challenge());
        NodeAssert.doesNotThrow(() => limiter.challenge());
        NodeAssert.strictEqual(limiter.isLimited(), true);
        NodeAssert.throws(() => limiter.challenge());

        ctx.mock.timers.tick(1000);

        NodeAssert.strictEqual(limiter.isLimited(), false);

        NodeAssert.doesNotThrow(() => limiter.challenge());
        NodeAssert.strictEqual(limiter.isLimited(), true);
        NodeAssert.throws(() => limiter.challenge());
    });

    NodeTest.it('should recover 2 tokens after 2 refill intervals', (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'] });

        const limiter = new TokenBucketRateLimiter({
            capacity: 3,
            refillIntervalMs: 1000,
        });

        NodeAssert.doesNotThrow(() => limiter.challenge());
        NodeAssert.doesNotThrow(() => limiter.challenge());
        NodeAssert.doesNotThrow(() => limiter.challenge());
        NodeAssert.strictEqual(limiter.isLimited(), true);
        NodeAssert.throws(() => limiter.challenge());

        ctx.mock.timers.tick(2000);

        NodeAssert.strictEqual(limiter.isLimited(), false);
        NodeAssert.doesNotThrow(() => limiter.challenge());

        NodeAssert.strictEqual(limiter.isLimited(), false);
        NodeAssert.doesNotThrow(() => limiter.challenge());

        NodeAssert.strictEqual(limiter.isLimited(), true);
        NodeAssert.throws(() => limiter.challenge());
    });

    NodeTest.it('should not recover tokens until one refill interval', (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'] });

        const limiter = new TokenBucketRateLimiter({
            capacity: 3,
            refillIntervalMs: 1000,
        });

        NodeAssert.doesNotThrow(() => limiter.challenge());
        NodeAssert.doesNotThrow(() => limiter.challenge());
        NodeAssert.doesNotThrow(() => limiter.challenge());
        NodeAssert.strictEqual(limiter.isLimited(), true);
        NodeAssert.throws(() => limiter.challenge());

        for (let i = 0; i < 9; i++) {
            ctx.mock.timers.tick(100);
            NodeAssert.strictEqual(limiter.isLimited(), true);
            NodeAssert.throws(() => limiter.challenge());
        }

        ctx.mock.timers.tick(100);
        NodeAssert.strictEqual(limiter.isLimited(), false);
        NodeAssert.doesNotThrow(() => limiter.challenge());
        NodeAssert.strictEqual(limiter.isLimited(), true);
    });

    NodeTest.it('should reset last refill-time to now if a long gap passed', (ctx) => {

        // If not, the time will always be long time ago,
        // and the tokens will be refilled to full capacity.
        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'] });

        const limiter = new TokenBucketRateLimiter({
            capacity: 3,
            refillIntervalMs: 1000,
        });

        NodeAssert.doesNotThrow(() => limiter.challenge());
        NodeAssert.doesNotThrow(() => limiter.challenge());
        ctx.mock.timers.tick(1000);

        NodeAssert.doesNotThrow(() => limiter.challenge());
        NodeAssert.doesNotThrow(() => limiter.challenge());

        NodeAssert.strictEqual(limiter.isLimited(), true);

        ctx.mock.timers.tick(1000000);

        NodeAssert.strictEqual(limiter.isLimited(), false);

        NodeAssert.doesNotThrow(() => limiter.challenge());
        NodeAssert.doesNotThrow(() => limiter.challenge());
        NodeAssert.doesNotThrow(() => limiter.challenge());
    });

    NodeTest.it('reset method should refills all tokens and reset the time', () => {

        const limiter = new TokenBucketRateLimiter({
            capacity: 3,
            refillIntervalMs: 1000,
        });

        NodeAssert.doesNotThrow(() => limiter.challenge());
        NodeAssert.doesNotThrow(() => limiter.challenge());
        NodeAssert.strictEqual(limiter.isLimited(), false);

        limiter.reset();

        NodeAssert.strictEqual(limiter.isLimited(), false);
        NodeAssert.doesNotThrow(() => limiter.challenge());
        NodeAssert.doesNotThrow(() => limiter.challenge());
        NodeAssert.doesNotThrow(() => limiter.challenge());
        NodeAssert.strictEqual(limiter.isLimited(), true);
        NodeAssert.throws(() => limiter.challenge());
    });

    NodeTest.it('call method should works as same as challenge', (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'] });

        const limiter = new TokenBucketRateLimiter({
            capacity: 3,
            refillIntervalMs: 1000,
        });

        NodeAssert.doesNotThrow(() => limiter.challenge());
        NodeAssert.doesNotThrow(() => limiter.challenge());
        NodeAssert.doesNotThrow(() => limiter.challenge());
        NodeAssert.strictEqual(limiter.isLimited(), true);
        NodeAssert.throws(() => limiter.challenge());

        ctx.mock.timers.tick(3000);

        NodeAssert.strictEqual('123', limiter.call(() => '123'));
        NodeAssert.strictEqual('123', limiter.call(() => '123'));
        NodeAssert.strictEqual('123', limiter.call(() => '123'));
        NodeAssert.strictEqual(limiter.isLimited(), true);

        NodeAssert.throws(() => limiter.call(() => '123'));
    });

    NodeTest.it('wrap method should make wrapped function works as same as call', (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'] });

        const limiter = new TokenBucketRateLimiter({
            capacity: 3,
            refillIntervalMs: 1000,
        });

        const fn = limiter.wrap((a: string) => a);

        NodeAssert.strictEqual('123', fn('123'));
        NodeAssert.strictEqual('233', fn('233'));
        NodeAssert.strictEqual('666', fn('666'));
        NodeAssert.strictEqual(limiter.isLimited(), true);
        NodeAssert.throws(() => fn('1234'));

        ctx.mock.timers.tick(3000);

        NodeAssert.strictEqual('123', limiter.call(() => '123'));
        NodeAssert.strictEqual('123', limiter.call(() => '123'));
        NodeAssert.strictEqual('123', limiter.call(() => '123'));
        NodeAssert.strictEqual(limiter.isLimited(), true);
        NodeAssert.throws(() => limiter.call(() => '123'));
    });

    NodeTest.it('should process the case if time reversed', (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 1000000 });

        const limiter = new TokenBucketRateLimiter({
            capacity: 3,
            refillIntervalMs: 1000,
        });

        NodeAssert.strictEqual(limiter.isLimited(), false);
        NodeAssert.strictEqual(limiter.isEmpty(), true);

        NodeAssert.doesNotThrow(() => limiter.challenge());
        NodeAssert.doesNotThrow(() => limiter.challenge());
        NodeAssert.doesNotThrow(() => limiter.challenge());
        NodeAssert.strictEqual(limiter.isLimited(), true);
        NodeAssert.throws(() => limiter.challenge());

        ctx.mock.timers.setTime(900000);

        NodeAssert.strictEqual(limiter.isLimited(), true);
        NodeAssert.throws(() => limiter.challenge());
        ctx.mock.timers.setTime(999000);
        NodeAssert.strictEqual(limiter.isLimited(), true);
        NodeAssert.throws(() => limiter.challenge());
        ctx.mock.timers.tick(1000);
        NodeAssert.strictEqual(limiter.isLimited(), true);
        NodeAssert.throws(() => limiter.challenge());
        ctx.mock.timers.tick(1000);
        NodeAssert.strictEqual(limiter.isLimited(), false);
        NodeAssert.doesNotThrow(() => limiter.challenge());
    });

    NodeTest.it('should throw error if any option value is invalid', () => {

        for (const v of [ -1, 0, 1.5, NaN, 1n, Symbol('sss'), Infinity, -Infinity, '1', {}, [], true, false ]) {

            NodeAssert.throws(() => {

                new TokenBucketRateLimiter({
                    capacity: v as unknown as number,
                    refillIntervalMs: 1000,
                });
            });
            NodeAssert.throws(() => {

                new TokenBucketRateLimiter({
                    capacity: 123,
                    refillIntervalMs: v as unknown as number,
                });
            });
            NodeAssert.throws(() => {

                new TokenBucketRateLimiter({
                    capacity: 123,
                    refillIntervalMs: 12345,
                    initialTokens: v as unknown as number,
                });
            });
        }
        NodeAssert.throws(() => {

            new TokenBucketRateLimiter({
                capacity: 123,
                refillIntervalMs: 12345,
                initialTokens: 124,
            });
        });
    });
});
