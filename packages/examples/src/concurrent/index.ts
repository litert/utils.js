/**
 * TypeScript example — @litert/concurrent
 *
 * Demonstrates importing from:
 *   1. The main package entry
 *   2. Individual sub-path exports
 *   3. The @litert/utils bundle namespace
 *
 * TypeScript-specific: assigns class instances to `IBreaker`, `ISyncRateLimiter`,
 * and `ICounter` interface types to verify structural compatibility.
 */

// ── 1. Main entry ─────────────────────────────────────────────────────────────
import {
    BatchBuffer,
    CircuitBreaker,
    CountingRateLimiter,
    DebounceController,
    FiberPool,
    LeakyBucketRateLimiter,
    LeakyBucketRateLimiterManager,
    ManualBreaker,
    MemoryMutex,
    SlideWindowCounter,
    ThrottleController,
    TokenBucketRateLimiter,
    TokenBucketRateLimiterManager,
    DEFAULT_MIN_IDLE_FIBERS,
    DEFAULT_MAX_IDLE_FIBERS,
    DEFAULT_IDLE_TIMEOUT,
    DEFAULT_WAIT_TIMEOUT,
    DEFAULT_MAX_WAITS,
    E_LOCK_FAILED,
} from '@litert/concurrent';

// ── 2. Individual sub-path exports ────────────────────────────────────────────
import { BatchBuffer                 as BB2    } from '@litert/concurrent/class/BatchBuffer';
import { CircuitBreaker              as CB2    } from '@litert/concurrent/class/CircuitBreaker';
import { CountingRateLimiter         as CRL2   } from '@litert/concurrent/class/CountingRateLimiter';
import { DebounceController          as DC2    } from '@litert/concurrent/class/DebounceController';
import { FiberPool                   as FP2    } from '@litert/concurrent/class/FiberPool';
import { LeakyBucketRateLimiter      as LBRL2  } from '@litert/concurrent/class/LeakyBucketRateLimiter';
import { LeakyBucketRateLimiterManager as LBRLM2 } from '@litert/concurrent/class/LeakyBucketRateLimiterManager';
import { ManualBreaker               as MB2    } from '@litert/concurrent/class/ManualBreaker';
import { MemoryMutex                 as MM2    } from '@litert/concurrent/class/MemoryMutex';
import { SlideWindowCounter          as SWC2   } from '@litert/concurrent/class/SlideWindowCounter';
import { ThrottleController          as TC2    } from '@litert/concurrent/class/ThrottleController';
import { TokenBucketRateLimiter      as TBRL2  } from '@litert/concurrent/class/TokenBucketRateLimiter';
import { TokenBucketRateLimiterManager as TBRLM2 } from '@litert/concurrent/class/TokenBucketRateLimiterManager';

// ── 3. Bundle namespace ───────────────────────────────────────────────────────
import * as ConcurrentNS from '@litert/utils/namespaces/Concurrent';

// ── Type-only imports (verifies interface exports from Types.ts) ───────────────
import type {
    ICounter,
    IBreaker,
    ISyncRateLimiter,
    IAsyncRateLimiter,
    ISyncRateLimiterManager,
    IAsyncRateLimiterManager,
    ISimpleFn,
    IBatchBufferOptions,
    ICircuitBreakerEvents,
    ICircuitBreakerOptions,
    ICountingRateLimiterOptions,
    IDebouncingFunction,
    IDebounceOptions,
    IDebounceControllerEvents,
    IFiberPoolOptions,
    IFiberPoolEvents,
    IFiberFunction,
    IRunOptions,
    ILeakyBucketRateLimiterManagerOptions,
    ILeakyBucketRateLimiterOptions,
    IMemoryMutexOptions,
    ISlideWindowCounterOptions,
    ITokenBucketRateLimiterManagerOptions,
    ITokenBucketRateLimiterOptions,
} from '@litert/concurrent';

// ── Error imports ─────────────────────────────────────────────────────────────
import { E_RATE_LIMITED, E_BREAKER_OPENED } from '@litert/concurrent';

