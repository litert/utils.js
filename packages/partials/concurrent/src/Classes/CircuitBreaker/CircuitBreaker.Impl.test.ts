/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { sleep } from '@litert/utils-async';
import { CircuitBreaker } from './CircuitBreaker.Impl.js';
import { LegacyCircuitBreakerCounter } from './CircuitBreaker.LegacyCounter.js';
import { ErrorRateCircuitBreakerCounter } from './CircuitBreaker.ErrorRateCounter.js';
import type { ICircuitBreakerCounter } from './CircuitBreaker.Typings.js';
import * as Errors from '../../Errors.js';

NodeTest.describe('Module Concurrent - Class CircuitBreaker', async () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    NodeTest.it('B-M-00001: Breaker should trigger event opened once opened', () => {

        const b = new CircuitBreaker({});
        let evOpened = 0;
        b.on('opened', () => { evOpened++; });
        b.open();

        NodeAssert.strictEqual(evOpened, 1);

        b.open(); // should not trigger event again
        NodeAssert.strictEqual(evOpened, 1);
    });

    NodeTest.it('B-M-00002: Breaker should trigger event closed once closed', () => {

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

    await NodeTest.it('B-M-00003: Breaker should keep closed if no error occurred', async () => {

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

    await NodeTest.it('B-M-00004: Breaker should ignore some errors by isFailure callback', async () => {

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

    await NodeTest.it('B-M-00005: Breaker should become opened after too many failures', async () => {

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

        NodeAssert.throws(() => { breaker.call(syncFn); }, Errors.E_BREAKER_OPENED);

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

            await NodeAssert.rejects(
                async () => { await asyncBreaker.call(asyncFn); },
                { message: 'Service failed' }
            );
        }

        NodeAssert.strictEqual(asyncBreaker.isOpened(), true);
        NodeAssert.strictEqual(asyncBreaker.isHalfOpened(), false);
        NodeAssert.strictEqual(asyncBreaker.isClosed(), false);

        await NodeAssert.rejects(async () => { await asyncBreaker.call(asyncFn); }, Errors.E_BREAKER_OPENED);
    });

    await NodeTest.it('B-M-00006: IsOpen method should return false after cooldown', async (ctx) => {

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

    await NodeTest.it('B-M-00007: IsHalfOpen method return true after cooldown', async (ctx) => {

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

    await NodeTest.it('B-M-00008: "Until" parameter should control the cooldown time', async (ctx) => {
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

    await NodeTest.it('B-M-00009: Breaker should become HALF_OPENED after a cooldown', async (ctx) => {

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

    await NodeTest.it('B-M-00010: Sufficient successful calls should close breaker under HALF_OPENED', async (ctx) => {

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

    NodeTest.it('B-M-00011: Wrap method should use the same breaker', () => {

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

        NodeAssert.throws(() => { breaker.call(fn); }, Errors.E_BREAKER_OPENED);
        NodeAssert.throws(() => { wrappedFn(); }, Errors.E_BREAKER_OPENED);
    });

    // ─── Black-Box: Failure Flow ─────────────────────────

    NodeTest.it('B-F-00001: Should throw errors if option values are invalid', () => {

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

    await NodeTest.it('B-F-00002: Any failed call should open the breaker again under HALF_OPENED', async (ctx) => {

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
        await NodeAssert.rejects(async () => { await breaker.call(async () => { throw new Error('123'); }); });
        NodeAssert.strictEqual(breaker.isOpened(), true);
    });

    // ─── Black-Box: Edge Cases ───────────────────────────

    await NodeTest.it('B-E-00001: Only the same batch of warmup calls should make breaker closed', async (ctx) => {

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

            await sleep(COOLDOWN_MS + 100);
            prevBatchCallDone++;
        });

        // [batch#1] the pending call (should fail)
        const pr2 = breaker.call(async () => {

            await sleep(COOLDOWN_MS + 100);
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

    await NodeTest.it('B-E-00002: Only limited calls should be allowed under HALF_OPENED', async (ctx) => {

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

            promises.push(breaker.call(() => sleep(10)));
        }

        NodeAssert.throws(() => { breaker.call(() => { }); }, Errors.E_BREAKER_OPENED);

        ctx.mock.timers.tick(10);
        await Promise.all(promises);
        NodeAssert.strictEqual(breaker.isClosed(), true);
        NodeAssert.strictEqual(breaker.isOpened(), false);
        NodeAssert.strictEqual(breaker.isHalfOpened(), false);
    });

    // ─── White-Box: Main Flow ────────────────────────────

    NodeTest.it('W-M-00001: Should use requestCounter API when requestCounter is provided', () => {

        // Targets the `if ('requestCounter' in options)` branch (line 117)
        const counter = new LegacyCircuitBreakerCounter(2);
        const breaker = new CircuitBreaker({ requestCounter: counter, cooldownTimeMs: 100 });

        NodeAssert.strictEqual(breaker.isClosed(), true);

        NodeAssert.throws(() => { breaker.call(() => { throw new Error('fail'); }); });
        NodeAssert.strictEqual(breaker.isClosed(), true);

        NodeAssert.throws(() => { breaker.call(() => { throw new Error('fail'); }); });
        NodeAssert.strictEqual(breaker.isOpened(), true);
    });

    NodeTest.it('W-M-00002: Should use requestCounter with ErrorRateCircuitBreakerCounter', () => {

        // Targets the requestCounter path with a different ICircuitBreakerCounter
        const counter = new ErrorRateCircuitBreakerCounter({
            errorRateThreshold: 0.5,
            minRequest: 2,
        });
        const breaker = new CircuitBreaker({ requestCounter: counter, cooldownTimeMs: 100 });

        NodeAssert.throws(() => { breaker.call(() => { throw new Error('fail'); }); }); // 1/1 errors
        NodeAssert.strictEqual(breaker.isClosed(), true); // minRequest not met

        NodeAssert.throws(() => { breaker.call(() => { throw new Error('fail'); }); }); // 2/2 errors, minRequest=2 met
        NodeAssert.strictEqual(breaker.isOpened(), true);
    });

    NodeTest.it('W-M-00003: Should record success for sync calls on CLOSED state', () => {

        // Targets lines 231-232: `this._counter.record(true)` for sync success
        let recordedSuccess = 0;
        let recordedFailure = 0;

        const mockCounter: ICircuitBreakerCounter = {
            record: (success) => { if (success) recordedSuccess++; else recordedFailure++; },
            reset: () => {},
            isBlocked: () => false,
        };

        const breaker = new CircuitBreaker({ requestCounter: mockCounter, cooldownTimeMs: 100 });

        breaker.call(() => 'ok');
        breaker.call(() => 42);

        NodeAssert.strictEqual(recordedSuccess, 2);
        NodeAssert.strictEqual(recordedFailure, 0);
    });

    NodeTest.it('W-M-00004: Should record success for async calls on CLOSED state', async () => {

        // Targets lines 222-225: `result.then(() => this._counter.record(true), ...)`
        let recordedSuccess = 0;
        let recordedFailure = 0;

        const mockCounter: ICircuitBreakerCounter = {
            record: (success) => { if (success) recordedSuccess++; else recordedFailure++; },
            reset: () => {},
            isBlocked: () => false,
        };

        const breaker = new CircuitBreaker({ requestCounter: mockCounter, cooldownTimeMs: 100 });

        await breaker.call(async () => 'ok');
        await breaker.call(async () => 42);

        NodeAssert.strictEqual(recordedSuccess, 2);
        NodeAssert.strictEqual(recordedFailure, 0);
    });

    NodeTest.it('W-M-00005: Should record failure for async calls that reject on CLOSED state', async () => {

        // Targets line 224: `(err) => { this._handleFailureOnClosed(err); }`
        let recordedSuccess = 0;
        let recordedFailure = 0;

        const mockCounter: ICircuitBreakerCounter = {
            record: (success) => { if (success) recordedSuccess++; else recordedFailure++; },
            reset: () => {},
            isBlocked: () => false,
        };

        const breaker = new CircuitBreaker({
            requestCounter: mockCounter,
            cooldownTimeMs: 100,
            isFailure: () => true,
        });

        await NodeAssert.rejects(
            async () => { await breaker.call(async () => { throw new Error('async fail'); }); },
            { message: 'async fail' }
        );

        NodeAssert.strictEqual(recordedSuccess, 0);
        NodeAssert.strictEqual(recordedFailure, 1);
    });

    NodeTest.it('W-M-00006: Should record non-failing errors as success on CLOSED state', () => {

        // Targets lines 245-248: `_handleFailureOnClosed` when `isFailure` returns false
        let recordedSuccess = 0;
        let recordedFailure = 0;

        const mockCounter: ICircuitBreakerCounter = {
            record: (success) => { if (success) recordedSuccess++; else recordedFailure++; },
            reset: () => {},
            isBlocked: () => false,
        };

        const breaker = new CircuitBreaker({
            requestCounter: mockCounter,
            cooldownTimeMs: 100,
            isFailure: (err) => (err as Error).message === 'real-fail',
        });

        // This error is NOT a failure → recorded as success
        NodeAssert.throws(() => {
            breaker.call(() => { throw new Error('not-a-failure'); });
        });

        NodeAssert.strictEqual(recordedSuccess, 1);
        NodeAssert.strictEqual(recordedFailure, 0);
    });

    NodeTest.it('W-M-00007: Should open breaker when counter.isBlocked() returns true', () => {

        // Targets lines 253-256: `_handleFailureOnClosed` when `isBlocked()` is true
        let callCount = 0;
        const mockCounter: ICircuitBreakerCounter = {
            record: () => { callCount++; },
            reset: () => {},
            isBlocked: () => callCount >= 2, // block after 2 calls
        };

        const breaker = new CircuitBreaker({ requestCounter: mockCounter, cooldownTimeMs: 100 });
        breaker.on('error', () => {}); // suppress unhandled error

        NodeAssert.throws(() => { breaker.call(() => { throw new Error('fail'); }); });
        NodeAssert.strictEqual(breaker.isClosed(), true);

        NodeAssert.throws(() => { breaker.call(() => { throw new Error('fail'); }); });
        NodeAssert.strictEqual(breaker.isOpened(), true);
    });

    await NodeTest.it('W-M-00008: Should use default options when no options provided', async () => {

        // Targets all `?? DEFAULT_OPTIONS.*` paths in the constructor
        const breaker = new CircuitBreaker();

        // Default cooldownTimeMs = 60000, warmupThreshold = 3
        // Verify by triggering open and checking cooldown behavior
        breaker.open();

        // isFailure defaults to () => true
        NodeAssert.throws(() => { breaker.call(() => { throw new Error('x'); }); });

        // errorCtorOnOpen defaults to E_BREAKER_OPENED
        NodeAssert.throws(() => { breaker.call(() => {}); }, Errors.E_BREAKER_OPENED);
    });

    NodeTest.it('W-M-00009: Should use custom errorCtorOnOpen', () => {

        // Targets line 106: `this._errorCtorOnOpen = options.errorCtorOnOpen ?? ...`
        class CustomError extends Error {
            public constructor() { super('custom breaker open'); }
        }

        const breaker = new CircuitBreaker({
            breakThreshold: 1,
            cooldownTimeMs: 1000,
            errorCtorOnOpen: CustomError,
        });

        NodeAssert.throws(() => { breaker.call(() => { throw new Error('fail'); }); }); // opens the breaker
        NodeAssert.throws(() => { breaker.call(() => {}); }, CustomError);
    });

    NodeTest.it('W-M-00010: Should pass breakThreshold and counter to LegacyCircuitBreakerCounter', () => {

        // Targets lines 134-137: `new LegacyCircuitBreakerCounter(options.breakThreshold, options.counter)`
        let increaseCalled = false;

        const customCounter = {
            increase: () => { increaseCalled = true; return 1; },
            reset: () => {},
            getTotal: () => 1,
        };

        const breaker = new CircuitBreaker({
            breakThreshold: 1,
            cooldownTimeMs: 1000,
            counter: customCounter as any,
        });

        NodeAssert.throws(() => { breaker.call(() => { throw new Error('fail'); }); });
        NodeAssert.strictEqual(increaseCalled, true);
    });

    NodeTest.it('W-M-00011: Should open with custom until timestamp', async (ctx) => {

        // Targets line 167: `open(until: number = Date.now() + this._cooldownTimeMs)`
        ctx.mock.timers.enable({ apis: ['Date'] });

        const breaker = new CircuitBreaker({
            breakThreshold: 3,
            cooldownTimeMs: 1000,
            warmupThreshold: 2,
        });

        const customUntil = Date.now() + 5000;
        breaker.open(customUntil);

        NodeAssert.strictEqual(breaker.isOpened(), true);

        // After 1000ms (default cooldown), should still be open
        ctx.mock.timers.tick(1000);
        NodeAssert.strictEqual(breaker.isOpened(), true);

        // After 5000ms total, should transition to half-open
        ctx.mock.timers.tick(4000);
        NodeAssert.strictEqual(breaker.isOpened(), false);
        NodeAssert.strictEqual(breaker.isHalfOpened(), true);
    });

    NodeTest.it('W-M-00012: Should reset counter and warmup counts on open()', () => {

        // Targets lines 170-172: reset of _warmUpCallCount, _warmUpOkCount, counter
        let resetCalled = false;
        const mockCounter: ICircuitBreakerCounter = {
            record: () => {},
            reset: () => { resetCalled = true; },
            isBlocked: () => false,
        };

        const breaker = new CircuitBreaker({ requestCounter: mockCounter, cooldownTimeMs: 100 });

        breaker.open();
        NodeAssert.strictEqual(resetCalled, true);
    });

    NodeTest.it('W-M-00013: Should reset counter and warmup counts on close()', () => {

        // Targets lines 203-205: reset of counter, _warmUpOkCount, _warmUpCallCount
        let resetCalled = false;
        const mockCounter: ICircuitBreakerCounter = {
            record: () => {},
            reset: () => { resetCalled = true; },
            isBlocked: () => false,
        };

        const breaker = new CircuitBreaker({ requestCounter: mockCounter, cooldownTimeMs: 100 });

        breaker.open();
        resetCalled = false;

        breaker.close();
        NodeAssert.strictEqual(resetCalled, true);
    });

    NodeTest.it('W-M-00014: Should not emit opened event when already in OPENED state', () => {

        // Targets line 174: `if (this._state !== EState.OPENED)`
        const events: string[] = [];
        const breaker = new CircuitBreaker({ breakThreshold: 1, cooldownTimeMs: 1000 });
        breaker.on('opened', () => events.push('opened'));

        breaker.open();
        breaker.open(); // second call — already OPENED

        NodeAssert.deepStrictEqual(events, ['opened']);
    });

    NodeTest.it('W-M-00015: Should not emit closed event when already in CLOSED state', () => {

        // Targets line 207: `if (this._state !== EState.CLOSED)`
        const events: string[] = [];
        const breaker = new CircuitBreaker({ breakThreshold: 1, cooldownTimeMs: 1000 });
        breaker.on('closed', () => events.push('closed'));

        NodeAssert.strictEqual(breaker.isClosed(), true);
        breaker.close(); // already CLOSED — no event

        NodeAssert.deepStrictEqual(events, []);
    });

    NodeTest.it('W-M-00016: Should emit half_opened on _openHalf transition', async (ctx) => {

        // Targets line 192: `this.emit('half_opened')`
        ctx.mock.timers.enable({ apis: ['Date'] });

        const events: string[] = [];
        const breaker = new CircuitBreaker({ breakThreshold: 1, cooldownTimeMs: 1000 });
        breaker.on('half_opened', () => events.push('half_opened'));

        breaker.open();
        ctx.mock.timers.tick(1000);

        // Trigger _openHalf via isOpened()
        breaker.isOpened();

        NodeAssert.deepStrictEqual(events, ['half_opened']);
    });

    NodeTest.it('W-M-00017: Should not re-enter _openHalf when already HALF_OPENED', async (ctx) => {

        // Targets line 183: `if (this._state === EState.HALF_OPENED) return`
        ctx.mock.timers.enable({ apis: ['Date'] });

        const events: string[] = [];
        const breaker = new CircuitBreaker({ breakThreshold: 1, cooldownTimeMs: 1000 });
        breaker.on('half_opened', () => events.push('half_opened'));

        breaker.open();
        ctx.mock.timers.tick(1000);

        breaker.isOpened(); // triggers _openHalf
        breaker.isOpened(); // should NOT emit again (already HALF_OPENED)

        NodeAssert.deepStrictEqual(events, ['half_opened']);
    });

    NodeTest.it('W-M-00018: Should call _callOnHalfOpen from _callOnOpen when cooldown expired', async (ctx) => {

        // Targets lines 261-264: `_openHalf(); return this._callOnHalfOpen(fn)`
        ctx.mock.timers.enable({ apis: ['Date'] });

        const breaker = new CircuitBreaker({
            breakThreshold: 1,
            cooldownTimeMs: 1000,
            warmupThreshold: 1,
        });

        NodeAssert.throws(() => { breaker.call(() => { throw new Error('fail'); }); }); // opens breaker
        ctx.mock.timers.tick(1000);

        // call() on OPENED with expired cooldown → should transition and succeed
        const result = breaker.call(() => 'recovered');
        NodeAssert.strictEqual(result, 'recovered');
        NodeAssert.strictEqual(breaker.isClosed(), true);
    });

    NodeTest.it('W-M-00019: Should throw custom error when warmup calls exhausted under HALF_OPENED', async (ctx) => {

        // Targets lines 273-276: `_warmUpCallCount >= _warmupThreshold` → throw
        ctx.mock.timers.enable({ apis: ['Date'] });

        class CustomError extends Error {
            public constructor() { super('warmup exhausted'); }
        }

        const breaker = new CircuitBreaker({
            breakThreshold: 1,
            cooldownTimeMs: 1000,
            warmupThreshold: 1,
            errorCtorOnOpen: CustomError,
        });

        NodeAssert.throws(() => { breaker.call(() => { throw new Error('fail'); }); }); // opens
        ctx.mock.timers.tick(1000);

        // Fill the warmup slot with an async call (doesn't immediately close)
        const p = breaker.call(async () => {
            await sleep(5000);
            return 'ok';
        });

        // warmUpCallCount=1 >= warmupThreshold=1 → throw CustomError
        NodeAssert.throws(() => { breaker.call(() => 'overflow'); }, CustomError);

        ctx.mock.timers.tick(5000);
        await p;
    });

    NodeTest.it('W-M-00020: Should call _handleWarmUpCallSuccess for sync success under HALF_OPENED', async (ctx) => {

        // Targets lines 295-296: sync success path in _callOnHalfOpen
        ctx.mock.timers.enable({ apis: ['Date'] });

        const breaker = new CircuitBreaker({
            breakThreshold: 1,
            cooldownTimeMs: 1000,
            warmupThreshold: 2,
        });

        NodeAssert.throws(() => { breaker.call(() => { throw new Error('fail'); }); }); // opens
        ctx.mock.timers.tick(1000);

        breaker.call(() => 'ok'); // 1st success
        NodeAssert.strictEqual(breaker.isHalfOpened(), true);

        breaker.call(() => 'ok'); // 2nd success → close
        NodeAssert.strictEqual(breaker.isClosed(), true);
    });

    await NodeTest.it('W-M-00021: Should call _handleWarmUpCallSuccess/Failure for async calls under HALF_OPENED', async (ctx) => {

        // Targets lines 287-289: async then() in _callOnHalfOpen
        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'] });

        const breaker = new CircuitBreaker({
            breakThreshold: 1,
            cooldownTimeMs: 1000,
            warmupThreshold: 1,
        });

        NodeAssert.throws(() => { breaker.call(() => { throw new Error('fail'); }); }); // opens
        ctx.mock.timers.tick(1000);

        // Async success path
        await breaker.call(async () => 'async-ok');
        NodeAssert.strictEqual(breaker.isClosed(), true);

        // Now test async failure path
        NodeAssert.throws(() => { breaker.call(() => { throw new Error('fail'); }); }); // opens again
        ctx.mock.timers.tick(1000);

        await NodeAssert.rejects(
            async () => { await breaker.call(async () => { throw new Error('async-fail'); }); },
            { message: 'async-fail' }
        );
        NodeAssert.strictEqual(breaker.isOpened(), true);
    });

    await NodeTest.it('W-M-00022: Should not affect new batch when old batch handler runs late', async (ctx) => {

        // Targets lines 308 and 317: batchId !== this._warmUpBatchCount guard
        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'] });

        const breaker = new CircuitBreaker({
            breakThreshold: 1,
            cooldownTimeMs: 1000,
            warmupThreshold: 3,
        });

        NodeAssert.throws(() => { breaker.call(() => { throw new Error('fail'); }); }); // opens

        ctx.mock.timers.tick(1000); // enter HALF_OPENED

        // batch#1: two async calls that will resolve after delay
        const pr1 = breaker.call(async () => {
            await sleep(2000);
        });
        const pr2 = breaker.call(async () => {
            await sleep(2000);
            throw new Error('late-fail');
        });

        // One sync failure to open the breaker (batch#1 fails)
        NodeAssert.throws(() => { breaker.call(() => { throw new Error('sync-fail'); }); });

        ctx.mock.timers.tick(1000); // enter HALF_OPENED again (batch#2)

        // batch#2: a successful call
        breaker.call(() => 'ok');
        NodeAssert.strictEqual(breaker.isHalfOpened(), true);

        // Now let batch#1 resolve — their handlers should be no-ops
        ctx.mock.timers.tick(2000);
        await Promise.allSettled([pr1, pr2]);

        // Breaker should still be half-open (batch#1 handlers didn't affect batch#2)
        NodeAssert.strictEqual(breaker.isHalfOpened(), true);
    });

    NodeTest.it('W-M-00023: Should return false from isOpened() for non-OPENED states', () => {

        // Targets line 346: `return false` for non-OPENED
        const breaker = new CircuitBreaker({ breakThreshold: 1, cooldownTimeMs: 1000 });

        NodeAssert.strictEqual(breaker.isOpened(), false); // CLOSED
    });

    NodeTest.it('W-M-00024: Should return false from isHalfOpened() for CLOSED state', () => {

        // Targets line 369: `case EState.CLOSED: return false`
        const breaker = new CircuitBreaker({ breakThreshold: 1, cooldownTimeMs: 1000 });

        NodeAssert.strictEqual(breaker.isHalfOpened(), false);
    });

    NodeTest.it('W-M-00025: Should return false from isHalfOpened() when OPENED and cooldown not expired', async (ctx) => {

        // Targets lines 371-372: `Date.now() < this._nextAttemptAt` → false
        ctx.mock.timers.enable({ apis: ['Date'] });

        const breaker = new CircuitBreaker({ breakThreshold: 1, cooldownTimeMs: 1000 });
        breaker.open();

        NodeAssert.strictEqual(breaker.isHalfOpened(), false);
    });

    NodeTest.it('W-M-00026: Should wrap function and preserve breaker context', () => {

        // Targets line 389: `return ((): unknown => this.call(fn)) as TFn`
        let callCount = 0;
        const fn = () => { callCount++; return 'result'; };

        const breaker = new CircuitBreaker({ breakThreshold: 1, cooldownTimeMs: 1000 });
        const wrapped = breaker.wrap(fn);

        const result = wrapped();
        NodeAssert.strictEqual(result, 'result');
        NodeAssert.strictEqual(callCount, 1);

        // Verify the wrapper uses the same breaker
        NodeAssert.throws(() => { breaker.call(() => { throw new Error('fail'); }); }); // opens
        NodeAssert.throws(() => { wrapped(); }, Errors.E_BREAKER_OPENED);
    });

    // ─── White-Box: Failure Flow ─────────────────────────

    NodeTest.it('W-F-00001: Should throw TypeError for non-positive-integer cooldownTimeMs', () => {

        // Targets line 99-101: `!Number.isSafeInteger(v) || v <= 0`
        for (const val of [0, -1, 1.5]) {
            NodeAssert.throws(
                () => new CircuitBreaker({ cooldownTimeMs: val }),
                { name: 'TypeError', message: /cooldownTimeMs/ }
            );
        }
    });

    NodeTest.it('W-F-00002: Should throw TypeError for non-positive-integer warmupThreshold', () => {

        // Targets line 99-101: same validation for warmupThreshold
        for (const val of [0, -1, 1.5]) {
            NodeAssert.throws(
                () => new CircuitBreaker({ warmupThreshold: val }),
                { name: 'TypeError', message: /warmupThreshold/ }
            );
        }
    });

    NodeTest.it('W-F-00003: Should throw TypeError for non-function isFailure', () => {

        // Targets lines 112-114: `typeof v !== 'function'`
        // Note: null is excluded because `null ?? default` returns `default`
        for (const val of [123, 'str', {}, [], true]) {
            NodeAssert.throws(
                () => new CircuitBreaker({ isFailure: val as any }),
                { name: 'TypeError', message: /isFailure/ }
            );
        }
    });

    NodeTest.it('W-F-00004: Should throw TypeError for non-function errorCtorOnOpen', () => {

        // Targets lines 112-114: same validation for errorCtorOnOpen
        // Note: null is excluded because `null ?? default` returns `default`
        for (const val of [123, 'str', {}, [], true]) {
            NodeAssert.throws(
                () => new CircuitBreaker({ errorCtorOnOpen: val as any }),
                { name: 'TypeError', message: /errorCtorOnOpen/ }
            );
        }
    });

    NodeTest.it('W-F-00005: Should throw TypeError for invalid breakThreshold on legacy path', () => {

        // Targets lines 124-131: breakThreshold validation in legacy path
        for (const val of [0, -1, 1.5]) {
            NodeAssert.throws(
                () => new CircuitBreaker({ breakThreshold: val }),
                { name: 'TypeError', message: /breakThreshold/ }
            );
        }
    });

    NodeTest.it('W-F-00006: Should re-throw original error from fn in _callOnClosed', () => {

        // Targets lines 236-239: catch block re-throws
        const breaker = new CircuitBreaker({ breakThreshold: 5, cooldownTimeMs: 1000 });

        NodeAssert.throws(
            () => breaker.call(() => { throw new Error('original'); }),
            { message: 'original' }
        );
    });

    NodeTest.it('W-F-00007: Should re-throw original error from fn in _callOnHalfOpen', async (ctx) => {

        // Targets lines 299-302: catch block in _callOnHalfOpen re-throws
        ctx.mock.timers.enable({ apis: ['Date'] });

        const breaker = new CircuitBreaker({
            breakThreshold: 1,
            cooldownTimeMs: 1000,
            warmupThreshold: 5,
        });

        NodeAssert.throws(() => { breaker.call(() => { throw new Error('fail'); }); }); // opens
        ctx.mock.timers.tick(1000);

        NodeAssert.throws(
            () => breaker.call(() => { throw new Error('half-open-fail'); }),
            { message: 'half-open-fail' }
        );
    });

    // ─── White-Box: Edge Cases ───────────────────────────

    await NodeTest.it('W-E-00001: Should handle async rejection in _callOnClosed correctly', async () => {

        // Targets the async rejection path where promise is returned but error is caught later
        let failureRecorded = false;

        const mockCounter: ICircuitBreakerCounter = {
            record: (success) => { if (!success) failureRecorded = true; },
            reset: () => {},
            isBlocked: () => false,
        };

        const breaker = new CircuitBreaker({
            requestCounter: mockCounter,
            cooldownTimeMs: 1000,
            isFailure: () => true,
        });

        const promise = breaker.call(async () => {
            throw new Error('async-error');
        });

        // The promise itself should reject
        await NodeAssert.rejects(() => promise, { message: 'async-error' });

        // The failure handler runs asynchronously via .then()
        // Give microtask queue time to flush
        await new Promise((r) => setTimeout(r, 10));

        NodeAssert.strictEqual(failureRecorded, true);
    });

    await NodeTest.it('W-E-00002: Should not affect state when stale batch handler fires in _handleWarmUpCallFailure', async (ctx) => {

        // Targets line 308: `batchId !== this._warmUpBatchCount` in failure handler
        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'] });

        const breaker = new CircuitBreaker({
            breakThreshold: 1,
            cooldownTimeMs: 1000,
            warmupThreshold: 3,
        });

        NodeAssert.throws(() => { breaker.call(() => { throw new Error('fail'); }); }); // opens

        ctx.mock.timers.tick(1000); // HALF_OPENED (batch#1)

        // batch#1: two async calls that will fail after delay
        const pr1 = breaker.call(async () => {
            await sleep(2000);
            throw new Error('late-fail-1');
        });
        const pr2 = breaker.call(async () => {
            await sleep(2000);
            throw new Error('late-fail-2');
        });

        // One more call to open the breaker (batch#1 fails)
        NodeAssert.throws(() => { breaker.call(() => { throw new Error('sync-fail'); }); });

        ctx.mock.timers.tick(1000); // HALF_OPENED again (batch#2)

        // batch#2: one success
        breaker.call(() => 'ok');
        NodeAssert.strictEqual(breaker.isHalfOpened(), true);

        // Let batch#1 promises resolve
        ctx.mock.timers.tick(2000);
        await Promise.allSettled([pr1, pr2]);

        // Breaker should still be half-open (batch#1 handlers are stale)
        NodeAssert.strictEqual(breaker.isHalfOpened(), true);
    });

    await NodeTest.it('W-E-00003: Should not affect state when stale batch handler fires in _handleWarmUpCallSuccess', async (ctx) => {

        // Targets line 317: `batchId !== this._warmUpBatchCount` in success handler
        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'] });

        const breaker = new CircuitBreaker({
            breakThreshold: 1,
            cooldownTimeMs: 1000,
            warmupThreshold: 2,
        });

        NodeAssert.throws(() => { breaker.call(() => { throw new Error('fail'); }); }); // opens

        ctx.mock.timers.tick(1000); // HALF_OPENED (batch#1)

        // batch#1: one async call that succeeds after delay
        const pr1 = breaker.call(async () => {
            await sleep(2000);
            return 'ok';
        });

        // One sync failure to open the breaker
        NodeAssert.throws(() => { breaker.call(() => { throw new Error('sync-fail'); }); });

        ctx.mock.timers.tick(1000); // HALF_OPENED again (batch#2)

        // batch#2: one success — not enough to close (warmupThreshold=2)
        breaker.call(() => 'ok');
        NodeAssert.strictEqual(breaker.isHalfOpened(), true);

        // Let batch#1 resolve — its success should NOT count toward batch#2
        ctx.mock.timers.tick(2000);
        await pr1;

        // Still half-open (batch#1 success didn't count)
        NodeAssert.strictEqual(breaker.isHalfOpened(), true);
    });

    NodeTest.it('W-E-00004: Should handle breakThreshold of exactly 1 on legacy path', () => {

        // Targets the breakThreshold validation boundary
        const breaker = new CircuitBreaker({ breakThreshold: 1, cooldownTimeMs: 1000 });

        NodeAssert.throws(() => { breaker.call(() => { throw new Error('fail'); }); });
        NodeAssert.strictEqual(breaker.isOpened(), true);
    });

    NodeTest.it('W-E-00005: Should handle isOpened() triggering _openHalf transition', async (ctx) => {

        // Targets lines 343: `this._openHalf()` inside isOpened()
        ctx.mock.timers.enable({ apis: ['Date'] });

        const halfOpenEvents: string[] = [];
        const breaker = new CircuitBreaker({ breakThreshold: 1, cooldownTimeMs: 1000 });
        breaker.on('half_opened', () => halfOpenEvents.push('half_opened'));

        NodeAssert.throws(() => { breaker.call(() => { throw new Error('fail'); }); }); // opens
        ctx.mock.timers.tick(1000);

        const isOpen = breaker.isOpened(); // should return false AND trigger _openHalf
        NodeAssert.strictEqual(isOpen, false);
        NodeAssert.strictEqual(breaker.isHalfOpened(), true);
        NodeAssert.deepStrictEqual(halfOpenEvents, ['half_opened']);
    });

    // ─── White-Box: Update Compatibility ─────────────────

    NodeTest.it('W-U-00001: Should preserve state transition sequence: CLOSED → OPENED → HALF_OPENED → CLOSED', async (ctx) => {

        /**
         * @undocumented
         * Captures the full lifecycle state transitions.
         */
        ctx.mock.timers.enable({ apis: ['Date'] });

        const events: string[] = [];
        const breaker = new CircuitBreaker({
            breakThreshold: 2,
            cooldownTimeMs: 500,
            warmupThreshold: 1,
        });

        breaker.on('opened', () => events.push('opened'));
        breaker.on('half_opened', () => events.push('half_opened'));
        breaker.on('closed', () => events.push('closed'));

        // CLOSED
        NodeAssert.strictEqual(breaker.isClosed(), true);

        // Trigger failures to open
        NodeAssert.throws(() => { breaker.call(() => { throw new Error('f1'); }); });
        NodeAssert.throws(() => { breaker.call(() => { throw new Error('f2'); }); });

        // OPENED
        NodeAssert.strictEqual(breaker.isOpened(), true);

        ctx.mock.timers.tick(500);

        // HALF_OPENED (via isOpened)
        breaker.isOpened();
        NodeAssert.strictEqual(breaker.isHalfOpened(), true);

        // Successful warmup → CLOSED
        breaker.call(() => 'ok');
        NodeAssert.strictEqual(breaker.isClosed(), true);

        NodeAssert.deepStrictEqual(events, ['opened', 'half_opened', 'closed']);
    });
});
