import * as NodeTest from 'node:test';
// import * as UtilsTest from '@litert/utils-test';
import * as NodeTimers from 'node:timers/promises';
import * as NodeAssert from 'node:assert';
import { FiberPool } from './FiberPool';
import { TimeoutError } from '@litert/utils-async';

NodeTest.describe('Class FiberPool', async () => {

    await NodeTest.it('maxFibers should control the maximum running fibers', async () => {

        const fp = new FiberPool({ maxFibers: 2, });

        let v = 0;
        const fn = async (data: number): Promise<void> => {

            await NodeTimers.setTimeout(10);
            v += data;
        };

        await Promise.all([
            fp.run({ function: fn, data: 1 }),
            fp.run({ function: fn, data: 1 }),
            fp.run({ function: fn, data: 1 }),
            fp.run({ function: fn, data: 1 }),
            fp.run({ function: fn, data: 1 }),
        ]);

        NodeAssert.strictEqual(v, 5, 'The sum of data should be equal to the calls of run().');
        NodeAssert.strictEqual(fp.isClosed(), false, 'Fiber pool should not be closed before calling close().');
        fp.close();
        NodeAssert.strictEqual(fp.isClosed(), true, 'Fiber pool should be closed after calling close().');
    });

    await NodeTest.it('maxFibers should control the maximum running fibers', async () => {

        const fp = new FiberPool({ maxFibers: 2, });

        let v = 0;
        const fn = async (data: number): Promise<void> => {

            await NodeTimers.setTimeout(10);
            v += data;
        };

        const prList = Promise.all([
            fp.run({ function: fn, data: 123 }),
            fp.run({ function: fn, data: 321 }),
        ]);

        await NodeTimers.setImmediate(); // wait for the fibers to start running.

        NodeAssert.strictEqual(fp.idleFibers, 0, 'Idle fibers should be 0 when there are running fibers.');
        NodeAssert.strictEqual(fp.busyFibers, 2, 'Busy fibers should be 2 when there are running fibers.');

        await prList;

        NodeAssert.strictEqual(fp.idleFibers, 1, 'Idle fibers should be 1 after the fibers finished running.');
        NodeAssert.strictEqual(fp.busyFibers, 0, 'Busy fibers should be 0 after the fibers finished running.');

        NodeAssert.strictEqual(v, 444, 'The sum of data should be equal to the sum of the data passed to the run() calls.');
        NodeAssert.strictEqual(fp.isClosed(), false, 'Fiber pool should not be closed before calling close().');
        fp.close();
        NodeAssert.strictEqual(fp.isClosed(), true, 'Fiber pool should be closed after calling close().');
        NodeAssert.strictEqual(fp.idleFibers, 0, 'Idle fibers should be 0 after the fiber pool is closed.');
    });

    await NodeTest.it('close should rejects all pending executions of function', async () => {

        const fp = new FiberPool({ maxFibers: 2, });

        let v = 0;
        const fn = async (data: number): Promise<void> => {

            await NodeTimers.setTimeout(10);
            v += data;
        };

        const prList = Promise.allSettled([
            fp.run({ function: fn, data: 123 }),
            fp.run({ function: fn, data: 321 }),
            fp.run({ function: fn, data: 444 }),
        ]);

        await NodeTimers.setImmediate(); // wait for the fibers to start running.
        fp.close();

        NodeAssert.strictEqual(fp.idleFibers, 0, 'Idle fibers should be 0 when there are running fibers.');
        NodeAssert.strictEqual(fp.busyFibers, 2, 'Busy fibers should be 2 when there are running fibers.');

        await prList;

        NodeAssert.strictEqual(fp.idleFibers, 0, 'Idle fibers should be 0 after the fibers finished running.');
        NodeAssert.strictEqual(fp.busyFibers, 0, 'Busy fibers should be 0 after the fibers finished running.');

        try {

            await fp.run({ function: fn, data: 123 });
            NodeAssert.fail('The fiber pool should be closed, and the run() should throw an error.');
        }
        catch (err) {
            NodeAssert.ok(err instanceof Error, 'The error should be an instance of Error.');
            NodeAssert.strictEqual(err.message, 'The fiber pool is closed.', 'The error message should be "The fiber pool is closed."');
        }
    });

    await NodeTest.it('idle fibers should be reuse prior to creating new fibers', async () => {

        const fp = new FiberPool({ maxFibers: 2, });

        let v = 0;
        const fn = async (data: number): Promise<void> => {

            await NodeTimers.setTimeout(10);
            v += data;
        };

        await fp.run({ function: fn, data: 123 });
        NodeAssert.strictEqual(fp.idleFibers, 1, 'Idle fibers should be 1 immediately after the first run.');
        NodeAssert.strictEqual(fp.busyFibers, 0, 'Busy fibers should be 0 after the fibers finished running.');
        
        await fp.run({ function: fn, data: 123 });

        // no more fibers should be created, since there is an idle fiber available.
        NodeAssert.strictEqual(fp.idleFibers, 1, 'Idle fibers should be 1 immediately after the first run.');
        NodeAssert.strictEqual(fp.busyFibers, 0, 'Busy fibers should be 0 after the fibers finished running.');

        fp.close();
    });

    await NodeTest.it('run() should throw the error thrown by the execution function', async () => {

        const fp = new FiberPool({ maxFibers: 2, });

        const fn = async (data: number): Promise<void> => {

            await NodeTimers.setImmediate();
            throw new Error(`Test error: ${data}`);
        };

        try {
            await fp.run({ function: fn, data: 123 });
            NodeAssert.fail('The run() should throw an error, but it did not.');
        }
        catch (err) {
            NodeAssert.ok(err instanceof Error, 'The error should be an instance of Error.');
            NodeAssert.strictEqual(err.message, 'Test error: 123', 'The error message should be "Test error: 123".');
        }

        fp.close();
    });

    await NodeTest.it('run() should throw TimeoutError if timeout during waiting for fiber', async () => {

        const fp = new FiberPool({ maxFibers: 2, });

        const fn = async (data: number): Promise<void> => {

            await NodeTimers.setTimeout(50);
            throw new Error(`Test error: ${data}`);
        };

        const [r1, r2, r5, r3, r4,] = await Promise.allSettled([
            fp.run({ function: fn, data: 123, waitTimeout: 10 }),
            fp.run({ function: fn, data: 456, waitTimeout: 10 }),
            fp.run({ function: fn, data: 999 }),
            fp.run({ function: fn, data: 456, waitTimeout: 10 }),
            fp.run({ function: fn, data: 777 }),
        ]);

        NodeAssert.ok(r1.status === 'rejected');
        NodeAssert.ok(r1.reason instanceof Error, 'The error should be an instance of Error.');
        NodeAssert.strictEqual(r1.reason.message, 'Test error: 123', 'The error message should be "Test error: 123".');

        NodeAssert.ok(r2.status === 'rejected');
        NodeAssert.ok(r2.reason instanceof Error, 'The error should be an instance of Error.');
        NodeAssert.strictEqual(r2.reason.message, 'Test error: 456', 'The error message should be "Test error: 456".');

        NodeAssert.ok(r5.status === 'rejected');
        NodeAssert.ok(r5.reason instanceof Error, 'The error should be an instance of Error.');
        NodeAssert.strictEqual(r5.reason.message, 'Test error: 999', 'The error message should be "Test error: 999".');

        NodeAssert.ok(r3.status === 'rejected');
        NodeAssert.ok(r3.reason instanceof TimeoutError, 'The error should be an instance of TimeoutError.');

        NodeAssert.ok(r4.status === 'rejected');
        NodeAssert.ok(r4.reason instanceof Error, 'The error should be an instance of Error.');
        NodeAssert.strictEqual(r4.reason.message, 'Test error: 777', 'The error message should be "Test error: 777".');

        fp.close();
    });

    await NodeTest.it('run() should throw Error if there are too many waits', async () => {

        const fp = new FiberPool({ maxFibers: 2, maxWaits: 1, });

        const fn = async (data: number): Promise<void> => {

            await NodeTimers.setTimeout(10);
            throw new Error(`Test error: ${data}`);
        };

        const result = await Promise.allSettled([
            fp.run({ function: fn, data: 123 }),
            fp.run({ function: fn, data: 456 }),
            fp.run({ function: fn, data: 456 }),
            fp.run({ function: fn, data: 456 }),
        ]);

        NodeAssert.ok(result[0].status === 'rejected');
        NodeAssert.ok(result[0].reason instanceof Error, 'The error should be an instance of Error.');
        NodeAssert.strictEqual(result[0].reason.message, 'Test error: 123', 'The error message should be "Test error: 123".');
        NodeAssert.ok(result[1].status === 'rejected');
        NodeAssert.ok(result[1].reason instanceof Error, 'The error should be an instance of Error.');
        NodeAssert.strictEqual(result[1].reason.message, 'Test error: 456', 'The error message should be "Test error: 456".');
        NodeAssert.ok(result[2].status === 'rejected');
        NodeAssert.ok(result[2].reason instanceof Error, 'Test error: 456');
        NodeAssert.ok(result[3].status === 'rejected');
        NodeAssert.ok(result[3].reason instanceof Error, 'The fiber pool has reached the maximum number of waits.');

        fp.close();
    });
});