(async (): Promise<void> => {

    // ── ManualBreaker ─────────────────────────────────────────────────────────────
    console.log('\n=== ManualBreaker ===');
    {
        // Assign to IBreaker to verify structural compatibility
        const mb: IBreaker = new ManualBreaker();
        const result: number = mb.call(() => 42);
        console.log('call while closed:', result); // 42

        (mb as ManualBreaker).open();
        let threw = false;
        try { mb.call(() => 0); } catch { threw = true; }
        console.log('throws when open:', threw); // true

        (mb as ManualBreaker).close();
        const mb2  = new MB2();
        const mbNS = new ConcurrentNS.ManualBreaker();
        console.log('sub-path & namespace:', mb2.isClosed(), mbNS.isClosed());
    }

    // ── CircuitBreaker ────────────────────────────────────────────────────────────
    console.log('\n=== CircuitBreaker ===');
    {
        const cb: IBreaker = new CircuitBreaker({ breakThreshold: 3, cooldownTimeMs: 100 });
        for (let i = 0; i < 3; i++) {
            try { cb.call(() => { throw new Error('fail'); }); } catch { /* expected */ }
        }
        let tripped = false;
        try { cb.call(() => {}); } catch { tripped = true; }
        console.log('circuit tripped:', tripped); // true

        const cb2  = new CB2({ breakThreshold: 2, cooldownTimeMs: 50 });
        const cbNS = new ConcurrentNS.CircuitBreaker({ breakThreshold: 2, cooldownTimeMs: 50 });
        console.log('sub-path & namespace CB:', typeof cb2, typeof cbNS);
    }

    // ── SlideWindowCounter / ICounter ─────────────────────────────────────────────
    console.log('\n=== SlideWindowCounter ===');
    {
        const swc = new SlideWindowCounter({ windowSizeMs: 1000, windowQty: 3 });
        swc.increase(5);
        swc.increase(10);
        console.log('total:', swc.getTotal()); // 15
        swc.reset();
        console.log('after reset:', swc.getTotal()); // 0

        // Verify ICounter structural compatibility
        const cnt: ICounter = new SlideWindowCounter({ windowSizeMs: 500 });
        cnt.increase();
        console.log('ICounter.getTotal():', cnt.getTotal()); // 1
        cnt.reset();

        const swc2  = new SWC2({ windowSizeMs: 500, windowQty: 2 });
        const swcNS = new ConcurrentNS.SlideWindowCounter({ windowSizeMs: 1000 });
        swc2.increase(3);
        swcNS.increase(7);
        console.log('sub-path total:', swc2.getTotal());   // 3
        console.log('namespace total:', swcNS.getTotal()); // 7
    }

    // ── CountingRateLimiter / ISyncRateLimiter ────────────────────────────────────
    console.log('\n=== CountingRateLimiter ===');
    {
        const counter = new SlideWindowCounter({ windowSizeMs: 1000 });
        // Assign to ISyncRateLimiter to verify structural compatibility
        const rl: ISyncRateLimiter = new CountingRateLimiter({
            limits:  2,
            counter,
        });
        rl.challenge();
        rl.challenge();
        let blocked = false;
        try { rl.challenge(); } catch { blocked = true; }
        console.log('blocked:', blocked); // true

        const crlCounter = new SWC2({ windowSizeMs: 1000 });
        const rl2   = new CRL2({ limits: 5, counter: crlCounter });
        const rlNSc = new ConcurrentNS.SlideWindowCounter({ windowSizeMs: 1000 });
        const rlNS  = new ConcurrentNS.CountingRateLimiter({ limits: 5, counter: rlNSc });
        console.log('sub-path & namespace CRL:', rl2.isBlocking(), rlNS.isBlocking());
    }

    // ── TokenBucketRateLimiter ────────────────────────────────────────────────────
    console.log('\n=== TokenBucketRateLimiter ===');
    {
        const tb = new TokenBucketRateLimiter({ capacity: 2, refillIntervalMs: 100 });
        console.log('not blocking:', tb.isBlocking()); // false
        tb.call(() => {});
        tb.call(() => {});
        let blocked = false;
        try { tb.call(() => {}); } catch { blocked = true; }
        console.log('blocked when empty:', blocked); // true

        const tb2  = new TBRL2({ capacity: 3, refillIntervalMs: 50 });
        const tbNS = new ConcurrentNS.TokenBucketRateLimiter({ capacity: 5, refillIntervalMs: 100 });
        console.log('sub-path & namespace TBRL:', tb2.isBlocking(), tbNS.isBlocking());
    }

    // ── TokenBucketRateLimiterManager ─────────────────────────────────────────────
    console.log('\n=== TokenBucketRateLimiterManager ===');
    {
        const mgr = new TokenBucketRateLimiterManager({ capacity: 2, refillIntervalMs: 100 });
        mgr.challenge('user-1');
        mgr.challenge('user-1');
        let blocked = false;
        try { mgr.challenge('user-1'); } catch { blocked = true; }
        console.log('manager per-key blocked:', blocked); // true
        mgr.challenge('user-2'); // different key — not blocked

        const mgr2  = new TBRLM2({ capacity: 3, refillIntervalMs: 50 });
        const mgrNS = new ConcurrentNS.TokenBucketRateLimiterManager({ capacity: 5, refillIntervalMs: 100 });
        console.log('sub-path & namespace TBRLM:', typeof mgr2, typeof mgrNS);
    }

    // ── LeakyBucketRateLimiter ────────────────────────────────────────────────────
    console.log('\n=== LeakyBucketRateLimiter (async) ===');
    {
        const lb = new LeakyBucketRateLimiter({ capacity: 2, leakIntervalMs: 20 });
        await lb.challenge();
        await lb.challenge();
        console.log('leaky bucket processed 2 requests');

        const lb2  = new LBRL2({ capacity: 3, leakIntervalMs: 10 });
        const lbNS = new ConcurrentNS.LeakyBucketRateLimiter({ capacity: 3, leakIntervalMs: 10 });
        await lb2.challenge();
        await lbNS.challenge();
        console.log('sub-path & namespace LBRL done');
    }

    // ── LeakyBucketRateLimiterManager ─────────────────────────────────────────────
    console.log('\n=== LeakyBucketRateLimiterManager ===');
    {
        const lmgr = new LeakyBucketRateLimiterManager({ capacity: 2, leakIntervalMs: 10 });
        await lmgr.challenge('key-a');
        console.log('manager challenge done');

        const lmgr2  = new LBRLM2({ capacity: 3, leakIntervalMs: 10 });
        const lmgrNS = new ConcurrentNS.LeakyBucketRateLimiterManager({ capacity: 3, leakIntervalMs: 10 });
        await lmgr2.challenge('k');
        await lmgrNS.challenge('k');
        console.log('sub-path & namespace LBRLM done');
    }

    // ── MemoryMutex ───────────────────────────────────────────────────────────────
    console.log('\n=== MemoryMutex ===');
    {
        const mx = new MemoryMutex();
        console.log('lock():', mx.lock());       // true
        console.log('locked:', mx.isLocked());   // true
        console.log('relock fails:', mx.lock()); // false
        console.log('unlock():', mx.unlock());   // true
        console.log('unlocked:', mx.isLocked()); // false

        const reMx = new MemoryMutex({ reentrant: true });
        console.log('reentrant lock 1:', reMx.lock()); // true
        console.log('reentrant lock 2:', reMx.lock()); // true

        const mx2  = new MM2();
        const mxNS = new ConcurrentNS.MemoryMutex();
        console.log('sub-path & namespace MemoryMutex:', mx2.lock(), mxNS.lock());
    }

    // ── DebounceController ────────────────────────────────────────────────────────
    console.log('\n=== DebounceController ===');
    {
        let fireCount = 0;
        const dc = new DebounceController({ delayMs: 20, function: async (): Promise<void> => { fireCount++; } });
        dc.schedule();
        dc.schedule();
        dc.schedule();
        await new Promise<void>(r => setTimeout(r, 50));
        console.log('debounce fired once:', fireCount === 1); // true

        let cnt2 = 0, cntNS = 0;
        const dc2  = new DC2({ delayMs: 15, function: async (): Promise<void> => { cnt2++; } });
        const dcNS = new ConcurrentNS.DebounceController({ delayMs: 15, function: async (): Promise<void> => { cntNS++; } });
        dc2.schedule();
        dcNS.schedule();
        await new Promise<void>(r => setTimeout(r, 40));
        console.log('sub-path fired:', cnt2 === 1, '| namespace fired:', cntNS === 1);
    }

    // ── ThrottleController ────────────────────────────────────────────────────────
    console.log('\n=== ThrottleController ===');
    {
        let callCount = 0;
        const slowFn = async (n: number): Promise<number> => { callCount++; return n * 2; };

        const tc = new ThrottleController(slowFn, null);
        const [r1, r2] = await Promise.all([tc.call(3), tc.call(4)]);
        console.log('throttle (same call deduped):', r1, r2, '— calls:', callCount); // both same, calls=1

        const tc2  = new TC2(slowFn, null);
        const tcNS = new ConcurrentNS.ThrottleController(slowFn, null);
        console.log('sub-path & namespace ThrottleController:', typeof tc2, typeof tcNS);
    }

    // ── BatchBuffer ───────────────────────────────────────────────────────────────
    console.log('\n=== BatchBuffer ===');
    {
        const batches: number[][] = [];
        const bb = new BatchBuffer<number>({
            delayMs:  20,
            maxSize:  100,
            callback: (items: number[]): void => { batches.push([...items]); },
        });
        bb.push(1);
        bb.push(2);
        bb.push([3, 4]);
        await new Promise<void>(r => setTimeout(r, 60));
        console.log('batch flushed:', batches); // [[1, 2, 3, 4]]

        const bb2  = new BB2({ delayMs: 10, maxSize: 100, callback: (): void => {} });
        const bbNS = new ConcurrentNS.BatchBuffer({ delayMs: 10, maxSize: 100, callback: (): void => {} });
        bb2.push('x');
        bbNS.push('y');
        console.log('sub-path & namespace BatchBuffer work');
        await new Promise<void>(r => setTimeout(r, 30));
    }

    // ── FiberPool ─────────────────────────────────────────────────────────────────
    console.log('\n=== FiberPool ===');
    {
        const pool = new FiberPool({ maxFibers: 2, defaultWaitTimeout: 1000 });
        const results = await Promise.all([
            pool.run({ function: async (n: number): Promise<number> => n * 10, data: 3 }),
            pool.run({ function: async (n: number): Promise<number> => n * 10, data: 5 }),
        ]);
        console.log('pool results:', results); // [30, 50]
        pool.close();

        const fp2  = new FP2({ maxFibers: 1, defaultWaitTimeout: 500 });
        const fpNS = new ConcurrentNS.FiberPool({ maxFibers: 1, defaultWaitTimeout: 500 });
        const r1 = await fp2.run({ function: async (x: number): Promise<number> => x + 1, data: 9 });
        const r2 = await fpNS.run({ function: async (x: number): Promise<number> => x + 1, data: 19 });
        console.log('sub-path FiberPool:', r1);  // 10
        console.log('namespace FiberPool:', r2); // 20
        fp2.close();
        fpNS.close();
    }

    // ── ISimpleFn type ────────────────────────────────────────────────────────────
    console.log('\n=== ISimpleFn ===');
    {
        // ISimpleFn = IFunction<[]> — a zero-argument function
        const fn: ISimpleFn = (): number => 42;
        console.log('ISimpleFn call:', fn()); // 42
    }

    // ── Options/Events interface type verification ────────────────────────────────
    console.log('\n=== Options/Events interface types ===');
    {
        // IBatchBufferOptions<T> — requires maxSize and callback
        const bbOpts: IBatchBufferOptions<number> = {
            delayMs: 10,
            maxSize: 5,
            callback: (items: number[]): void => { console.log('batch flush:', items); },
        };
        const bb = new BatchBuffer<number>(bbOpts);
        console.log('IBatchBufferOptions ok, instanceof BatchBuffer:', bb instanceof BatchBuffer);

        // ICircuitBreakerOptions — all fields optional
        const cbOpts: ICircuitBreakerOptions = { breakThreshold: 3, cooldownTimeMs: 100 };
        const cbEvt: ICircuitBreakerEvents = { error: [new Error('x')], opened: [], half_opened: [], closed: [] };
        const cb = new CircuitBreaker(cbOpts);
        console.log('ICircuitBreakerOptions ok:', cb instanceof CircuitBreaker, 'events shape ok:', Array.isArray(cbEvt.opened));

        // ICountingRateLimiterOptions — needs limits (number) and counter (ICounter)
        const counter: ICounter = new SlideWindowCounter();
        const crlOpts: ICountingRateLimiterOptions = { limits: 5, counter };
        const crl: ISyncRateLimiter = new CountingRateLimiter(crlOpts);
        crl.challenge();
        console.log('ICountingRateLimiterOptions ok');

        // IDebouncingFunction / IDebounceOptions — function is part of options
        const debouncedFn: IDebouncingFunction = (): void => {};
        const dcOpts: IDebounceOptions = { function: debouncedFn, delayMs: 10 };
        const dcEvt: IDebounceControllerEvents = { error: [new Error('x')], triggered: [] };
        const dc = new DebounceController(dcOpts);
        dc.schedule();
        console.log('IDebouncingFunction / IDebounceOptions ok, events shape ok:', Array.isArray(dcEvt.triggered));

        // IFiberPoolOptions / IFiberPoolEvents / IFiberFunction / IRunOptions / FiberPool consts
        console.log('FiberPool consts — MIN_IDLE:', DEFAULT_MIN_IDLE_FIBERS,
            'MAX_IDLE:', DEFAULT_MAX_IDLE_FIBERS,
            'IDLE_TIMEOUT:', DEFAULT_IDLE_TIMEOUT,
            'WAIT_TIMEOUT:', DEFAULT_WAIT_TIMEOUT,
            'MAX_WAITS:', DEFAULT_MAX_WAITS);
        const fpOpts: IFiberPoolOptions = { maxFibers: DEFAULT_MIN_IDLE_FIBERS, defaultWaitTimeout: DEFAULT_WAIT_TIMEOUT };
        const fp = new FiberPool(fpOpts);
        const fn2: IFiberFunction<number, number> = async (n: number): Promise<number> => n * 2;
        const runOpts: IRunOptions<number, number> = { function: fn2, data: 5 };
        const fpResult = await fp.run(runOpts);
        console.log('IFiberFunction / IRunOptions result:', fpResult); // 10
        fp.close();
        const fpEvt: IFiberPoolEvents = { error: [new Error('x')] };
        console.log('IFiberPoolEvents ok:', Array.isArray(fpEvt.error));

        // ILeakyBucketRateLimiterOptions / ILeakyBucketRateLimiterManagerOptions
        const lbrlOpts: ILeakyBucketRateLimiterOptions = { capacity: 3, leakIntervalMs: 50 };
        const lbrl: IAsyncRateLimiter = new LeakyBucketRateLimiter(lbrlOpts);
        await lbrl.challenge();
        console.log('ILeakyBucketRateLimiterOptions ok');

        const lbrlmOpts: ILeakyBucketRateLimiterManagerOptions = { capacity: 2, leakIntervalMs: 100 };
        const lbrlm: IAsyncRateLimiterManager = new LeakyBucketRateLimiterManager(lbrlmOpts);
        await lbrlm.challenge('key1');
        console.log('ILeakyBucketRateLimiterManagerOptions ok');

        // IMemoryMutexOptions / E_LOCK_FAILED
        // lock() returns boolean; run() throws E_LOCK_FAILED if lock not held
        const mmOpts: IMemoryMutexOptions = { reentrant: false };
        const mm = new MemoryMutex(mmOpts);
        const mm2 = mm.share();
        mm.lock();
        let lockFailed = false;
        try { mm2.run((): void => {}); } catch (e) { lockFailed = e instanceof E_LOCK_FAILED; }
        console.log('IMemoryMutexOptions / E_LOCK_FAILED thrown:', lockFailed); // true
        mm.unlock();

        // ISlideWindowCounterOptions — windowSizeMs/windowQty both optional
        const swcOpts: ISlideWindowCounterOptions = { windowSizeMs: 1000, windowQty: 10 };
        const swc = new SlideWindowCounter(swcOpts);
        swc.increase();
        console.log('ISlideWindowCounterOptions ok, total:', swc.getTotal()); // 1

        // ITokenBucketRateLimiterOptions / ITokenBucketRateLimiterManagerOptions
        const tbrlOpts: ITokenBucketRateLimiterOptions = { capacity: 5, refillIntervalMs: 1000 };
        const tbrl: ISyncRateLimiter = new TokenBucketRateLimiter(tbrlOpts);
        tbrl.challenge();
        console.log('ITokenBucketRateLimiterOptions ok');

        const tbrlmOpts: ITokenBucketRateLimiterManagerOptions = { capacity: 3, refillIntervalMs: 1000 };
        const tbrlm: ISyncRateLimiterManager = new TokenBucketRateLimiterManager(tbrlmOpts);
        tbrlm.challenge('u1');
        console.log('ITokenBucketRateLimiterManagerOptions ok');
    }

    // ── IAsyncRateLimiter structural verification ─────────────────────────────────
    console.log('\n=== IAsyncRateLimiter ===');
    {
        // Assign LeakyBucketRateLimiter to IAsyncRateLimiter to verify compatibility
        const rl: IAsyncRateLimiter = new LeakyBucketRateLimiter({ capacity: 2, leakIntervalMs: 10 });
        await rl.challenge();
        console.log('IAsyncRateLimiter.isBlocking():', await rl.isBlocking()); // false (1 slot used)
        console.log('IAsyncRateLimiter.isIdle():',     await rl.isIdle());     // false
        rl.reset();
    }

    // ── ISyncRateLimiterManager structural verification ───────────────────────────
    console.log('\n=== ISyncRateLimiterManager ===');
    {
        // Assign TokenBucketRateLimiterManager to ISyncRateLimiterManager
        const mgr: ISyncRateLimiterManager = new TokenBucketRateLimiterManager({
            capacity: 3,
            refillIntervalMs: 100,
        });
        mgr.challenge('u1');
        console.log('ISyncRateLimiterManager.isBlocking(u1):', mgr.isBlocking('u1')); // false
        mgr.reset('u1');
        mgr.clean();
    }

    // ── IAsyncRateLimiterManager structural verification ──────────────────────────
    console.log('\n=== IAsyncRateLimiterManager ===');
    {
        // Assign LeakyBucketRateLimiterManager to IAsyncRateLimiterManager
        const mgr: IAsyncRateLimiterManager = new LeakyBucketRateLimiterManager({
            capacity: 3,
            leakIntervalMs: 10,
        });
        await mgr.challenge('u1');
        console.log('IAsyncRateLimiterManager.isBlocking(u1):', await mgr.isBlocking('u1')); // false
        await mgr.reset('u1');
        await mgr.clean();
    }

    // ── E_RATE_LIMITED / E_BREAKER_OPENED ─────────────────────────────────────────
    console.log('\n=== E_RATE_LIMITED / E_BREAKER_OPENED ===');
    {
        // E_RATE_LIMITED is thrown when the rate limit is exceeded
        const tb = new TokenBucketRateLimiter({ capacity: 1, refillIntervalMs: 10_000 });
        tb.challenge(); // consumes the 1 token
        let rateLimited: unknown;
        try { tb.challenge(); } catch (e) { rateLimited = e; }
        console.log('E_RATE_LIMITED thrown:', rateLimited instanceof E_RATE_LIMITED); // true
        console.log('E_RATE_LIMITED.name:',   (rateLimited as E_RATE_LIMITED).name);  // 'rate_limited'

        // E_BREAKER_OPENED is thrown when a circuit breaker is open
        const cb2 = new ManualBreaker();
        cb2.open();
        let breakerOpened: unknown;
        try { cb2.call(() => {}); } catch (e) { breakerOpened = e; }
        console.log('E_BREAKER_OPENED thrown:', breakerOpened instanceof E_BREAKER_OPENED); // true
        console.log('E_BREAKER_OPENED.name:',   (breakerOpened as E_BREAKER_OPENED).name);  // 'breaker_opened'
    }

})().catch(console.error);
