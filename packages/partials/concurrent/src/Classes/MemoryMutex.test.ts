import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { MemoryMutex } from './MemoryMutex';

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
});
