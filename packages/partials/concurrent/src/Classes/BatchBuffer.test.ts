import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { BatchBuffer } from './BatchBuffer';

NodeTest.describe('Class BatchBuffer', async () => {

    NodeTest.it('should call callback when the buffer is full', () => {

        const recv: any[] = [];

        const buffer = new BatchBuffer({
            'callback': (items) => { recv.push(...items); },
            'delayMs': 10,
            'maxSize': 2,
        });

        NodeAssert.strictEqual(recv.length, 0);

        buffer.push(1);
        NodeAssert.strictEqual(recv.length, 0);

        buffer.push(2);
        NodeAssert.strictEqual(recv.length, 2);

        buffer.push(3);
        NodeAssert.strictEqual(recv.length, 2);
    });

    NodeTest.it('should call callback when the timeout is reached', (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'] });

        const recv: any[] = [];

        const buffer = new BatchBuffer({
            'callback': (items) => { recv.push(...items); },
            'delayMs': 10,
            'maxSize': 2,
        });

        NodeAssert.deepStrictEqual(recv, []);

        buffer.push(1);
        NodeAssert.deepStrictEqual(recv, []);

        buffer.push(2);
        NodeAssert.deepStrictEqual(recv, [1, 2]);

        buffer.push(3);
        NodeAssert.deepStrictEqual(recv, [1, 2]);

        ctx.mock.timers.runAll();

        NodeAssert.deepStrictEqual(recv, [1, 2, 3]);
    });

    NodeTest.it('should process arrays as well', (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setTimeout'] });

        const recv: any[] = [];

        const buffer = new BatchBuffer({
            'callback': (items) => { recv.push(...items); },
            'delayMs': 10,
            'maxSize': 2,
        });

        NodeAssert.deepStrictEqual(recv, []);

        buffer.push([1]);
        NodeAssert.deepStrictEqual(recv, []);

        buffer.push([]);
        NodeAssert.deepStrictEqual(recv, []);

        buffer.push([4, 5, 6]);
        NodeAssert.deepStrictEqual(recv, [1, 4, 5, 6]);

        buffer.push([1]);
        NodeAssert.deepStrictEqual(recv, [1, 4, 5, 6]); // no change

        ctx.mock.timers.runAll();

        NodeAssert.deepStrictEqual(recv, [1, 4, 5, 6, 1]);
    });
});
