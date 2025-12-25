import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import * as NodeTimer from 'node:timers/promises';
import { AbortTimeoutController } from './AbortTimeoutController';

NodeTest.describe('Class AbortTimeoutController', async () => {

    await NodeTest.it('The signal should be aborted after the timeout', async () => {

        const start = Date.now();
        const atc = new AbortTimeoutController(200);

        try {

            await NodeTimer.setTimeout(500, null, { signal: atc.signal });
        }
        catch {

            NodeAssert.strictEqual(atc.signal.aborted, true);
            NodeAssert.ok(Date.now() - start >= 200, 'The timeout should be at least 200ms');
            NodeAssert.ok(Date.now() - start < 300, 'The timeout should be about 200ms');
        }

        NodeAssert.strictEqual(atc.signal.reason, 'timeout', 'The reason should be "timeout"');
    });

    await NodeTest.it('The signal should be aborted if abort is called before the timeout', async () => {
        const start = Date.now();
        const atc = new AbortTimeoutController(200);
        setTimeout(() => { atc.abort('test'); }, 100);

        try {

            await NodeTimer.setTimeout(500, null, { signal: atc.signal });
        }
        catch {

            NodeAssert.strictEqual(atc.signal.aborted, true);
            NodeAssert.ok(atc.signal.reason === 'test', 'The reason should be "test"');
            NodeAssert.ok(Date.now() - start >= 100, 'The timeout should be at least 100ms');
            NodeAssert.ok(Date.now() - start < 200, 'The timeout should be about 100ms');
        }
    });

    await NodeTest.it('The destroy method should clear the timeout', async (ctx) => {

        ctx.mock?.timers.enable({ apis: ['setTimeout', 'Date'] });

        const atc1 = new AbortTimeoutController(200);

        NodeAssert.strictEqual(atc1.signal.aborted, false, 'The signal should not be aborted');

        ctx.mock?.timers.tick(500);

        NodeAssert.strictEqual(atc1.signal.aborted, true, 'The signal should be aborted after timeout');

        const atc2 = new AbortTimeoutController(200);

        NodeAssert.strictEqual(atc2.signal.aborted, false, 'The signal should not be aborted');

        atc2.destroy();

        ctx.mock?.timers.tick(500);

        NodeAssert.strictEqual(atc2.signal.aborted, false, 'The signal should not be aborted after destroy and timeout');
    });

    await NodeTest.it('Calling abort multiple times should have no effect', async () => {

        const atc = new AbortTimeoutController(500);

        atc.abort('first');
        const firstReason = atc.signal.reason;

        atc.abort('second');

        NodeAssert.strictEqual(atc.signal.aborted, true, 'The signal should be aborted');
        NodeAssert.strictEqual(firstReason, atc.signal.reason, 'The reason should be the same for multiple abort calls');
    });

    await NodeTest.it('Calling abort after timeout should have no effect', async (ctx) => {

        ctx.mock?.timers.enable({ apis: ['setTimeout', 'Date'] });

        const atc = new AbortTimeoutController(200);

        ctx.mock?.timers.tick(500);

        NodeAssert.strictEqual(atc.signal.aborted, true, 'The signal should be aborted after timeout');

        const reasonAfterTimeout = atc.signal.reason;

        atc.abort('after-timeout');

        NodeAssert.strictEqual(atc.signal.reason, reasonAfterTimeout, 'The reason should not change after timeout');
    });
});
