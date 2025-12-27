import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { MemoryMutex, E_LOCK_FAILED } from './MemoryMutex';

NodeTest.describe('Class MemoryMutex', async () => {

    NodeTest.it('A new mutex should be able to lock and unlock', () => {

        const mutex = new MemoryMutex();

        NodeAssert.strictEqual(mutex.lock(), true);
        NodeAssert.strictEqual(mutex.isLocked(), true);
        NodeAssert.strictEqual(mutex.lock(), true);
        NodeAssert.strictEqual(mutex.isLocked(), true);
        NodeAssert.strictEqual(mutex.unlock(), true);
        NodeAssert.strictEqual(mutex.isLocked(), false);
        NodeAssert.strictEqual(mutex.unlock(), false);
        NodeAssert.strictEqual(mutex.unlock(), false);
    });

    NodeTest.it('Two non-shared mutex should be lockable independently', () => {

        const mutex1 = new MemoryMutex();
        const mutex2 = new MemoryMutex();

        NodeAssert.strictEqual(mutex1.lock(), true);
        NodeAssert.strictEqual(mutex2.lock(), true);
        NodeAssert.strictEqual(mutex1.isLocked(), true);
        NodeAssert.strictEqual(mutex2.isLocked(), true);
        NodeAssert.strictEqual(mutex1.lock(), true);
        NodeAssert.strictEqual(mutex2.lock(), true);
        NodeAssert.strictEqual(mutex1.isLocked(), true);
        NodeAssert.strictEqual(mutex2.isLocked(), true);
        NodeAssert.strictEqual(mutex1.unlock(), true);
        NodeAssert.strictEqual(mutex2.unlock(), true);
        NodeAssert.strictEqual(mutex1.isLocked(), false);
        NodeAssert.strictEqual(mutex2.isLocked(), false);
        NodeAssert.strictEqual(mutex1.unlock(), false);
        NodeAssert.strictEqual(mutex2.unlock(), false);
        NodeAssert.strictEqual(mutex1.unlock(), false);
        NodeAssert.strictEqual(mutex2.unlock(), false);
    });

    NodeTest.it('Two shared mutex should share the mutex state', () => {

        const mutex1 = new MemoryMutex();
        const mutex2 = mutex1.share();

        NodeAssert.strictEqual(mutex1.lock(), true);
        NodeAssert.strictEqual(mutex2.lock(), false);
        NodeAssert.strictEqual(mutex1.isLocked(), true);
        NodeAssert.strictEqual(mutex2.isLocked(), false);
        NodeAssert.strictEqual(mutex1.lock(), true);
        NodeAssert.strictEqual(mutex2.lock(), false);
        NodeAssert.strictEqual(mutex1.isLocked(), true);
        NodeAssert.strictEqual(mutex2.isLocked(), false);
        NodeAssert.strictEqual(mutex2.unlock(), false);
        NodeAssert.strictEqual(mutex1.unlock(), true);
        NodeAssert.strictEqual(mutex1.isLocked(), false);
        NodeAssert.strictEqual(mutex2.isLocked(), false);
        NodeAssert.strictEqual(mutex2.unlock(), false);
        NodeAssert.strictEqual(mutex1.unlock(), false);
        NodeAssert.strictEqual(mutex2.lock(), true);
        NodeAssert.strictEqual(mutex1.isLocked(), false);
        NodeAssert.strictEqual(mutex2.isLocked(), true);
        NodeAssert.strictEqual(mutex1.unlock(), false);
        NodeAssert.strictEqual(mutex2.unlock(), true);
        NodeAssert.strictEqual(mutex1.isLocked(), false);
        NodeAssert.strictEqual(mutex2.isLocked(), false);
    });

    NodeTest.it('Method run should execute a synchronous function', () => {

        const mutex = new MemoryMutex();
        let executed = false;

        mutex.run(() => {

            NodeAssert.strictEqual(mutex.isLocked(), true);
            executed = true;
        });

        NodeAssert.strictEqual(executed, true);
        NodeAssert.strictEqual(mutex.isLocked(), false);
    });

    NodeTest.it('Method run should execute an asynchronous function', async () => {

        const mutex = new MemoryMutex();
        let executed = false;

        await mutex.run(async () => {

            NodeAssert.strictEqual(mutex.isLocked(), true);
            await new Promise((resolve) => setTimeout(resolve, 10));
            executed = true;
        });

        NodeAssert.strictEqual(executed, true);
        NodeAssert.strictEqual(mutex.isLocked(), false);
    });

    NodeTest.it('Method run should unlock the mutex if synchronous function throws', () => {

        const mutex = new MemoryMutex();

        NodeAssert.throws(() => {

            mutex.run(() => {

                NodeAssert.strictEqual(mutex.isLocked(), true);
                throw new Error('Test Error');
            });

        }, { message: 'Test Error' });

        NodeAssert.strictEqual(mutex.isLocked(), false);
    });

    NodeTest.it('Method run should unlock the mutex if asynchronous function throws', async () => {

        const mutex = new MemoryMutex();

        await NodeAssert.rejects(async () => {

            await mutex.run(async () => {

                NodeAssert.strictEqual(mutex.isLocked(), true);
                throw new Error('Test Error');
            });

        }, { message: 'Test Error' });

        NodeAssert.strictEqual(mutex.isLocked(), false);
    });

    NodeTest.it('Method run should throw E_LOCK_FAILED if lock is already held', () => {

        const mutex1 = new MemoryMutex();
        const mutex2 = mutex1.share();

        mutex1.lock();

        NodeAssert.throws(() => {

            mutex2.run(() => {

                // Should not execute
            });

        }, E_LOCK_FAILED);

        NodeAssert.strictEqual(mutex1.isLocked(), true);
    });

    NodeTest.it('Method run should return the result of the function', () => {

        const mutex = new MemoryMutex();

        const ret = mutex.run(() => 123);

        NodeAssert.strictEqual(ret, 123);
    });

    NodeTest.it('Method run should return the result of the async function', async () => {

        const mutex = new MemoryMutex();

        const ret = await mutex.run(async () => 123);

        NodeAssert.strictEqual(ret, 123);
    });

    NodeTest.it('Method wrap should return a function that executes with lock', () => {

        const mutex = new MemoryMutex();
        let executed = false;

        const wrapped = mutex.wrap(() => {

            NodeAssert.strictEqual(mutex.isLocked(), true);
            executed = true;
        });

        wrapped();

        NodeAssert.strictEqual(executed, true);
        NodeAssert.strictEqual(mutex.isLocked(), false);
    });

    NodeTest.it('Method wrap should pass arguments to the wrapped function', () => {

        const mutex = new MemoryMutex();
        let executed = false;

        const wrapped = mutex.wrap((a: number, b: number) => {

            NodeAssert.strictEqual(mutex.isLocked(), true);
            executed = true;
            return a + b;
        });

        const ret = wrapped(1, 2);

        NodeAssert.strictEqual(executed, true);
        NodeAssert.strictEqual(ret, 3);
        NodeAssert.strictEqual(mutex.isLocked(), false);
    });

    NodeTest.it('Method wrap should work with async functions', async () => {

        const mutex = new MemoryMutex();
        let executed = false;

        const wrapped = mutex.wrap(async () => {

            NodeAssert.strictEqual(mutex.isLocked(), true);
            await new Promise((resolve) => setTimeout(resolve, 10));
            executed = true;
            return 123;
        });

        const ret = await wrapped();

        NodeAssert.strictEqual(executed, true);
        NodeAssert.strictEqual(ret, 123);
        NodeAssert.strictEqual(mutex.isLocked(), false);
    });

    NodeTest.it('Method wrap should preserve execution context', () => {

        const mutex = new MemoryMutex();

        class TestClass {

            public value = 123;

            public method() {
                return this.value;
            }
        }

        const obj = new TestClass();
        obj.value = 456;

        const wrapped = mutex.wrap(obj.method.bind(obj));
        
        const ret = wrapped();
        NodeAssert.strictEqual(ret, obj.value);
    });

    NodeTest.it('Method wrap should throw E_LOCK_FAILED if lock is already held', () => {

        const mutex1 = new MemoryMutex();
        const mutex2 = mutex1.share();
        
        mutex1.lock();

        const wrapped = mutex2.wrap(() => {
            return 123;
        });

        NodeAssert.throws(() => {
            wrapped();
        }, E_LOCK_FAILED);
    });
});
