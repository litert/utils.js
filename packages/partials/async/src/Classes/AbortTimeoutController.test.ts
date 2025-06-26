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
});
