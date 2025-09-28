import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import * as NodeTimer from 'node:timers/promises';
import { CircuitBreaker, E_BREAKER_OPENED } from './CircuitBreaker';
import { asyncThrows } from '@litert/utils-test';

NodeTest.describe('Class CircuitBreaker', async () => {

    NodeTest.it('should throw errors if option values are invalid', () => {

        for (const invalidValue of [0, -1, 1.5, 'foo', {}, [], true, false]) {

            NodeAssert.throws(() => { new CircuitBreaker({ cooldownTimeMs: invalidValue as number }); });
            NodeAssert.throws(() => { new CircuitBreaker({ breakThreshold: invalidValue as number }); });
            NodeAssert.throws(() => { new CircuitBreaker({ warmupThreshold: invalidValue as number }); });
        }

        for (const invalidValue of [0, -1, 1.5, 'foo', {}, [], true, false]) {

            NodeAssert.throws(() => { new CircuitBreaker({ isFailure: invalidValue as any }); });
            NodeAssert.throws(() => { new CircuitBreaker({ errorCtorOnOpen: invalidValue as any }); });
        }
    });

    NodeTest.it('breaker should trigger event opened once opened', () => {

        const b = new CircuitBreaker({});
        let evOpened = 0;
        b.on('opened', () => { evOpened++; });
        b.open();

        NodeAssert.strictEqual(evOpened, 1);

        b.open(); // should not trigger event again
        NodeAssert.strictEqual(evOpened, 1);
    });

    NodeTest.it('breaker should trigger event closed once closed', () => {

        const b = new CircuitBreaker({});
        let evClosed = 0;

        NodeAssert.strictEqual(b.isClosed(), true);
        b.close(); // should not trigger event
        b.on('closed', () => { evClosed++; });
        b.open();

        NodeAssert.strictEqual(b.isOpened(), true);
        b.close();
        NodeAssert.strictEqual(evClosed, 1);

        b.close(); // should not trigger event again
        NodeAssert.strictEqual(evClosed, 1);
    });

    await NodeTest.it('breaker should keep closed if no error occurred', async () => {

        const FAIL_THRESHOLD = 3;

        const syncFn = () => { return };
        const breaker = new CircuitBreaker({
            breakThreshold: FAIL_THRESHOLD,
            cooldownTimeMs: 1000,
            warmupThreshold: 2,
        });

        for (let i = 0; i < FAIL_THRESHOLD * 100; i++) {

            NodeAssert.strictEqual(breaker.isOpened(), false);
            NodeAssert.strictEqual(breaker.isHalfOpened(), false);
            NodeAssert.strictEqual(breaker.isClosed(), true);

            breaker.call(syncFn);
        }

        NodeAssert.strictEqual(breaker.isOpened(), false);
        NodeAssert.strictEqual(breaker.isHalfOpened(), false);
        NodeAssert.strictEqual(breaker.isClosed(), true);

        const asyncFn = async (): Promise<string> => { return 'ok'; };

        for (let i = 0; i < FAIL_THRESHOLD * 100; i++) {

            NodeAssert.strictEqual(breaker.isOpened(), false);
            NodeAssert.strictEqual(breaker.isHalfOpened(), false);
            NodeAssert.strictEqual(breaker.isClosed(), true);

            const r = await breaker.call(asyncFn);
            NodeAssert.strictEqual(r, 'ok');
        }

        NodeAssert.strictEqual(breaker.isOpened(), false);
        NodeAssert.strictEqual(breaker.isHalfOpened(), false);
        NodeAssert.strictEqual(breaker.isClosed(), true);
    });

    await NodeTest.it('breaker should ignore some errors by isFailure callback', async () => {

        class MyError extends Error { }

        const FAIL_THRESHOLD = 3;

        const syncFn = (failWithMyError: boolean) => {

            if (failWithMyError) {
                throw new MyError('Service failed');
            }

            throw new Error('Other error');
        };

        const breaker = new CircuitBreaker({
            breakThreshold: FAIL_THRESHOLD,
            cooldownTimeMs: 1000,
            warmupThreshold: 2,
            isFailure: (err) => { return err instanceof MyError; },
        });

        for (let i = 0; i < FAIL_THRESHOLD * 10; i++) {

            NodeAssert.strictEqual(breaker.isClosed(), true);

            // only MyError counts as failure
            NodeAssert.throws(() => { breaker.call(() => { syncFn(false); }); });
        }

        NodeAssert.strictEqual(breaker.isClosed(), true);

        for (let i = 0; i < FAIL_THRESHOLD; i++) {

            NodeAssert.strictEqual(breaker.isClosed(), true);

            NodeAssert.throws(() => { breaker.call(() => { syncFn(true); }); });
        }

        NodeAssert.strictEqual(breaker.isOpened(), true);
    });

    await NodeTest.it('breaker should become opened after too many failures', async () => {

        const FAIL_THRESHOLD = 3;

        const syncFn = () => { throw new Error('Service failed'); };
        const breaker = new CircuitBreaker({
            breakThreshold: FAIL_THRESHOLD,
            cooldownTimeMs: 1000,
            warmupThreshold: 2,
        });

        for (let i = 0; i < FAIL_THRESHOLD; i++) {

            NodeAssert.strictEqual(breaker.isOpened(), false);
            NodeAssert.strictEqual(breaker.isHalfOpened(), false);
            NodeAssert.strictEqual(breaker.isClosed(), true);

            NodeAssert.throws(() => { breaker.call(syncFn); }, { message: 'Service failed' });
        }

        NodeAssert.strictEqual(breaker.isOpened(), true);
        NodeAssert.strictEqual(breaker.isHalfOpened(), false);
        NodeAssert.strictEqual(breaker.isClosed(), false);

        NodeAssert.throws(() => { breaker.call(syncFn); }, E_BREAKER_OPENED);

        const asyncFn = async (): Promise<string> => { throw new Error('Service failed'); };
        const asyncBreaker = new CircuitBreaker({
            breakThreshold: FAIL_THRESHOLD,
            cooldownTimeMs: 1000,
            warmupThreshold: 2,
        });

        for (let i = 0; i < FAIL_THRESHOLD; i++) {

            NodeAssert.strictEqual(asyncBreaker.isOpened(), false);
            NodeAssert.strictEqual(asyncBreaker.isHalfOpened(), false);
            NodeAssert.strictEqual(asyncBreaker.isClosed(), true);

            await asyncThrows(async () => { await asyncBreaker.call(asyncFn); }, 'Service failed');
        }

        NodeAssert.strictEqual(asyncBreaker.isOpened(), true);
        NodeAssert.strictEqual(asyncBreaker.isHalfOpened(), false);
        NodeAssert.strictEqual(asyncBreaker.isClosed(), false);

        await asyncThrows(async () => { await asyncBreaker.call(asyncFn); }, E_BREAKER_OPENED);
    });

    await NodeTest.it('isOpen method should return false after cooldown', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date'] });

        const COOLDOWN_MS = 1000;

        const breaker = new CircuitBreaker({
            breakThreshold: 3,
            cooldownTimeMs: COOLDOWN_MS,
            warmupThreshold: 2,
        });

        breaker.open();
        NodeAssert.strictEqual(breaker.isOpened(), true);
        ctx.mock.timers.tick(COOLDOWN_MS);
        NodeAssert.strictEqual(breaker.isOpened(), false);
    });

    await NodeTest.it('isHalfOpen method return true after cooldown', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date'] });

        const COOLDOWN_MS = 1000;

        const breaker = new CircuitBreaker({
            breakThreshold: 3,
            cooldownTimeMs: COOLDOWN_MS,
            warmupThreshold: 2,
        });

        breaker.open();
        NodeAssert.strictEqual(breaker.isOpened(), true);
        NodeAssert.strictEqual(breaker.isHalfOpened(), false);

        ctx.mock.timers.tick(COOLDOWN_MS);
        NodeAssert.strictEqual(breaker.isHalfOpened(), true);
        NodeAssert.strictEqual(breaker.isOpened(), false);
    });

    await NodeTest.it('"until" parameter should control the cooldown time', async (ctx) => {
        ctx.mock.timers.enable({ apis: ['Date'] });

        const breaker = new CircuitBreaker({
            breakThreshold: 123,
            cooldownTimeMs: 1000,
            warmupThreshold: 2,
        });

        breaker.open(); // use the default cooldown time
        NodeAssert.strictEqual(breaker.isOpened(), true);
        ctx.mock.timers.tick(999);
        NodeAssert.strictEqual(breaker.isOpened(), true);
        ctx.mock.timers.tick(1);
        NodeAssert.strictEqual(breaker.isOpened(), false);
        NodeAssert.strictEqual(breaker.isHalfOpened(), true);

        breaker.open(Date.now() + 1); // use custom cooldown time
        NodeAssert.strictEqual(breaker.isOpened(), true);
        ctx.mock.timers.tick(0);
        NodeAssert.strictEqual(breaker.isOpened(), true);
        ctx.mock.timers.tick(1);
        NodeAssert.strictEqual(breaker.isOpened(), false);
        NodeAssert.strictEqual(breaker.isHalfOpened(), true);
    });

    await NodeTest.it('breaker should become HALF_OPENED after a cooldown', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date'] });

        const COOLDOWN_MS = 1000;

        const breaker = new CircuitBreaker({
            breakThreshold: 3,
            cooldownTimeMs: COOLDOWN_MS,
            warmupThreshold: 2,
        });

        breaker.open();

        ctx.mock.timers.tick(COOLDOWN_MS);

        NodeAssert.strictEqual(breaker.isOpened(), false);
        NodeAssert.strictEqual(breaker.isHalfOpened(), true);
    });

    await NodeTest.it('sufficient successful calls should close breaker under HALF_OPENED', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'] });

        const COOLDOWN_MS = 1000;
        const WARM_UP_QTY = 2;

        const breaker = new CircuitBreaker({
            breakThreshold: 3,
            cooldownTimeMs: COOLDOWN_MS,
            warmupThreshold: WARM_UP_QTY,
        });

        breaker.open();

        ctx.mock.timers.tick(COOLDOWN_MS);
        NodeAssert.strictEqual(breaker.isHalfOpened(), true);

        for (let i = 0; i < WARM_UP_QTY; i++) {

            breaker.call(() => { return; });
        }

        NodeAssert.strictEqual(breaker.isClosed(), true);
        NodeAssert.strictEqual(breaker.isOpened(), false);
        NodeAssert.strictEqual(breaker.isHalfOpened(), false);

        breaker.open();

        ctx.mock.timers.tick(COOLDOWN_MS);
        NodeAssert.strictEqual(breaker.isHalfOpened(), true);

        for (let i = 0; i < WARM_UP_QTY; i++) {

            await breaker.call(async () => { return; });
        }

        NodeAssert.strictEqual(breaker.isClosed(), true);
        NodeAssert.strictEqual(breaker.isOpened(), false);
        NodeAssert.strictEqual(breaker.isHalfOpened(), false);
    });

    await NodeTest.it('any failed call should open the breaker again under HALF_OPENED', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'] });

        const COOLDOWN_MS = 1000;

        const breaker = new CircuitBreaker({
            breakThreshold: 123,
            cooldownTimeMs: COOLDOWN_MS,
            warmupThreshold: 123,
        });

        breaker.open();
        ctx.mock.timers.tick(COOLDOWN_MS);
        NodeAssert.strictEqual(breaker.isHalfOpened(), true);
        NodeAssert.throws(() => { breaker.call(() => { throw new Error('123'); }); });
        NodeAssert.strictEqual(breaker.isOpened(), true);

        breaker.open();
        ctx.mock.timers.tick(COOLDOWN_MS);
        NodeAssert.strictEqual(breaker.isHalfOpened(), true);
        await asyncThrows(async () => { await breaker.call(async () => { throw new Error('123'); }); });
        NodeAssert.strictEqual(breaker.isOpened(), true);
    });

    await NodeTest.it('only the same batch of warmup calls should make breaker closed', async (ctx) => {

        // This is to ensure that if partial warmup calls failed and opened the breaker again,
        // but the other partial calls are still running until the next warmup batch starts,
        // the previous batch calls should not affect the new batch.

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'] });

        const COOLDOWN_MS = 1000;

        const breaker = new CircuitBreaker({
            breakThreshold: 123,
            cooldownTimeMs: COOLDOWN_MS,
            warmupThreshold: 3,
        });

        // no need to test sync calls (of previous batch), as they are not waiting asynchronously
        // so that never have the chance to affect the next batch.

        breaker.open();
        ctx.mock.timers.tick(COOLDOWN_MS);
        NodeAssert.strictEqual(breaker.isHalfOpened(), true);
        
        // since 3 warmup calls are required, we make one call fail and 2 call pending

        let prevBatchCallDone = 0;

        // [batch#1] the pending call (should succeed)
        const pr1 = breaker.call(async () => {

            await NodeTimer.setTimeout(COOLDOWN_MS + 100);
            prevBatchCallDone++;
        });

        // [batch#1] the pending call (should fail)
        const pr2 = breaker.call(async () => {

            await NodeTimer.setTimeout(COOLDOWN_MS + 100);
            prevBatchCallDone++;
            throw new Error('123');
        });

        // [batch#1] the failed call
        NodeAssert.throws(() => { breaker.call(() => { throw new Error('123'); }); }, { message: '123' });

        NodeAssert.strictEqual(breaker.isHalfOpened(), false);
        NodeAssert.strictEqual(breaker.isOpened(), true);

        ctx.mock.timers.tick(COOLDOWN_MS); // start a new batch

        // [batch#2] a success call
        breaker.call(() => { return; }); // a success call of new batch

        NodeAssert.strictEqual(breaker.isHalfOpened(), true);
        NodeAssert.strictEqual(prevBatchCallDone, 0);

        ctx.mock.timers.tick(200);
        await Promise.allSettled([pr1, pr2]);
        NodeAssert.strictEqual(breaker.isHalfOpened(), true);
        NodeAssert.strictEqual(breaker.isOpened(), false);
        NodeAssert.strictEqual(prevBatchCallDone, 2);
    });

    NodeTest.it('wrap method should use the same breaker', () => {

        const fn = () => { return 'ok'; };

        const breaker = new CircuitBreaker({
            breakThreshold: 3,
            cooldownTimeMs: 1000,
            warmupThreshold: 2,
        });

        const wrappedFn = breaker.wrap(fn);

        NodeAssert.strictEqual(breaker.call(fn), 'ok');
        NodeAssert.strictEqual(wrappedFn(), 'ok');

        breaker.open();

        NodeAssert.throws(() => { breaker.call(fn); }, E_BREAKER_OPENED);
        NodeAssert.throws(() => { wrappedFn(); }, E_BREAKER_OPENED);
    });

    await NodeTest.it('only limited calls should be allowed under HALF_OPENED', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'] });

        const COOLDOWN_MS = 1000;
        const WARM_UP_QTY = 2;

        const breaker = new CircuitBreaker({
            breakThreshold: 3,
            cooldownTimeMs: COOLDOWN_MS,
            warmupThreshold: WARM_UP_QTY,
        });

        breaker.open();

        ctx.mock.timers.tick(COOLDOWN_MS);

        let promises: Array<Promise<unknown>> = [];

        for (let i = 0; i < WARM_UP_QTY; i++) {

            promises.push(breaker.call(() => NodeTimer.setTimeout(10)));
        }

        NodeAssert.throws(() => { breaker.call(() => { }); }, E_BREAKER_OPENED);

        ctx.mock.timers.tick(10);
        await Promise.all(promises);
        NodeAssert.strictEqual(breaker.isClosed(), true);
        NodeAssert.strictEqual(breaker.isOpened(), false);
        NodeAssert.strictEqual(breaker.isHalfOpened(), false);
    });
});
