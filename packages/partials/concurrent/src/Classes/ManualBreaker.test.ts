import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import * as NodeTimer from 'node:timers/promises';
import { ManualBreaker } from './ManualBreaker';
import { E_BREAKER_OPENED } from '../Types';

NodeTest.describe('Class ManualBreaker', async () => {

    NodeTest.it('breaker should be closed by default', () => {

        NodeAssert.strictEqual(new ManualBreaker().isClosed(), true);
        NodeAssert.strictEqual(new ManualBreaker().isOpened(), false);

        NodeAssert.strictEqual(new ManualBreaker(true).isClosed(), true);
        NodeAssert.strictEqual(new ManualBreaker(true).isOpened(), false);

        NodeAssert.strictEqual(new ManualBreaker(false).isClosed(), false);
        NodeAssert.strictEqual(new ManualBreaker(false).isOpened(), true);
    });

    await NodeTest.it('should allow calls if breaker is closed', async () => {

        const breaker = new ManualBreaker();

        breaker.call(() => { return; });
        await breaker.call(async () => { await NodeTimer.setTimeout(1); });
    });

    await NodeTest.it('should rethrow the same error thrown by calls', async () => {

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

    await NodeTest.it('should be blocked if breaker is opened', async () => {

        const breaker = new ManualBreaker();

        breaker.open();

        await NodeAssert.rejects(
            async () => { await breaker.call(async () => { return; }); },
            E_BREAKER_OPENED
        );

        NodeAssert.throws(
            () => { breaker.call(() => { return; }); },
            E_BREAKER_OPENED
        );
    });

    await NodeTest.it('should be allowed if breaker become closed from opened', async () => {

        const breaker = new ManualBreaker();

        breaker.open();

        breaker.close();

        breaker.call(() => { return; });

        await breaker.call(async () => { await NodeTimer.setTimeout(1); });
    });

    await NodeTest.it('wrap method should work as expected', async () => {

        const breaker = new ManualBreaker();

        const syncFn = breaker.wrap(() => { return 123; });
        const asyncFn = breaker.wrap(async () => { await NodeTimer.setTimeout(1); return 456; });

        NodeAssert.strictEqual(syncFn(), 123);
        NodeAssert.strictEqual(await asyncFn(), 456);

        breaker.open();

        await NodeAssert.rejects(
            async () => { await asyncFn(); },
            E_BREAKER_OPENED
        );

        NodeAssert.throws(
            () => { syncFn(); },
            E_BREAKER_OPENED
        );
    });

    await NodeTest.it('custom error constructor should work as expected', async () => {

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
