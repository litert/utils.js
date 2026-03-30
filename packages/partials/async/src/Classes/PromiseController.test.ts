/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import * as TestUtils from '@litert/utils-test';
import { PromiseController } from './PromiseController.js';
import { E_TIMEOUT } from '../Errors.js';

NodeTest.describe('Module Async - Class PromiseController', async () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    await NodeTest.it('B-M-00001: Create a promise controller without timeout by default', async () => {

        const pc = new PromiseController<string>();

        NodeAssert.strictEqual((pc as any)._timer, null);
        NodeAssert.strictEqual(typeof pc.resolve, 'function');
        NodeAssert.strictEqual(typeof pc.reject, 'function');
        NodeAssert.strictEqual(pc.promise instanceof Promise, true);

        setTimeout(() => { pc.resolve('123'); }, 10);

        NodeAssert.strictEqual(await pc.promise, '123');
    });

    await NodeTest.it('B-M-00002: Create a promise controller with timeout', async () => {

        const pc1 = new PromiseController<string>(100);

        NodeAssert.strictEqual(null !== (pc1 as any)._timer, true);
        NodeAssert.strictEqual(typeof pc1.resolve, 'function');
        NodeAssert.strictEqual(typeof pc1.reject, 'function');
        NodeAssert.strictEqual(pc1.promise instanceof Promise, true);

        setTimeout(() => { pc1.resolve('123'); }, 10);

        NodeAssert.strictEqual(await pc1.promise, '123');

        const pc2 = new PromiseController<string>(10);

        setTimeout(() => { pc2.resolve('123'); }, 20);

        try {

            await pc2.promise;
            NodeAssert.fail('Expected promise to reject due to timeout');
        }
        catch (e) {

            NodeAssert.ok(e instanceof E_TIMEOUT, 'Should reject with E_TIMEOUT');
        }
    });

    await NodeTest.it('B-M-00003: Both resolve and reject could clear the timeout', async () => {

        const pc1 = new PromiseController<string>(100);

        pc1.resolve('123');
        NodeAssert.strictEqual(await pc1.promise, '123');

        const pc2 = new PromiseController<string>(100);

        pc2.reject(new Error('Test error'));

        try {

            await pc2.promise;
            NodeAssert.fail('Expected promise to reject due to timeout');
        }
        catch (e) {

            NodeAssert.strictEqual(e instanceof Error, true);
            NodeAssert.strictEqual((e as Error).message, 'Test error');
        }
    });

    // ─── Black-Box: Failure Flow ─────────────────────────

    await NodeTest.it('B-F-00001: Should throw error with an invalid timeout', async () => {

        for (const invalidTimeout of [
            null, BigInt(1234), 'string', 1.5,
            {}, [], true, -1, -0.1,
            false, NaN, Infinity, Symbol('123'),
        ]) {

            NodeAssert.throws(() => new PromiseController<string>(invalidTimeout as any), {
                name: 'TypeError',
                message: 'The "timeoutMs" must be an integer.'
            });
        }
    });

    await NodeTest.it('B-F-00002: After timeout fires, resolve() should be a no-op', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });

        const TIMEOUT_MS = 50;
        const pc = new PromiseController<string>(TIMEOUT_MS);

        await NodeAssert.rejects(
            TestUtils.autoTick(ctx, pc.promise),
            (e) => {
                NodeAssert.ok(e instanceof E_TIMEOUT, 'Should reject with E_TIMEOUT');
                return true;
            }
        );

        // After timeout fired, resolve() must be a no-op — no unhandled rejection
        pc.resolve('late-value');
    });

    await NodeTest.it('B-F-00003: After timeout fires, reject() should be a no-op', async (ctx) => {

        ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });

        const TIMEOUT_MS = 50;
        const pc = new PromiseController<string>(TIMEOUT_MS);

        await NodeAssert.rejects(
            TestUtils.autoTick(ctx, pc.promise),
            (e) => {
                NodeAssert.ok(e instanceof E_TIMEOUT, 'Should reject with E_TIMEOUT');
                return true;
            }
        );

        // After timeout fired, reject() must be a no-op — no double rejection
        pc.reject(new Error('late-error'));
    });

    // ─── Black-Box: Edge Cases ───────────────────────────

    await NodeTest.it('B-E-00001: Zero timeout should not start a timer and should allow manual resolve', async () => {

        const pc = new PromiseController<number>(0);

        NodeAssert.strictEqual((pc as any)._timer, null, 'Zero timeout should not create an internal timer');

        pc.resolve(99);
        NodeAssert.strictEqual(await pc.promise, 99);
    });
});
