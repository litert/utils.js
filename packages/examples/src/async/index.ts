/**
 * TypeScript example — @litert/utils-async
 *
 * Demonstrates importing from:
 *   1. The main package entry
 *   2. Individual sub-path exports
 *   3. The @litert/utils bundle namespace
 *
 * TypeScript-specific: uses `IFiberContext`, `IFiberOptions`, `IRetryOptions`,
 * `IRetryContext`, `IPromiseResolver`, and `IPromiseRejecter` to verify that
 * all public type exports are resolvable and structurally correct.
 */

// ── 1. Main entry ─────────────────────────────────────────────────────────────
import {
    AbortTimeoutController,
    BackgroundRunner,
    FiberController,
    PromiseController,
    sleep,
    withTimeout,
    withAbortSignal,
    autoRetry,
    createExponentialBackoffDelayGenerator,
    fullJitter,
    equalJitter,
    compositeRetryDelayGenerator,
    DEFAULT_BEFORE_RETRY,
    DEFAULT_BG_RUNNER_WAIT_FN,
    E_TIMEOUT,
    E_ABORTED,
    E_FIBER_EXITED,
} from '@litert/utils-async';

// ── 2. Individual sub-path exports ────────────────────────────────────────────
import { AbortTimeoutController as ATC2  } from '@litert/utils-async/class/AbortTimeoutController';
import { BackgroundRunner       as BR2   } from '@litert/utils-async/class/BackgroundRunner';
import { FiberController        as FC2   } from '@litert/utils-async/class/FiberController';
import { PromiseController      as PC2   } from '@litert/utils-async/class/PromiseController';
import { sleep             as sleep2  }   from '@litert/utils-async/functions/Sleep';
import { withTimeout       as wt2     }   from '@litert/utils-async/functions/WithTimeout';
import { withAbortSignal   as was2    }   from '@litert/utils-async/functions/WithAbortSignal';
import { autoRetry         as ar2     }   from '@litert/utils-async/functions/AutoRetry';
import {
    createExponentialBackoffDelayGenerator as cebdg2,
    fullJitter                             as fj2,
    equalJitter                            as ej2,
    compositeRetryDelayGenerator           as crdg2,
} from '@litert/utils-async/functions/AutoRetry';

// ── 3. Bundle namespace ───────────────────────────────────────────────────────
import * as AsyncNS from '@litert/utils/namespaces/Async';

// ── Type-only imports (verifies async type exports are resolvable) ─────────────
import type {
    IFiberContext,
    IFiberExecution,
    IFiberOptions,
    IRetryOptions,
    IRetryContext,
    IPromiseResolver,
    IPromiseRejecter,
    IBeforeRetryCallback,
    IRetryDelayGenerator,
    IRetryDelayJitterFunction,
    IRetryDelayOptions,
    IAsyncErrorContext,
    IBackgroundRunnerEvents,
    IBackgroundRunnerOptions,
    IWithTimeoutOptions,
    IWithAbortSignalOptions,
} from '@litert/utils-async';

