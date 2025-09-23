import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { SlideWindowCounter } from './SlideWindowCounter';

NodeTest.describe('Class SlideWindowCounter', () => {

    NodeTest.it('should use the corrected default option values', () => {

        NodeAssert.strictEqual(new SlideWindowCounter().windowQty, 3);
        NodeAssert.strictEqual(new SlideWindowCounter().windowSize, 10000);
        NodeAssert.strictEqual(new SlideWindowCounter({}).windowQty, 3);
        NodeAssert.strictEqual(new SlideWindowCounter({}).windowSize, 10000);
        NodeAssert.strictEqual(new SlideWindowCounter({ windowQty: 5 }).windowQty, 5);
        NodeAssert.strictEqual(new SlideWindowCounter({ windowSizeMs: 5000 }).windowSize, 5000);
    });

    NodeTest.it('should count correctly before window rotated', (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date'], now: 1000000 });

        const rwc = new SlideWindowCounter({
            windowSizeMs: 1000,
            windowQty: 3,
        });

        NodeAssert.strictEqual(rwc.getWindows(), 0);

        // Window 0
        NodeAssert.strictEqual(rwc.count(5), 5);
        NodeAssert.strictEqual(rwc.getTotal(), 5);
        NodeAssert.strictEqual(rwc.getWindows(), 1);

        NodeAssert.strictEqual(rwc.count(), 6);
        NodeAssert.strictEqual(rwc.getTotal(), 6);

        ctx.mock.timers.tick(100);

        NodeAssert.strictEqual(rwc.getWindows(), 1);

        NodeAssert.strictEqual(rwc.count(), 7);
        NodeAssert.strictEqual(rwc.getTotal(), 7);
        ctx.mock.timers.tick(900);

        // Window 1

        NodeAssert.strictEqual(rwc.count(), 8);
        NodeAssert.strictEqual(rwc.getTotal(), 8);
        NodeAssert.strictEqual(rwc.getWindows(), 2);

        ctx.mock.timers.tick(1000);

        // Window 2

        NodeAssert.strictEqual(rwc.count(), 9);
        NodeAssert.strictEqual(rwc.getTotal(), 9);
        NodeAssert.strictEqual(rwc.getWindows(), 3);
    });

    NodeTest.it('should start from first window if all windows are expired', (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date'], now: 1000000 });

        const rwc = new SlideWindowCounter({
            windowSizeMs: 1000,
            windowQty: 3,
        });

        NodeAssert.strictEqual(rwc.count(), 1); // [1]
        ctx.mock.timers.tick(1000);
        NodeAssert.strictEqual(rwc.count(), 2); // [1, 1]
        ctx.mock.timers.tick(1000);
        NodeAssert.strictEqual(rwc.count(), 3); // [1, 1, 1]

        ctx.mock.timers.tick(3000);

        NodeAssert.strictEqual(rwc.count(), 1); // [1]

    });

    NodeTest.it('should rotate oldest window if new window is needed', (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date'], now: 1000000 });

        const rwc = new SlideWindowCounter({
            windowSizeMs: 1000,
            windowQty: 3,
        });

        NodeAssert.strictEqual(rwc.getWindows(), 0);

        NodeAssert.strictEqual(rwc.count(), 1); // [1]
        NodeAssert.strictEqual(rwc.getWindows(), 1);

        ctx.mock.timers.tick(1000);
        NodeAssert.strictEqual(rwc.count(), 2); // [1, 1]
        NodeAssert.strictEqual(rwc.getWindows(), 2);

        ctx.mock.timers.tick(1000);
        NodeAssert.strictEqual(rwc.count(), 3); // [1, 1, 1]
        NodeAssert.strictEqual(rwc.getWindows(), 3);

        ctx.mock.timers.tick(1000);
        NodeAssert.strictEqual(rwc.count(1), 3); // [1, 1, 1]
        NodeAssert.strictEqual(rwc.getWindows(), 3);

        ctx.mock.timers.tick(1000);
        NodeAssert.strictEqual(rwc.count(2), 4); // [1, 1, 2]
        NodeAssert.strictEqual(rwc.getWindows(), 3);

        ctx.mock.timers.tick(1000);
        NodeAssert.strictEqual(rwc.count(3), 6); // [1, 2, 3]
        NodeAssert.strictEqual(rwc.getWindows(), 3);

        ctx.mock.timers.tick(1000);
        NodeAssert.strictEqual(rwc.count(4), 9); // [2, 3, 4]
        NodeAssert.strictEqual(rwc.getWindows(), 3);

        ctx.mock.timers.tick(1000);
        NodeAssert.strictEqual(rwc.count(5), 12); // [3, 4, 5]
        NodeAssert.strictEqual(rwc.getWindows(), 3);
    });

    NodeTest.it('should restart all by reset method', (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date'], now: 1000000 });

        const rwc = new SlideWindowCounter({
            windowSizeMs: 1000,
            windowQty: 3,
        });

        NodeAssert.strictEqual(rwc.count(), 1); // [1]
        ctx.mock.timers.tick(1000);
        NodeAssert.strictEqual(rwc.count(), 2); // [1, 1]
        ctx.mock.timers.tick(1000);
        NodeAssert.strictEqual(rwc.count(), 3); // [1, 1, 1]

        rwc.reset();

        NodeAssert.strictEqual(rwc.getTotal(), 0);
        NodeAssert.strictEqual(rwc.getWindows(), 0);

        NodeAssert.strictEqual(rwc.count(), 1); // [1]
        
        ctx.mock.timers.tick(3000);

        NodeAssert.strictEqual(rwc.count(), 1); // [1]
    });

    NodeTest.it('should drop the oldest window once a new boundary was reached', (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date'], now: 1000000 });

        const rwc = new SlideWindowCounter({
            windowSizeMs: 1,
            windowQty: 3,
        });

        NodeAssert.strictEqual(rwc.count(), 1); // [1]
        ctx.mock.timers.tick(1);
        NodeAssert.strictEqual(rwc.count(), 2); // [1, 1]
        ctx.mock.timers.tick(1);
        NodeAssert.strictEqual(rwc.count(), 3); // [1, 1, 1]
        NodeAssert.strictEqual(rwc.count(), 4); // [1, 1, 2]
        ctx.mock.timers.tick(1);
        NodeAssert.strictEqual(rwc.count(), 4); // [1, 2, 1]
        ctx.mock.timers.tick(1);
        NodeAssert.strictEqual(rwc.count(), 4); // [2, 1, 1]
        ctx.mock.timers.tick(1);
        NodeAssert.strictEqual(rwc.count(), 3); // [1, 1, 1]
    });

    NodeTest.it('should throw error if incorrect settings were used', () => {

        for (const invalidValue of [
            0, -1, 1.1, NaN, Infinity, -Infinity, '1', {}, [1], 1n, true, false
        ] as any) {
            NodeAssert.throws(() => new SlideWindowCounter({ windowQty: invalidValue }));
            NodeAssert.throws(() => new SlideWindowCounter({ windowSizeMs: invalidValue }));
        }
    });
});
