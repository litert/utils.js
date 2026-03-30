/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import * as TestUtils from '@litert/utils-test';
import { sleep } from './Sleep.js';
import {
    autoRetry,
    compositeRetryDelayGenerator,
    createExponentialBackoffDelayGenerator,
    DEFAULT_BEFORE_RETRY,
    equalJitter,
    fullJitter,
} from './AutoRetry.js';
import { E_ABORTED } from '../Errors.js';

NodeTest.describe('Module Async - Function AutoRetry', async () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    await NodeTest.it('B-M-00001: Should call function once and not call beforeRetry when it succeeds on the first call', async () => {

        let callCount = 0;
        let beforeRetryCallCount = 0;

        const result = await autoRetry({
            'maxRetries': 3,
            'function': () => {
                callCount++;
                return 'success';
            },
            'beforeRetry': () => { beforeRetryCallCount++; },
        });

        NodeAssert.strictEqual(result, 'success', 'Should return the function result');
        NodeAssert.strictEqual(callCount, 1, 'Function should be called exactly once');
        NodeAssert.strictEqual(beforeRetryCallCount, 0, 'beforeRetry should never be called on first-call success');
    });

    await NodeTest.it('B-M-00002: Should retry and eventually succeed when function fails then recovers', async () => {

        let callCount = 0;
        const FAIL_TIMES = 2;

        const result = await autoRetry({
            'maxRetries': 5,
            'function': () => {
                callCount++;
                if (callCount <= FAIL_TIMES) {
                    throw new Error('Not yet');
                }
                return 'done';
            },
            'beforeRetry': async () => { await sleep(0); },
        });

        NodeAssert.strictEqual(result, 'done', 'Should return result once the function succeeds');
        NodeAssert.strictEqual(callCount, FAIL_TIMES + 1, 'Should stop retrying after the function succeeds');
    });

    await NodeTest.it('B-M-00003: Should pass retriedTimes=0 and error=null to function context on the first call', async () => {

        let capturedRetriedTimes: number = -1;
        let capturedError: unknown = 'sentinel';

        await autoRetry({
            'maxRetries': 1,
            'function': (ctx) => {
                capturedRetriedTimes = ctx.retriedTimes;
                capturedError = ctx.error;
                return 'ok';
            },
        });

        NodeAssert.strictEqual(capturedRetriedTimes, 0, 'retriedTimes should be 0 on the first call');
        NodeAssert.strictEqual(capturedError, null, 'error should be null on the first call');
    });

    await NodeTest.it('B-M-00004: Should increment retriedTimes and carry the last error in function context on each retry', async () => {

        const callContexts: Array<{ retriedTimes: number; error: unknown }> = [];
        const MAX_RETRIES = 2;
        const thrownErrors = [new Error('err 1'), new Error('err 2'), new Error('err 3')];
        let i = 0;

        await NodeAssert.rejects(
            autoRetry({
                'maxRetries': MAX_RETRIES,
                'function': (ctx) => {
                    callContexts.push({ retriedTimes: ctx.retriedTimes, error: ctx.error });
                    throw thrownErrors[i++];
                },
                'beforeRetry': async () => { await sleep(0); },
            }),
        );

        NodeAssert.strictEqual(callContexts.length, MAX_RETRIES + 1);
        NodeAssert.strictEqual(callContexts[0].retriedTimes, 0, 'First call: retriedTimes=0');
        NodeAssert.strictEqual(callContexts[0].error, null, 'First call: error=null');
        NodeAssert.strictEqual(callContexts[1].retriedTimes, 1, 'Second call: retriedTimes=1');
        NodeAssert.strictEqual(callContexts[1].error, thrownErrors[0], 'Second call: error is the first thrown error');
        NodeAssert.strictEqual(callContexts[2].retriedTimes, 2, 'Third call: retriedTimes=2');
        NodeAssert.strictEqual(callContexts[2].error, thrownErrors[1], 'Third call: error is the second thrown error');
    });

    await NodeTest.it('B-M-00005: Should pass correct retriedTimes and error to beforeRetry context on each retry', async () => {

        let callCount = 0;
        const beforeRetryContexts: Array<{ retriedTimes: number; error: unknown }> = [];
        const MAX_RETRIES = 2;

        await NodeAssert.rejects(
            autoRetry({
                'maxRetries': MAX_RETRIES,
                'function': async () => {
                    throw new Error(`Error ${++callCount}`);
                },
                'beforeRetry': async (ctx) => {
                    beforeRetryContexts.push({ retriedTimes: ctx.retriedTimes, error: ctx.error });
                    await sleep(0);
                },
            }),
        );

        NodeAssert.strictEqual(beforeRetryContexts.length, MAX_RETRIES, 'beforeRetry called exactly maxRetries times');
        NodeAssert.strictEqual(beforeRetryContexts[0].retriedTimes, 0, 'First retry: retriedTimes=0');
        NodeAssert.strictEqual((beforeRetryContexts[0].error as Error).message, 'Error 1', 'First retry: error=Error 1');
        NodeAssert.strictEqual(beforeRetryContexts[1].retriedTimes, 1, 'Second retry: retriedTimes=1');
        NodeAssert.strictEqual((beforeRetryContexts[1].error as Error).message, 'Error 2', 'Second retry: error=Error 2');
    });

    await NodeTest.it('B-M-00006: Should forward the AbortSignal to the function context', async () => {

        const ac = new AbortController();
        let receivedSignal: AbortSignal | undefined;

        await autoRetry({
            'maxRetries': 1,
            'function': (ctx) => {
                receivedSignal = ctx.signal;
                return 'ok';
            },
            'signal': ac.signal,
        });

        NodeAssert.strictEqual(receivedSignal, ac.signal, 'Signal should be forwarded to function context');
    });

    await NodeTest.it('B-M-00007: Should support a synchronous (non-async) function', async () => {

        const result = await autoRetry({
            'maxRetries': 3,
            'function': () => 42,
        });

        NodeAssert.strictEqual(result, 42, 'Should return the synchronous function result');
    });

    await NodeTest.it('B-M-00008: Should support a synchronous (non-async) beforeRetry', async () => {

        let beforeRetryCount = 0;
        const MAX_RETRIES = 2;

        await NodeAssert.rejects(
            autoRetry({
                'maxRetries': MAX_RETRIES,
                'function': async () => { throw new Error('fail'); },
                'beforeRetry': () => { beforeRetryCount++; },
            }),
            () => {
                NodeAssert.strictEqual(beforeRetryCount, MAX_RETRIES, 'Sync beforeRetry should be called maxRetries times');
                return true;
            }
        );
    });

    await NodeTest.it('B-M-00009: Should use DEFAULT_BEFORE_RETRY (exponential backoff) when beforeRetry is not specified', async (t) => {

        t.mock.timers.enable({ 'apis': ['setTimeout', 'Date'] });

        await NodeAssert.rejects(
            TestUtils.autoTickMs(t, autoRetry({
                'maxRetries': 5,
                'function': async () => { throw new Error('Test error'); },
            }), { tickMs: 1000 }),
            (e) => {
                NodeAssert.strictEqual((e as Error).message, 'Test error', 'Should rethrow the last function error');
                return true;
            }
        );
    });

    await NodeTest.it('B-M-00010: Should complete all retries normally when an AbortSignal is provided but never aborted', async (t) => {

        t.mock.timers.enable({ 'apis': ['setTimeout', 'Date'] });

        const ac = new AbortController();
        const MAX_RETRIES = 2;

        await NodeAssert.rejects(
            TestUtils.autoTickMs(t, autoRetry({
                'maxRetries': MAX_RETRIES,
                'function': async () => { throw new Error('Test error'); },
                'beforeRetry': () => sleep(1000),
                'signal': ac.signal,
            }), { tickMs: 1 }),
            (e) => {
                NodeAssert.strictEqual((e as Error).message, 'Test error', 'Should rethrow the last function error');
                return true;
            }
        );
    });

    await NodeTest.it('B-M-00011: DEFAULT_BEFORE_RETRY should apply exponential backoff with full jitter, capped at 30s', async (t) => {

        t.mock.timers.enable({ 'apis': ['setTimeout', 'Date'] });

        for (let i = 0; i < 6; i++) {

            for (let c = 0; c < 1000; c++) {

                const t0 = Date.now();

                await TestUtils.autoTick(t, DEFAULT_BEFORE_RETRY({
                    'retriedTimes': i,
                    'error': null,
                }) as Promise<void>);

                const elapsed = Date.now() - t0;
                NodeAssert.ok(elapsed >= 0, `Attempt ${i}: delay should be >= 0`);
                NodeAssert.ok(elapsed <= 1000 * Math.pow(2, i), `Attempt ${i}: delay should be <= ${1000 * Math.pow(2, i)}`);
                NodeAssert.ok(elapsed <= 30_000, `Attempt ${i}: delay should never exceed the 30s cap`);
            }
        }
    });

    await NodeTest.it('B-M-00012: createExponentialBackoffDelayGenerator should produce correct exponential delays', () => {

        const gen = createExponentialBackoffDelayGenerator(100, 2);

        NodeAssert.strictEqual(gen(0), 100, 'Attempt 0: 100 * 2^0 = 100');
        NodeAssert.strictEqual(gen(1), 200, 'Attempt 1: 100 * 2^1 = 200');
        NodeAssert.strictEqual(gen(2), 400, 'Attempt 2: 100 * 2^2 = 400');
        NodeAssert.strictEqual(gen(3), 800, 'Attempt 3: 100 * 2^3 = 800');
    });

    await NodeTest.it('B-M-00013: createExponentialBackoffDelayGenerator should use 1000ms base and factor 2 as defaults', () => {

        const gen = createExponentialBackoffDelayGenerator();

        NodeAssert.strictEqual(gen(0), 1000, 'Default: attempt 0 = 1000');
        NodeAssert.strictEqual(gen(1), 2000, 'Default: attempt 1 = 2000');
        NodeAssert.strictEqual(gen(2), 4000, 'Default: attempt 2 = 4000');
    });

    await NodeTest.it('B-M-00014: fullJitter should always return a value in [0, delay)', () => {

        const MAX_DELAY = 1_000_000;
        for (let i = 0; i < 100_000; i++) {
            const v = fullJitter(MAX_DELAY);
            NodeAssert.ok(v >= 0 && v < MAX_DELAY, `fullJitter(${MAX_DELAY}) = ${v} should be in [0, ${MAX_DELAY})`);
        }
    });

    await NodeTest.it('B-M-00015: equalJitter should always return a value in [delay / 2, delay)', () => {

        const MAX_DELAY = 1_000_000;
        const HALF_DELAY = MAX_DELAY / 2;
        for (let i = 0; i < 100_000; i++) {
            const v = equalJitter(MAX_DELAY);
            NodeAssert.ok(v >= HALF_DELAY && v < MAX_DELAY, `equalJitter(${MAX_DELAY}) = ${v} should be in [${HALF_DELAY}, ${MAX_DELAY})`);
        }
    });

    await NodeTest.it('B-M-00016: compositeRetryDelayGenerator should cap delay at maxDelay', () => {

        const MAX_DELAY = 500;
        const gen = compositeRetryDelayGenerator({
            'delayGenerator': createExponentialBackoffDelayGenerator(1000, 2),
            'jitter': (d) => d, // identity — no jitter, for observable cap
            'maxDelay': MAX_DELAY,
        });

        for (let i = 0; i < 10; i++) {
            const delay = gen(i);
            NodeAssert.ok(delay <= MAX_DELAY, `Attempt ${i}: delay (${delay}ms) should be <= maxDelay (${MAX_DELAY}ms)`);
        }
    });

    await NodeTest.it('B-M-00017: compositeRetryDelayGenerator should apply the jitter function', () => {

        const MAX_DELAY = 30_000;
        const BASE = 1000;
        const FACTOR = 2;
        const gen = compositeRetryDelayGenerator({
            'delayGenerator': createExponentialBackoffDelayGenerator(BASE, FACTOR),
            'jitter': fullJitter,
            'maxDelay': MAX_DELAY,
        });

        for (let attempt = 0; attempt < 5; attempt++) {
            const maxPossible = Math.min(MAX_DELAY, BASE * Math.pow(FACTOR, attempt));
            for (let i = 0; i < 1000; i++) {
                const delay = gen(attempt);
                NodeAssert.ok(delay >= 0 && delay < maxPossible, `Attempt ${attempt}: delay (${delay}) should be in [0, ${maxPossible})`);
            }
        }
    });

    // ─── Black-Box: Failure Flow ─────────────────────────

    await NodeTest.it('B-F-00001: Should retry up to maxRetries times and rethrow the last error when all attempts fail', async () => {

        let callCount = 0;
        const MAX_RETRIES = 3;
        const error = new Error('Test error');

        await NodeAssert.rejects(
            autoRetry({
                'maxRetries': MAX_RETRIES,
                'function': async () => {
                    callCount++;
                    throw error;
                },
                'beforeRetry': async () => { await sleep(0); },
            }),
            (e) => {
                NodeAssert.strictEqual(e, error, 'Should rethrow the exact last error');
                NodeAssert.strictEqual(callCount, MAX_RETRIES + 1, 'Function should be called maxRetries + 1 times total');
                return true;
            }
        );
    });

    await NodeTest.it('B-F-00002: Should throw TypeError with a descriptive message for each invalid maxRetries value', async () => {

        const INVALID_VALUES = [-1, 0, 1.5, 'a', true, false, null, undefined, Infinity, NaN, {}, []];

        for (const v of INVALID_VALUES) {
            await NodeAssert.rejects(
                autoRetry({ 'maxRetries': v as number, 'function': async () => {} }),
                (e) => {
                    NodeAssert.ok(e instanceof TypeError, `Should throw TypeError for maxRetries=${String(v)}`);
                    NodeAssert.strictEqual(
                        (e as TypeError).message,
                        'The "maxRetries" option must be a positive integer.',
                        `Wrong error message for maxRetries=${String(v)}`
                    );
                    return true;
                }
            );
        }
    });

    await NodeTest.it('B-F-00003: Should stop retrying and propagate the error thrown by beforeRetry', async () => {

        const mainError = new Error('Main error');
        const beforeRetryError = new TypeError('beforeRetry failed');
        const t0 = Date.now();

        await NodeAssert.rejects(
            autoRetry({
                'maxRetries': 5,
                'function': async () => { throw mainError; },
                'beforeRetry': () => { throw beforeRetryError; },
            }),
            (e) => {
                NodeAssert.strictEqual(e, beforeRetryError, 'Should propagate the beforeRetry error, not the main error');
                return true;
            }
        );

        NodeAssert.ok(Date.now() - t0 < 50, 'Should stop immediately without sleeping');
    });

    await NodeTest.it('B-F-00004: Should rethrow E_ABORTED from the main function immediately without retrying', async () => {

        let callCount = 0;
        const abortedError = new E_ABORTED();

        await NodeAssert.rejects(
            autoRetry({
                'maxRetries': 5,
                'function': async () => {
                    callCount++;
                    throw abortedError;
                },
                'beforeRetry': async () => { await sleep(0); },
            }),
            (e) => {
                NodeAssert.strictEqual(e, abortedError, 'Should rethrow the exact E_ABORTED instance');
                NodeAssert.strictEqual(callCount, 1, 'Function should only be called once when it throws E_ABORTED');
                return true;
            }
        );
    });

    await NodeTest.it('B-F-00005: Should rethrow a standard AbortError (name === "AbortError") from function immediately without retrying', async () => {

        let callCount = 0;
        const abortError = Object.assign(new Error('Aborted'), { name: 'AbortError' });

        await NodeAssert.rejects(
            autoRetry({
                'maxRetries': 5,
                'function': async () => {
                    callCount++;
                    throw abortError;
                },
                'beforeRetry': async () => { await sleep(0); },
            }),
            (e) => {
                NodeAssert.strictEqual(e, abortError, 'Should rethrow the standard AbortError');
                NodeAssert.strictEqual(callCount, 1, 'Function should only be called once');
                return true;
            }
        );
    });

    await NodeTest.it('B-F-00006: Should throw E_ABORTED wrapping the function error when signal is already aborted after function throws', async () => {

        const mainError = new Error('Main error');
        const ac = new AbortController();
        ac.abort();

        await NodeAssert.rejects(
            autoRetry({
                'maxRetries': 3,
                'function': async () => { throw mainError; },
                'signal': ac.signal,
                'beforeRetry': async () => { NodeAssert.fail('beforeRetry must not be called when signal is already aborted'); },
            }),
            (e) => {
                NodeAssert.ok(e instanceof E_ABORTED, 'Should throw E_ABORTED when signal is already aborted');
                NodeAssert.strictEqual((e as E_ABORTED).message, 'Operation aborted.');
                return true;
            }
        );
    });

    await NodeTest.it('B-F-00007: Should rethrow E_ABORTED immediately when signal aborts during function execution', async (ctx) => {

        ctx.mock.timers.enable({ 'apis': ['setTimeout', 'Date'] });

        const ac = new AbortController();
        const ABORT_DELAY_MS = 50;
        const t0 = Date.now();
        let t1 = 0;

        setTimeout(() => ac.abort(), ABORT_DELAY_MS);

        await NodeAssert.rejects(
            TestUtils.autoTickMs(ctx, autoRetry({
                'maxRetries': 5,
                'function': async (fnCtx) => {
                    await sleep(1000, fnCtx.signal);
                    throw new Error('Should not reach here');
                },
                'signal': ac.signal,
            }), { tickMs: 1 }),
            (e) => {
                t1 = Date.now();
                NodeAssert.ok(e instanceof E_ABORTED, 'Should throw E_ABORTED');
                NodeAssert.strictEqual((e as E_ABORTED).message, 'Operation aborted.');
                return true;
            }
        );

        NodeAssert.strictEqual(Math.abs((t1 - t0) - ABORT_DELAY_MS) <= 1, true, `Should abort at approximately ${ABORT_DELAY_MS}ms`);
    });

    await NodeTest.it('B-F-00008: Should propagate E_ABORTED when signal aborts during a signal-aware beforeRetry sleep', async (ctx) => {

        ctx.mock.timers.enable({ 'apis': ['setTimeout', 'Date'] });

        const ac = new AbortController();
        const ABORT_DELAY_MS = 50;

        setTimeout(() => ac.abort(), ABORT_DELAY_MS);

        await NodeAssert.rejects(
            TestUtils.autoTickMs(ctx, autoRetry({
                'maxRetries': 5,
                'function': async () => { throw new Error('Main error'); },
                'signal': ac.signal,
                'beforeRetry': async (retryCtx) => {
                    await sleep(1000, retryCtx.signal);
                },
            }), { tickMs: 1 }),
            (e) => {
                NodeAssert.ok(e instanceof E_ABORTED, 'Should propagate E_ABORTED from signal-aware beforeRetry');
                NodeAssert.strictEqual((e as E_ABORTED).message, 'Operation aborted.');
                return true;
            }
        );
    });

    await NodeTest.it('B-F-00009: Should throw E_ABORTED on the next iteration when beforeRetry ignores the signal and the signal was aborted', async (ctx) => {

        ctx.mock.timers.enable({ 'apis': ['setTimeout', 'Date'] });

        const ac = new AbortController();
        const ABORT_DELAY_MS = 50;
        const BEFORE_RETRY_SLEEP_MS = 100;

        setTimeout(() => ac.abort(), ABORT_DELAY_MS);

        await NodeAssert.rejects(
            TestUtils.autoTickMs(ctx, autoRetry({
                'maxRetries': 100,
                'function': async () => { throw new Error('Main error'); },
                'signal': ac.signal,
                'beforeRetry': async () => {
                    await sleep(BEFORE_RETRY_SLEEP_MS); // does NOT pass signal
                },
            }), { tickMs: 1 }),
            (e) => {
                NodeAssert.ok(e instanceof E_ABORTED, 'Should throw E_ABORTED after beforeRetry completes with aborted signal');
                NodeAssert.strictEqual((e as E_ABORTED).message, 'Operation aborted.');
                return true;
            }
        );
    });

    await NodeTest.it('B-F-00010: DEFAULT_BEFORE_RETRY should be abortable via signal', async (ctx) => {

        ctx.mock.timers.enable({ 'apis': ['setTimeout', 'Date'] });

        const ac = new AbortController();
        const ABORT_DELAY_MS = 50;

        setTimeout(() => ac.abort(), ABORT_DELAY_MS);

        await NodeAssert.rejects(
            TestUtils.autoTickMs(ctx, DEFAULT_BEFORE_RETRY({
                'retriedTimes': 5, // very long delay without abort
                'error': null,
                'signal': ac.signal,
            }) as Promise<void>, { tickMs: 1 }),
            (e) => {
                NodeAssert.ok(e instanceof E_ABORTED, 'Should throw E_ABORTED when signal aborts during DEFAULT_BEFORE_RETRY');
                return true;
            }
        );
    });

    await NodeTest.it('B-F-00011: createExponentialBackoffDelayGenerator should throw RangeError for invalid attempt values', () => {

        const gen = createExponentialBackoffDelayGenerator();

        for (const v of [-1, 1.1, NaN, Infinity, -Infinity, true] as unknown[] as number[]) {
            NodeAssert.throws(
                () => gen(v),
                RangeError,
                `Should throw RangeError for attempt=${String(v)}`
            );
        }
    });
});
