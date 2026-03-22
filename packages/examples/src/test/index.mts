/**
 * TypeScript example — @litert/utils-test
 *
 * Run with: node --test test/index.ts
 *
 * TypeScript-specific: uses `TestContext` from `node:test` as explicit parameter
 * type, and explicit generic type parameters on `autoTick` / `autoTickMs` to
 * verify the return types match.
 */

import * as NodeTest              from 'node:test';
import type { TestContext }       from 'node:test';
import assert                     from 'node:assert';
import NodeTimer                  from 'node:timers/promises';

// ── 1. Main entry ─────────────────────────────────────────────────────────────
import { autoTick, autoTickMs } from '@litert/utils-test';

// ── 2. Individual sub-path exports ────────────────────────────────────────────
import { autoTick   as autoTick2   } from '@litert/utils-test/functions/AutoTick';
import { autoTickMs as autoTickMs2 } from '@litert/utils-test/functions/AutoTickMs';

// ── 3. Bundle namespace ───────────────────────────────────────────────────────
import * as TestNS from '@litert/utils/namespaces/Test';

// ── Tests ─────────────────────────────────────────────────────────────────────

NodeTest.it('autoTick - advances all mocked timers per loop tick', async (ctx: TestContext) => {
    ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });

    const result: string = await autoTick(ctx, async () => {
        await NodeTimer.setTimeout(1_000);
        await NodeTimer.setTimeout(500);
        return 'done';
    });

    console.log('autoTick result:', result);
    assert.strictEqual(result, 'done');
});

NodeTest.it('autoTickMs - advances clock by fixed ms per tick', async (ctx: TestContext) => {
    ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });

    const result: string = await autoTickMs(ctx, async () => {
        await NodeTimer.setTimeout(1_000);
        return 'ms-ok';
    }, { tickMs: 100 });

    console.log('autoTickMs result:', result);
    assert.strictEqual(result, 'ms-ok');
});

NodeTest.it('autoTick works with an already-resolved promise', async (ctx: TestContext) => {
    ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });

    const r: string = await autoTick(ctx, Promise.resolve('immediate'));
    console.log('immediate result:', r);
    assert.strictEqual(r, 'immediate');
});

NodeTest.it('sub-path and namespace exports resolve correctly', async (ctx: TestContext) => {
    ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });

    const r1: string = await autoTick2(ctx, Promise.resolve('a'));
    const r2: string = await autoTickMs2(ctx, Promise.resolve('b'), { tickMs: 10 });
    const r3: string = await TestNS.autoTick(ctx, Promise.resolve('c'));
    const r4: string = await TestNS.autoTickMs(ctx, Promise.resolve('d'), { tickMs: 10 });

    console.log('sub-path & namespace results:', r1, r2, r3, r4);
    assert.strictEqual(r1, 'a');
    assert.strictEqual(r2, 'b');
    assert.strictEqual(r3, 'c');
    assert.strictEqual(r4, 'd');
});
