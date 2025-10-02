import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { CountingRateLimiter } from './CountingRateLimiter';
import { SlideWindowCounter } from './SlideWindowCounter';

NodeTest.describe('Class CountingRateLimiter', () => {

    NodeTest.it('should not limit until reach the threshold', (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'] });

        const limiter = new CountingRateLimiter({
            counter: new SlideWindowCounter({
                'windowQty': 5,
                'windowSizeMs': 1000,
            }),
            limits: 10,
        });

        for (let i = 0; i < 10; ++i) {
            ctx.mock.timers.tick(500);
            NodeAssert.doesNotThrow(() => { limiter.challenge(); });
        }

        NodeAssert.throws(() => { limiter.challenge(); });
        NodeAssert.throws(() => { limiter.call(() => { return 'ok'; }) });
        
        ctx.mock.timers.tick(500);

        NodeAssert.doesNotThrow(() => { limiter.challenge(); });
    });

    NodeTest.it('should unlimit by reset method', () => {

        const limiter = new CountingRateLimiter({
            counter: new SlideWindowCounter({
                'windowQty': 5,
                'windowSizeMs': 1000,
            }),
            limits: 10,
        });

        for (let i = 0; i < 10; ++i) {

            NodeAssert.doesNotThrow(() => { limiter.challenge(); });
        }

        NodeAssert.throws(() => { limiter.challenge(); });

        limiter.reset();

        NodeAssert.doesNotThrow(() => { limiter.challenge(); });
    });

    NodeTest.it('wrapped function should work as expected', (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'] });

        const limiter = new CountingRateLimiter({
            counter: new SlideWindowCounter({
                'windowQty': 5,
                'windowSizeMs': 1000,
            }),
            limits: 10,
        });

        const fn = (v: number) => { return v; };

        const fnWrapped = limiter.wrap(fn);

        for (let i = 0; i < 10; ++i) {

            ctx.mock.timers.tick(500);
            NodeAssert.doesNotThrow(() => { fnWrapped(i); });
        }

        NodeAssert.throws(() => { fnWrapped(123); });

        ctx.mock.timers.tick(500);

        NodeAssert.doesNotThrow(() => { fnWrapped(123); });

        limiter.reset();

        NodeAssert.doesNotThrow(() => { fnWrapped(123); });
    });
});
