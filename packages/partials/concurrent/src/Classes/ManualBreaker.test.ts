/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { sleep } from '@litert/utils-async';
import { ManualBreaker } from './ManualBreaker.js';
import * as Errors from '../Errors.js';

NodeTest.describe('Module Concurrent - Class ManualBreaker', async () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    NodeTest.it('B-M-00001: Breaker should be closed by default', () => {

        NodeAssert.strictEqual(new ManualBreaker().isClosed(), true);
        NodeAssert.strictEqual(new ManualBreaker().isOpened(), false);

        NodeAssert.strictEqual(new ManualBreaker(true).isClosed(), true);
        NodeAssert.strictEqual(new ManualBreaker(true).isOpened(), false);

        NodeAssert.strictEqual(new ManualBreaker(false).isClosed(), false);
        NodeAssert.strictEqual(new ManualBreaker(false).isOpened(), true);
    });

    await NodeTest.it('B-M-00002: Should allow calls if breaker is closed', async () => {

        const breaker = new ManualBreaker();

        breaker.call(() => { return; });
        await breaker.call(async () => { await sleep(1); });
    });

    await NodeTest.it('B-M-00003: Should be allowed if breaker become closed from opened', async () => {

        const breaker = new ManualBreaker();

        breaker.open();

        breaker.close();

        breaker.call(() => { return; });

        await breaker.call(async () => { await sleep(1); });
    });

    await NodeTest.it('B-M-00004: Wrap method should work as expected', async () => {

        const breaker = new ManualBreaker();

        const syncFn = breaker.wrap(() => { return 123; });
        const asyncFn = breaker.wrap(async () => { await sleep(1); return 456; });

        NodeAssert.strictEqual(syncFn(), 123);
        NodeAssert.strictEqual(await asyncFn(), 456);

        breaker.open();

        await NodeAssert.rejects(
            async () => { await asyncFn(); },
            Errors.E_BREAKER_OPENED,
        );

        NodeAssert.throws(
            () => { syncFn(); },
            Errors.E_BREAKER_OPENED,
        );
    });

    // ─── Black-Box: Failure Flow ─────────────────────────

    await NodeTest.it('B-F-00001: Should rethrow the same error thrown by calls', async () => {

        const breaker = new ManualBreaker();

        NodeAssert.throws(
            () => { breaker.call(() => { throw new Error('123'); }); },
            { message: '123' }
        );

        await NodeAssert.rejects(
            async () => { await breaker.call(async () => { throw new Error('123'); }); },
            { message: '123' }
        );
    });

    await NodeTest.it('B-F-00002: Should be blocked if breaker is opened', async () => {

        const breaker = new ManualBreaker();

        breaker.open();

        await NodeAssert.rejects(
            async () => { await breaker.call(async () => { return; }); },
            Errors.E_BREAKER_OPENED,
        );

        NodeAssert.throws(
            () => { breaker.call(() => { return; }); },
            Errors.E_BREAKER_OPENED,
        );
    });

    // ─── Black-Box: Edge Cases ───────────────────────────

    await NodeTest.it('B-E-00001: Custom error constructor should work as expected', async () => {

        class CustomError extends Error { }

        const breaker = new ManualBreaker(false, CustomError);

        await NodeAssert.rejects(
            async () => { await breaker.call(async () => { return; }); },
            CustomError
        );

        NodeAssert.throws(
            () => { breaker.call(() => { return; }); },
            CustomError
        );
    });
});
