import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { PromiseController } from './PromiseController';
import { TimeoutError } from '../Functions/WithTimeout';

NodeTest.describe('Class PromiseController', async () => {

    await NodeTest.it('Create a promise controller without timeout by default', async () => {

        const pc = new PromiseController<string>();

        NodeAssert.strictEqual((pc as any)._timer, null);
        NodeAssert.strictEqual(typeof pc.resolve, 'function');
        NodeAssert.strictEqual(typeof pc.reject, 'function');
        NodeAssert.strictEqual(pc.promise instanceof Promise, true);

        setTimeout(() => { pc.resolve('123'); }, 10);

        NodeAssert.strictEqual(await pc.promise, '123');
    });

    await NodeTest.it('Create a promise controller with timeout', async () => {

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

            NodeAssert.strictEqual(e instanceof TimeoutError, true);
            NodeAssert.strictEqual((e as TimeoutError).message, 'Operation timed out');
            NodeAssert.strictEqual((e as TimeoutError).unresolvedPromise, pc2.promise);
        }
    });

    await NodeTest.it('Both resolve and reject could clear the timeout', async () => {

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

    await NodeTest.it('Should throw error with an invalid timeout', async () => {

        for (const invalidTimeout of [
            null, BigInt(1234), 'string', 1.5,
            {}, [], true, -1, -0.1,
            false, NaN, Infinity, Symbol('123'),
        ]) {

            console.log(invalidTimeout);
            NodeAssert.throws(() => new PromiseController<string>(invalidTimeout as any), {
                name: 'TypeError',
                message: 'The "timeoutMs" must be an integer.'
            });
        }
    });
});
