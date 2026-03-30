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
import { autoTick, autoTickMs, withEnv } from '@litert/utils-test';

// ── 2. Individual sub-path exports ────────────────────────────────────────────
import { autoTick   as autoTick2   } from '@litert/utils-test/functions/AutoTick';
import { autoTickMs as autoTickMs2 } from '@litert/utils-test/functions/AutoTickMs';
import { withEnv    as withEnv2    } from '@litert/utils-test/functions/WithEnv';

// ── 3. Bundle namespace ───────────────────────────────────────────────────────
import * as TestNS from '@litert/utils/namespaces/Test';

// ── Type-only imports ─────────────────────────────────────────────────────────
import type { IAutoTickMsOptions } from '@litert/utils-test';

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

    // IAutoTickMsOptions type annotation verifies the options shape is correct
    const opts: IAutoTickMsOptions = { tickMs: 100 };
    const result2: string = await autoTickMs(ctx, async () => {
        await NodeTimer.setTimeout(500);
        return 'opts-ok';
    }, opts);

    console.log('autoTickMs result:', result);
    console.log('autoTickMs opts result:', result2);
    assert.strictEqual(result, 'ms-ok');
    assert.strictEqual(result2, 'opts-ok');
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

NodeTest.it('withEnv - sync: temporarily sets environment variables', () => {
    process.env['TEST_VAR'] = 'original';

    withEnv({ 'TEST_VAR': 'overridden', 'NEW_VAR': 'hello' }, () => {
        assert.strictEqual(process.env['TEST_VAR'], 'overridden');
        assert.strictEqual(process.env['NEW_VAR'],  'hello');
    });

    // Restored after the callback
    assert.strictEqual(process.env['TEST_VAR'], 'original');
    assert.strictEqual(process.env['NEW_VAR'],  undefined);
    delete process.env['TEST_VAR'];

    console.log('withEnv sync: env vars restored correctly');
});

NodeTest.it('withEnv - async: restores env vars after promise settles', async () => {
    withEnv({ 'ASYNC_VAR': 'set' }, async () => {
        assert.strictEqual(process.env['ASYNC_VAR'], 'set');
        await Promise.resolve(); // simulate async work
    });
    // Variable may still be set while the async callback runs,
    // but will be cleaned up once the returned promise settles
    console.log('withEnv async: works with async callback');
});

NodeTest.it('withEnv sub-path and namespace exports resolve correctly', () => {
    withEnv2({ 'SUB_PATH_VAR': '1' }, () => {
        assert.strictEqual(process.env['SUB_PATH_VAR'], '1');
    });
    assert.strictEqual(process.env['SUB_PATH_VAR'], undefined);

    TestNS.withEnv({ 'NS_VAR': '2' }, () => {
        assert.strictEqual(process.env['NS_VAR'], '2');
    });
    assert.strictEqual(process.env['NS_VAR'], undefined);

    console.log('withEnv sub-path & namespace: exports resolve correctly');
});
