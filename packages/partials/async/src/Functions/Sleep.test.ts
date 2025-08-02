import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import * as NodeTimer from 'node:timers/promises';
import * as TestUtils from '@litert/utils-test';
import { sleep } from './Sleep';
import { AbortedError } from '../Errors';

NodeTest.describe('Function sleep', async () => {

    await NodeTest.it('Should wait exactly for the specific duration', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'] });

        const t0 = Date.now();

        await TestUtils.autoTick(ctx, sleep(100));

        NodeAssert.strictEqual(Date.now() - t0, 100);

        await TestUtils.autoTick(ctx, sleep(10000));

        NodeAssert.strictEqual(Date.now() - t0, 10100);
    });

    await NodeTest.it('Should wait safely even if the duration exceeds 0x7FFFFFFF', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'] });

        const t0 = Date.now();

        await TestUtils.autoTick(ctx, sleep(0x8000_0000));

        const t1 = Date.now();

        NodeAssert.strictEqual(t1 - t0, 0x8000_0000);

        await TestUtils.autoTick(ctx, sleep(0x9000_0000));

        const t2 = Date.now();

        NodeAssert.strictEqual(t2 - t1, 0x9000_0000);
    });

    await NodeTest.it('Should throw AbortedError if signal passed in and aborted', async () => {

        const t0 = Date.now();

        const ac = new AbortController();

        // use counters to ensure the function is called.

        let exec = 0, errors = 0;

        await Promise.all([
            (async () => {

                try {

                    exec++;
                    await sleep(10000, ac.signal);
                }
                catch (e) {

                    errors++;
                    NodeAssert.strictEqual(e instanceof AbortedError, true);
                }

                // Considering the accuracy of timers, we allow a 10ms margin.
                NodeAssert.strictEqual(Math.abs(Date.now() - t0 - 100) < 10, true);
            })(),
            (async () => {
                // Abort the signal after 100ms
                await NodeTimer.setTimeout(100);
                ac.abort();
            })()
        ]);

        NodeAssert.strictEqual(exec, 1, 'Function should be called once');
        NodeAssert.strictEqual(errors, 1, 'Error should be thrown once');
    });

    NodeTest.it('Should throw TypeError if delayMs is not a non-negative integer', async () => {

        await NodeAssert.rejects(
            () => sleep(-1),
            { name: 'TypeError', message: 'The delayMs must be a non-negative integer.' }
        );

        await NodeAssert.rejects(
            () => sleep(0.5),
            { name: 'TypeError', message: 'The delayMs must be a non-negative integer.' }
        );

        await NodeAssert.rejects(
            () => sleep(NaN),
            { name: 'TypeError', message: 'The delayMs must be a non-negative integer.' }
        );

        await NodeAssert.rejects(
            () => sleep(Infinity),
            { name: 'TypeError', message: 'The delayMs must be a non-negative integer.' }
        );
    });
});
