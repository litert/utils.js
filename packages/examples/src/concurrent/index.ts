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
import type { ICounter, IBreaker, ISyncRateLimiter } from '@litert/concurrent';

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

})().catch(console.error);
