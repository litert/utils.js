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

// ── 3. Bundle namespace ───────────────────────────────────────────────────────
import * as AsyncNS from '@litert/utils/namespaces/Async';

// ── Type-only imports (verifies async type exports are resolvable) ─────────────
import type {
    IFiberContext,
    IFiberOptions,
    IRetryOptions,
    IRetryContext,
    IPromiseResolver,
    IPromiseRejecter,
} from '@litert/utils-async';

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
}

// ── FiberController ───────────────────────────────────────────────────────────
console.log('\n=== FiberController ===');

{
    const log: string[] = [];
    // IFiberOptions<null> and IFiberContext<null> exercise exported type params
    const opts: IFiberOptions<null> = {
        main: async (ctx: IFiberContext<null>): Promise<void> => {
            log.push('step-1');
            await ctx.sleep(); // yield — wait for resume()
            log.push('step-2');
        },
    };
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