(async (): Promise<void> => {

    // ── sleep ─────────────────────────────────────────────────────────────────────
    console.log('\n=== sleep ===');

    const t0: number = Date.now();
    await sleep(50);
    console.log('slept ~50ms:', Date.now() - t0 >= 48); // true

    await sleep2(10);
    await AsyncNS.sleep(10);

    // ── PromiseController ─────────────────────────────────────────────────────────
    console.log('\n=== PromiseController ===');

    {
        const ctrl = new PromiseController<number>();
        // Verify that resolve/reject are assignable to the exported function types
        const res: IPromiseResolver<number> = ctrl.resolve.bind(ctrl);
        const rej: IPromiseRejecter<Error>  = ctrl.reject.bind(ctrl);
        void rej;
        setTimeout(() => res(42), 20);
        console.log('resolved:', await ctrl.promise); // 42
    }
    {
        const ctrl2 = new PC2<string>();
        setTimeout(() => ctrl2.reject(new Error('fail')), 20);
        const result = await ctrl2.promise.catch((e: Error) => `caught: ${e.message}`);
        console.log('rejected:', result); // 'caught: fail'
    }
    {
        const ctrl3 = new AsyncNS.PromiseController();
        ctrl3.resolve('namespace ok');
        console.log('namespace:', await ctrl3.promise);
    }

    // ── AbortTimeoutController ────────────────────────────────────────────────────
    console.log('\n=== AbortTimeoutController ===');

    {
        const atc = new AbortTimeoutController(200);
        console.log('aborted before timeout:', atc.signal.aborted); // false
        atc.destroy(); // stops timer without aborting the signal
        console.log('aborted after destroy:', atc.signal.aborted);  // false
    }
    {
        const atc2 = new ATC2(5000);
        console.log('sub-path signal type:', typeof atc2.signal); // 'object'
        atc2.destroy();
    }
    {
        const atc3 = new AsyncNS.AbortTimeoutController(100);
        atc3.abort('manual');
        console.log('namespace abort:', atc3.signal.aborted); // true
        atc3.destroy();
    }

    // ── withAbortSignal ───────────────────────────────────────────────────────────
    console.log('\n=== withAbortSignal ===');

    {
        const ac = new AbortController();
        const promise = withAbortSignal(ac.signal, sleep(500));
        setTimeout(() => ac.abort(), 20);
        const abortResult = await promise.catch((e: Error) => `aborted: ${e.name}`); // string | void
        console.log('aborted:', abortResult);
    }
    {
        const result = await was2(new AbortController().signal, sleep(10));
        console.log('not aborted:', result); // undefined
    }
    {
        // IWithAbortSignalOptions<void> verifies the options type is resolvable
        let lateResult: void | undefined;
        const opts: IWithAbortSignalOptions<void> = {
            collectResult: (_err, res): void => { lateResult = res; },
        };
        const ac2 = new AbortController();
        const p = withAbortSignal(ac2.signal, sleep(50), opts);
        ac2.abort();
        await p.catch(() => undefined);
        console.log('IWithAbortSignalOptions used, lateResult:', lateResult);
    }

    // ── withTimeout ───────────────────────────────────────────────────────────────
    console.log('\n=== withTimeout ===');

    {
        const result = await withTimeout(200, sleep(10));
        console.log('completed before timeout:', result); // undefined

        const timedOut = await withTimeout(30, sleep(500)).catch((e: Error) => `timeout: ${e.message}`);
        console.log('timed out:', timedOut);
    }
    {
        const r2: number = await wt2(100, Promise.resolve(99));
        console.log('sub-path withTimeout:', r2); // 99
    }
    {
        // IWithTimeoutOptions<number> verifies the options type is resolvable
        let lateResult: number | undefined;
        const opts: IWithTimeoutOptions<number> = {
            collectResult: (_err, res): void => { lateResult = res; },
        };
        const r3: number = await withTimeout(200, Promise.resolve(42), opts);
        console.log('IWithTimeoutOptions used:', r3, 'lateResult:', lateResult); // 42, 42
    }

    // ── autoRetry ─────────────────────────────────────────────────────────────────
    console.log('\n=== autoRetry ===');

    {
        let attempt = 0;
        // IRetryOptions<string> exercises the exported generic options type
        const opts: IRetryOptions<string> = {
            maxRetries: 4,
            function: async (ctx: IRetryContext): Promise<string> => {
                attempt++;
                if (attempt < 3) throw new Error('not yet');
                console.log('context.retriedTimes:', ctx.retriedTimes);
                return 'success';
            },
            beforeRetry: async () => { /* no-op for speed */ },
        };
        const result: string = await autoRetry(opts);
        console.log('autoRetry succeeded on attempt', attempt, ':', result);
    }
    {
        let calls = 0;
        const r2 = await ar2({
            maxRetries: 3,
            function: async (): Promise<number> => { calls++; return calls * 10; },
        });
        console.log('sub-path autoRetry:', r2, '(calls:', calls, ')');
    }

    // ── BackgroundRunner ──────────────────────────────────────────────────────────
    console.log('\n=== BackgroundRunner ===');

    {
        const br = new BackgroundRunner();
        br.run(async () => { await sleep(5); });

        const br2 = new BR2();
        br2.run(async () => {});

        const br3 = new AsyncNS.BackgroundRunner();
        br3.run(async () => {});

        await sleep(20);
        console.log('BackgroundRunner runs silently');

        // IBackgroundRunnerOptions and IBackgroundRunnerEvents exercise the exported types
        const opts: IBackgroundRunnerOptions = { waitFn: DEFAULT_BG_RUNNER_WAIT_FN };
        const br4 = new BackgroundRunner(opts);
        br4.on('error', (err: IBackgroundRunnerEvents['error'][0]) => {
            console.log('bg error:', err);
        });
        br4.run(async () => { await sleep(5); });
        await sleep(20);
        console.log('BackgroundRunner with options ok');
    }

    // ── FiberController ───────────────────────────────────────────────────────────
    console.log('\n=== FiberController ===');

    {
        const log: string[] = [];
        // IFiberOptions<null> and IFiberContext<null> exercise exported type params
        // IFiberExecution<null> is the type of the main callback
        const main: IFiberExecution<null> = async (ctx: IFiberContext<null>): Promise<void> => {
            log.push('step-1');
            await ctx.sleep(); // yield — wait for resume()
            log.push('step-2');
        };
        const opts: IFiberOptions<null> = { main };
        const fiber = new FiberController<null>(opts);
        await new Promise<void>(r => setTimeout(r, 5));
        fiber.resume();
        await fiber.waitForExit();
        console.log('fiber log:', log); // ['step-1', 'step-2']
    }
    {
        const fiber2 = new FC2({
            main: async (ctx): Promise<void> => { await ctx.sleep(); },
        });
        await new Promise<void>(r => setTimeout(r, 5));
        fiber2.resume();
        await fiber2.waitForExit();
        console.log('sub-path FiberController done');
    }
    {
        const fiber3 = new AsyncNS.FiberController({
            main: async (ctx): Promise<void> => { await ctx.sleep(); },
        });
        await new Promise<void>(r => setTimeout(r, 5));
        fiber3.resume();
        await fiber3.waitForExit();
        console.log('namespace FiberController done');
    }

    // ── retry delay generators ────────────────────────────────────────────────────
    console.log('\n=== retry delay generators ===');

    {
        // IRetryDelayGenerator and IRetryDelayJitterFunction verify the exported types
        const gen: IRetryDelayGenerator        = createExponentialBackoffDelayGenerator(100, 2);
        const jit: IRetryDelayJitterFunction   = fullJitter;
        const eqj: IRetryDelayJitterFunction   = equalJitter;

        console.log('gen(0):', gen(0)); // 100
        console.log('gen(1):', gen(1)); // 200
        console.log('gen(2):', gen(2)); // 400
        console.log('fullJitter(100) in [0,100):', fullJitter(100) >= 0 && fullJitter(100) < 100);
        console.log('equalJitter(100) in [50,100):', equalJitter(100) >= 50 && equalJitter(100) < 100);
        void jit;
        void eqj;

        // IRetryDelayOptions exercises the composite-options type
        const opts: IRetryDelayOptions = {
            delayGenerator: gen,
            jitter:         fullJitter,
            maxDelay:       500,
        };
        const composite = compositeRetryDelayGenerator(opts);
        console.log('composite(0) <= 500:', composite(0) <= 500);

        const gen2 = cebdg2(50, 3);
        console.log('sub-path gen(0):', gen2(0), '| gen(1):', gen2(1)); // 50, 150
        console.log('sub-path fullJitter:', fj2(200) < 200);
        console.log('sub-path equalJitter:', ej2(200) >= 100);
        const comp2 = crdg2({ delayGenerator: gen2, jitter: fj2, maxDelay: 200 });
        console.log('sub-path composite(3) <= 200:', comp2(3) <= 200);
    }

    // ── DEFAULT_BEFORE_RETRY ──────────────────────────────────────────────────────
    console.log('\n=== DEFAULT_BEFORE_RETRY ===');

    {
        // IBeforeRetryCallback verifies the exported callback type
        const cb: IBeforeRetryCallback = DEFAULT_BEFORE_RETRY;
        // Use it in autoRetry (override the large default delay with a no-op for speed)
        let i = 0;
        await autoRetry({
            maxRetries:   2,
            function:     async () => { if (i++ < 1) throw new Error('x'); return 'ok'; },
            beforeRetry:  cb,
        });
        console.log('DEFAULT_BEFORE_RETRY used as IBeforeRetryCallback');
    }

    // ── E_TIMEOUT / E_ABORTED / E_FIBER_EXITED ────────────────────────────────────
    console.log('\n=== Async errors ===');

    {
        // IAsyncErrorContext verifies the exported error-context interface
        const ctx: IAsyncErrorContext = { unresolvedPromise: Promise.resolve() };
        void ctx;

        // E_TIMEOUT
        const timeoutErr = new E_TIMEOUT({ unresolvedPromise: Promise.resolve() });
        console.log('E_TIMEOUT.name:', timeoutErr.name);           // 'timeout'
        console.log('E_TIMEOUT instanceof Error:', timeoutErr instanceof Error); // true

        // E_ABORTED — thrown by withAbortSignal / sleep when aborted
        const abortedErr = new E_ABORTED();
        console.log('E_ABORTED.name:', abortedErr.name);          // 'aborted'
        console.log('E_ABORTED.isAbortedError:', E_ABORTED.isAbortedError(abortedErr)); // true

        // Standard AbortError is also recognised by E_ABORTED.isAbortedError
        const stdAbortErr = new Error('aborted');
        stdAbortErr.name  = 'AbortError';
        console.log('stdAbortError recognised:', E_ABORTED.isAbortedError(stdAbortErr)); // true

        // E_FIBER_EXITED
        const exitedErr = new E_FIBER_EXITED();
        console.log('E_FIBER_EXITED.name:', exitedErr.name);       // 'fiber_exited'

        // Verify each is thrown by the respective operation
        const timeoutThrown = await withTimeout(1, sleep(500)).catch(e => e);
        console.log('withTimeout throws E_TIMEOUT:', timeoutThrown instanceof E_TIMEOUT); // true

        const ac = new AbortController();
        ac.abort();
        const abortThrown = await withAbortSignal(ac.signal, sleep(500)).catch(e => e);
        console.log('withAbortSignal throws E_ABORTED:', abortThrown instanceof E_ABORTED); // true

        // E_FIBER_EXITED is thrown when resuming an already-exited fiber
        const doneFiber = new FiberController({ main: async (): Promise<void> => {} });
        await new Promise<void>(r => setTimeout(r, 10)); // wait for fiber to run and exit
        let fiberExited = false;
        try { doneFiber.resume(); } catch { fiberExited = true; }
        console.log('resume after exit throws E_FIBER_EXITED:', fiberExited); // true
    }

})().catch(console.error);
