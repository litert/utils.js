import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { DebounceController } from './DebounceController';

NodeTest.describe('Class DebounceController', () => {

    NodeTest.it('Method "schedule" should (re)schedule the function call', (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setImmediate', 'setTimeout'] });

        let triggers = 0;
        let v = 0;
        let startedAt = Date.now();
        const controller = new DebounceController({
            function: () => {
                v++;
            },
            delayMs: 1000,
        });
        controller.on('triggered', () => { triggers++; });

        controller.schedule();
        controller.schedule();
        controller.schedule();
        controller.schedule();
        controller.schedule();

        ctx.mock.timers.runAll();

        NodeAssert.strictEqual(v, 1, 'The function should be called only once');
        NodeAssert.strictEqual(triggers, 1, 'The triggered event should be emitted once');
        NodeAssert.strictEqual(Date.now() - startedAt, 1000, 'The function should have been called after the delay.');

        startedAt = Date.now();
        controller.schedule();

        ctx.mock.timers.tick(200); // let the time pass for 200ms

        controller.schedule(); // reschedule the call

        ctx.mock.timers.runAll();
        NodeAssert.strictEqual(v, 2, 'The function should be called only once');
        NodeAssert.strictEqual(triggers, 2, 'The triggered event should be emitted again');
        NodeAssert.strictEqual(Date.now() - startedAt, 1200, 'The function should have been called again after the delay.');
    });

    NodeTest.it('Method "schedule" should watch on the maxDelay', (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setImmediate', 'setTimeout'], 'now': 10000000 });

        let triggers = 0;
        let v = 0;
        let startedAt = Date.now();
        const controller = new DebounceController({
            function: () => {
                v++;
            },
            delayMs: 1000,
            maxDelayMs: 2000,
        });
        controller.on('triggered', () => { triggers++; });

        controller.schedule();
        ctx.mock.timers.tick(500);
        controller.schedule();
        ctx.mock.timers.tick(500);
        controller.schedule();
        ctx.mock.timers.tick(500);
        controller.schedule();
        ctx.mock.timers.tick(500);

        NodeAssert.strictEqual(v, 1, 'The function should be called only once');
        NodeAssert.strictEqual(triggers, 1, 'The triggered event should be emitted once');
        NodeAssert.strictEqual(Date.now() - startedAt, 2000, 'The function should have been called after the delay.');
    });

    NodeTest.it('Method "cancel" should cancel the scheduled function call', () => {

        const controller = new DebounceController({
            function: () => {},
            delayMs: 1000,
        });

        controller.schedule();
        NodeAssert.strictEqual(controller.isScheduled(), true, 'The function should be scheduled.');
        controller.cancel();
        NodeAssert.strictEqual(controller.isScheduled(), false, 'The function should not be scheduled after cancel.');
    });

    NodeTest.it('Method "callNow" should cancel the scheduled calls', (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setImmediate', 'setTimeout'] });

        let v = 0;
        let triggers = 0;
        let startedAt = Date.now();
        const controller = new DebounceController({
            function: () => {
                v++;
            },
            delayMs: 1000,
        });
        controller.on('triggered', () => { triggers++; });

        controller.schedule();
        controller.schedule();
        controller.schedule();
        controller.schedule();
        controller.schedule();
        controller.callNow();

        ctx.mock.timers.runAll();

        NodeAssert.strictEqual(v, 1, 'The function should be called only once');
        NodeAssert.strictEqual(triggers, 1, 'The triggered event should be emitted once');
        NodeAssert.strictEqual(Date.now() - startedAt, 0, 'The function should have been called immediately.');

        controller.callNow();
        ctx.mock.timers.runAll();

        NodeAssert.strictEqual(v, 2, 'The function should be called only once');
        NodeAssert.strictEqual(triggers, 2, 'The triggered event should be emitted again');
        NodeAssert.strictEqual(Date.now() - startedAt, 0, 'The function should have been called immediately.');
    });

    NodeTest.it('Invalid delay should make error occur', () => {

        for (let i of [-1000, 0, 1.5, NaN, Infinity]) {
            NodeAssert.throws(() => {
                new DebounceController({
                    function: () => {},
                    delayMs: i,
                });
            }, RangeError, 'The delayMs must be greater than 0.');
        }

        for (let i of [-1000, 0, 1.5, NaN, Infinity]) {
            NodeAssert.throws(() => {
                new DebounceController({
                    function: () => {},
                    delayMs: 1000,
                    maxDelayMs: i,
                });
            }, RangeError, 'The maxDelayMs cannot be less than delayMs.');
        }
    });

    NodeTest.it('Error handles', (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setImmediate', 'setTimeout'] });

        const controller = new DebounceController({
            function: () => { throw new Error('Test error'); },
            delayMs: 1000,
        });

        let errors = 0;
        controller.on('error', () => { errors++; });

        controller.schedule();
        ctx.mock.timers.runAll();

        NodeAssert.strictEqual(errors, 1, 'The error event should be emitted once');

        try {

            controller.callNow();
            NodeAssert.fail('The callNow method should throw an error');
        }
        catch (err) {
            NodeAssert.strictEqual(err instanceof Error && err.message, 'Test error', 'The error message should be "Test error"');
        }
    });

    NodeTest.it('Method schedule should run immediately if the elapsed time reach maxDelay', () => {

        let v = 0;
        const controller = new DebounceController({
            function: () => { v++; throw new Error('Test error'); },
            delayMs: 1,
            maxDelayMs: 2
        });

        let errors = 0;
        controller.on('error', () => { errors++; });

        const NOW = Date.now();
        controller.schedule();

        while (Date.now() < NOW + 2) {
            continue;
        }

        controller.schedule();

        NodeAssert.strictEqual(errors, 1, 'The error event should be emitted once');
        NodeAssert.strictEqual(v, 1, 'The function should be called only once');
    });

    NodeTest.it('Functions wrapped by static method wrap should work as method schedule does', (ctx) => {

        ctx.mock.timers.enable({ apis: ['Date', 'setImmediate', 'setTimeout'] });
        let v = 0;
        const fn= DebounceController.wrap({
            function: () => { v++; },
            delayMs: 100,
        });

        fn();

        NodeAssert.strictEqual(v, 0, 'The function should not be called immediately');

        ctx.mock.timers.runAll();

        NodeAssert.strictEqual(v, 1, 'The function should be called after the delay');
    });
});
