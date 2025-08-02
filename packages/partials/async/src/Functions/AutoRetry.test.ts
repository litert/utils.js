import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import * as NodeTimer from 'node:timers/promises';
import * as TestUtils from '@litert/utils-test';
import {
    autoRetry,
    createExponentialBackoffDelayGenerator,
    DEFAULT_BEFORE_RETRY,
    equalJitter,
    fullJitter,
} from './AutoRetry';

NodeTest.describe('Function autoRetry', async () => {

    await NodeTest.it('Should not retry if no error thrown', async () => {

        let callCount = 0;
        const maxRetries = 3;

        try {
            await autoRetry({
                'maxRetries': maxRetries,
                'function': async () => {
                    callCount++;
                },
                'beforeRetry': async (i) => {
                    NodeAssert.strictEqual(i, callCount - 1, 'Retry index should match call count - 1');
                    await NodeTimer.setImmediate();
                },
            });
        } catch {
            NodeAssert.fail('Function should not throw an error');
        }
        NodeAssert.strictEqual(callCount, 1, 'Function should be called maxRetries + 1 times');
    });

    await NodeTest.it('Should retry at most N times as specified', async () => {

        let callCount = 0;
        const maxRetries = 3;

        try {
            await autoRetry({
                'maxRetries': maxRetries,
                'function': async () => {
                    callCount++;
                    throw new Error('Test error');
                },
                'beforeRetry': async (ctx) => {
                    NodeAssert.strictEqual(ctx.retriedTimes, callCount - 1, 'Retry index should match call count - 1');
                    await NodeTimer.setImmediate();
                },
            });
        } catch (e) {
            NodeAssert.strictEqual(callCount, maxRetries + 1, 'Function should be called maxRetries + 1 times');
            NodeAssert.strictEqual((e as Error).message, 'Test error', 'Error message should match');
        }
    });

    await NodeTest.it('Should throw error if an invalid maxRetries is passed', async () => {

        for (const i of [-1, 0, 1.5, 'a', true, false, null, undefined, Infinity, NaN, {}, []]) {

            try {
                await autoRetry({
                    'maxRetries': i as any,
                    'function': async () => {},
                });
                NodeAssert.fail(`Function should throw an error for maxRetries: ${i}`);
            }
            catch (e) {
                NodeAssert.strictEqual((e as Error).message, 'The "maxRetries" option must be a positive integer.', `Error message should match for maxRetries: ${i}`);
            }
        }
    });

    await NodeTest.it('Should wait N seconds before each retry by default', async (t) => {

        t.mock.timers.enable({'apis': ['setTimeout', 'Date']});

        try {
            await TestUtils.autoTick(t, autoRetry({
            'maxRetries': 100,
            'function': async () => {
                throw new Error('Test error');
            }
        }));
            NodeAssert.fail('Function should throw an error');
        }
        catch (e) {
            NodeAssert.strictEqual((e as Error).message, 'Test error', 'Error message should match');
            NodeAssert.ok(true);
        }

    });

    await NodeTest.it('Should abort retrying if "beforeRetry" throws an error', async () => {

        const t0 = Date.now();

        try {
            await autoRetry({
                'maxRetries': 1,
                'function': async () => {
                    throw new Error('Test error');
                },
                'beforeRetry': () => { throw new Error('Before retry error'); }
            });
            NodeAssert.fail('Function should throw an error');
        }
        catch (e) {
            NodeAssert.strictEqual((e as Error).message, 'Before retry error', 'Error message should match');
            NodeAssert.ok(true);
        }

        NodeAssert.strictEqual(Math.abs((Date.now() - t0)) < 5, true, 'No sleep should be scheduled');
    });

    await NodeTest.it('AbortSignal should work insides "beforeRetry"', async () => {

        const t0 = Date.now();

        try {
            const ac = new AbortController();
            setTimeout(() => ac.abort(), 50);
            await autoRetry({
                'maxRetries': 1,
                'function': async () => {
                    throw new Error('Test error');
                },
                'signal': ac.signal,
            });
            NodeAssert.fail('Function should throw an error');
        }
        catch (e) {
            NodeAssert.strictEqual((e as Error).message, 'Test error', 'Error message should match');
            NodeAssert.ok(true);
        }

        NodeAssert.strictEqual(Math.abs((Date.now() - t0) - 50) < 10, true, 'Function should wait 50ms before throwing an error');
    });

    await NodeTest.it('DEFAULT_BEFORE_RETRY should applies exponential backoff', async (t) => {

        t.mock.timers.enable({'apis': ['setTimeout', 'Date']});

        for (let i = 0; i < 6; i++) {

            for (let c = 0; c < 10000; c++) {

                const t0 = Date.now();

                await TestUtils.autoTick(t, DEFAULT_BEFORE_RETRY({
                    'retriedTimes': i,
                    'error': null,
                }) as Promise<void>);

                NodeAssert.strictEqual(
                    Date.now() - t0 < (1000 * Math.pow(2, i)),
                    true,
                );

                NodeAssert.strictEqual(
                    Date.now() - t0 <= 30_000,
                    true,
                );
            }
        }
    });

    await NodeTest.it('AbortSignal should not work if not aborted', async (t) => {

        t.mock.timers.enable({'apis': ['setTimeout', 'Date']});

        const t0 = Date.now();

        try {
            await TestUtils.autoTick(t, (async () => {
                const ac = new AbortController();
                await autoRetry({
                    'maxRetries': 1,
                    'function': async () => {
                        throw new Error('Test error');
                    },
                    'signal': ac.signal,
                });
            })());
            NodeAssert.fail('Function should throw an error');
        }
        catch (e) {
            NodeAssert.strictEqual((e as Error).message, 'Test error', 'Error message should match');
            NodeAssert.ok(true);
        }

        NodeAssert.strictEqual(Date.now() - t0 < 1000, true, 'Function should wait no more than 1000ms before throwing an error');
    });

    await NodeTest.it('AbortSignal should work before "beforeRetry" if aborted insides main function', async () => {

        const t0 = Date.now();
        let t1: number = 0;

        try {
            const ac = new AbortController();
            setTimeout(() => ac.abort(new Error('test')), 50);
            try {
                await autoRetry({
                    'maxRetries': 1,
                    'function': async (ctx) => {
                        await NodeTimer.setTimeout(1000, null, { signal: ctx.signal });
                        throw new Error('Test error');
                    },
                    'signal': ac.signal,
                });
            }
            catch (e) {
                t1 = Date.now();
                throw e;
            }
            NodeAssert.fail('Function should throw an error');
        }
        catch (e) {
            NodeAssert.strictEqual((e as Error).message, 'The operation was aborted', 'Error message should match');
            NodeAssert.ok(true);
        }

        NodeAssert.strictEqual(Math.abs((t1 - t0) - 50) < 10, true, 'Function should wait about 50ms before throwing an error');
    });

    await NodeTest.it('AbortSignal should work even if "beforeRetry" not caring signals', async () => {

        const t0 = Date.now();
        let t1: number = 0;

        try {
            const ac = new AbortController();
            setTimeout(() => ac.abort(new Error('test')), 50);
            try {
                await autoRetry({
                    'maxRetries': 100,
                    'function': async () => {
                        throw new Error('Test error');
                    },
                    'signal': ac.signal,
                    'beforeRetry': async () => { await NodeTimer.setTimeout(50); } // Not caring about signal
                });
            }
            catch (e) {
                t1 = Date.now();
                throw e;
            }
            NodeAssert.fail('Function should throw an error');
        }
        catch (e) {
            NodeAssert.strictEqual((e as Error).message, 'Test error', 'Error message should match');
            NodeAssert.ok(true);
        }

        NodeAssert.strictEqual(Math.abs((t1 - t0) - 50) < 10, true, 'Function should wait about 50ms before throwing an error');
    });

    await NodeTest.it('The created delay generators should throw error with invalid arguments', async () => {

        const gen = createExponentialBackoffDelayGenerator();
        for (const i of [-1, 1.1, NaN, Infinity, -Infinity, true] as unknown[] as number[]) {

            NodeAssert.throws(() => gen(i));
        }
    });

    await NodeTest.it('The fullJitter should always return [0, delay)', async () => {

        const MAX_DELAY = 1000000;
        for (let i = 0; i < 1000000; i++) {
            const v = fullJitter(MAX_DELAY);
            NodeAssert.ok(v >= 0 && v < MAX_DELAY, `Value ${v} should be in the range [0, ${MAX_DELAY})`);
        }
    });

    await NodeTest.it('The equalJitter should always return [delay / 2, delay)', async () => {

        const MAX_DELAY = 1000000;
        const HALF_MAX_DELAY = MAX_DELAY / 2;
        for (let i = 0; i < 1000000; i++) {
            const v = equalJitter(MAX_DELAY);
            NodeAssert.ok(v >= HALF_MAX_DELAY && v < MAX_DELAY, `Value ${v} should be in the range [${HALF_MAX_DELAY}, ${MAX_DELAY})`);
        }
    });
});
