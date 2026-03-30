/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { sleep } from '../Functions/Sleep.js';
import { AbortTimeoutController } from './AbortTimeoutController.js';
import { autoTickMs } from '@litert/utils-test';

NodeTest.describe('Module Async - Class AbortTimeoutController', async () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    await NodeTest.it('B-M-00001: The signal should be aborted after the timeout', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });

        const start = Date.now();
        const atc = new AbortTimeoutController(200);

        await NodeAssert.rejects(
            autoTickMs(ctx, sleep(500, atc.signal)),
            () => {
                NodeAssert.strictEqual(atc.signal.aborted, true);
                NodeAssert.strictEqual(Date.now() - start, 200, 'The timeout should fire at exactly 200ms');
                return true;
            }
        );

        NodeAssert.strictEqual(atc.signal.reason, 'timeout', 'The reason should be "timeout"');
    });

    await NodeTest.it('B-M-00002: The signal should be aborted if abort is called before the timeout', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });

        const start = Date.now();
        const atc = new AbortTimeoutController(200);
        setTimeout(() => { atc.abort('test'); }, 100);

        await NodeAssert.rejects(
            autoTickMs(ctx, sleep(500, atc.signal)),
            () => {
                NodeAssert.strictEqual(atc.signal.aborted, true);
                NodeAssert.strictEqual(atc.signal.reason, 'test', 'The reason should be "test"');
                NodeAssert.strictEqual(Date.now() - start, 100, 'The abort should fire at exactly 100ms');
                return true;
            }
        );
    });

    await NodeTest.it('B-M-00003: The destroy method should clear the timeout', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });

        const atc1 = new AbortTimeoutController(200);

        NodeAssert.strictEqual(atc1.signal.aborted, false, 'The signal should not be aborted');

        ctx.mock.timers.tick(500);

        NodeAssert.strictEqual(atc1.signal.aborted, true, 'The signal should be aborted after timeout');

        const atc2 = new AbortTimeoutController(200);

        NodeAssert.strictEqual(atc2.signal.aborted, false, 'The signal should not be aborted');

        atc2.destroy();

        ctx.mock.timers.tick(500);

        NodeAssert.strictEqual(atc2.signal.aborted, false, 'The signal should not be aborted after destroy and timeout');
    });

    // ─── Black-Box: Edge Cases ───────────────────────────

    await NodeTest.it('B-E-00001: Calling abort multiple times should have no effect', async () => {

        const atc = new AbortTimeoutController(500);

        atc.abort('first');
        const firstReason = atc.signal.reason;

        atc.abort('second');

        NodeAssert.strictEqual(atc.signal.aborted, true, 'The signal should be aborted');
        NodeAssert.strictEqual(firstReason, atc.signal.reason, 'The reason should be the same for multiple abort calls');
    });

    await NodeTest.it('B-E-00002: Calling abort after timeout should have no effect', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });

        const atc = new AbortTimeoutController(200);

        ctx.mock.timers.tick(500);

        NodeAssert.strictEqual(atc.signal.aborted, true, 'The signal should be aborted after timeout');

        const reasonAfterTimeout = atc.signal.reason;

        atc.abort('after-timeout');

        NodeAssert.strictEqual(atc.signal.reason, reasonAfterTimeout, 'The reason should not change after timeout');
    });

    await NodeTest.it('B-E-00003: Calling abort after destroy should have no effect', (ctx) => {

        ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });

        const atc = new AbortTimeoutController(200);

        atc.destroy();
        NodeAssert.strictEqual(atc.signal.aborted, false, 'Signal should not be aborted after destroy');

        atc.abort('after-destroy');
        NodeAssert.strictEqual(atc.signal.aborted, false, 'abort() after destroy() must be a no-op');
    });

    await NodeTest.it('B-E-00004: Calling destroy multiple times is idempotent', (ctx) => {

        ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });

        const atc = new AbortTimeoutController(200);

        atc.destroy();
        atc.destroy(); // second call must not throw
        NodeAssert.strictEqual(atc.signal.aborted, false, 'Signal should remain non-aborted after double destroy');

        ctx.mock.timers.tick(500);
        NodeAssert.strictEqual(atc.signal.aborted, false, 'Timer should have been cleared by first destroy');
    });
});
