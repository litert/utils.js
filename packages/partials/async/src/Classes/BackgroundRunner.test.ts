/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { sleep } from '../Functions/Sleep.js';
import { BackgroundRunner } from './BackgroundRunner.js';

NodeTest.describe('Module Async - Class BackgroundRunner', async () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    NodeTest.it('B-M-00001: Method run should execute the callback immediately', () => {

        const runner = new BackgroundRunner();
        let executed = false;

        runner.run(async () => {
            executed = true;
            await sleep(1);
        });

        NodeAssert.strictEqual(executed, true);
    });

    await NodeTest.it('B-M-00002: Method runLater should execute the callback after the wait function resolves', async () => {

        const runner = new BackgroundRunner();
        let executed = false;

        runner.runLater(async () => {
            executed = true;
            await sleep(1);
        });

        NodeAssert.strictEqual(executed, false);
        await sleep(5);

        NodeAssert.strictEqual(executed, true);
    });

    await NodeTest.it('B-M-00003: Method runLater could use custom wait function', async () => {

        let flag = 0;
        const waitFn1 = async () => {
            flag = 1;
            await sleep(1);
        };

        const runner = new BackgroundRunner({ waitFn: waitFn1 });

        runner.runLater(async () => {
            await sleep(1);
        });

        await sleep(10);
        NodeAssert.strictEqual(flag, 1);

        const waitFn2 = async () => {
            flag = 2;
            await sleep(1);
        };

        runner.runLater(async () => {
            await sleep(1);
        }, waitFn2);

        await sleep(10);
        NodeAssert.strictEqual(flag, 2);
    });

    await NodeTest.it('B-M-00004: Constructor waitFn option is used as default for runLater', async () => {

        let callbackExecuted = false;
        let waitFnExecuted = false;

        const runner = new BackgroundRunner({
            waitFn: async () => {
                waitFnExecuted = true;
                await sleep(5); // custom delay ensures callback runs after waitFn
            }
        });

        runner.runLater(async () => { callbackExecuted = true; });

        // The waitFn has been invoked synchronously, but the callback should not run yet
        // because waitFn's own async body hasn't resolved
        NodeAssert.strictEqual(callbackExecuted, false, 'Callback should not execute before constructor waitFn resolves');
        NodeAssert.strictEqual(waitFnExecuted, true, 'Constructor waitFn should be invoked synchronously by runLater');

        await sleep(10);

        NodeAssert.strictEqual(callbackExecuted, true, 'Callback should execute after constructor waitFn resolves');
    });

    // ─── Black-Box: Failure Flow ─────────────────────────

    NodeTest.it('B-F-00001: Method run should emit error event if callback throws uncaught exceptions', async () => {

        let lastError: unknown = null;
        const runner = new BackgroundRunner()
            .on('error', (error) => {
                lastError = error as Error;
            });

        runner.run(async () => {
            throw new Error('Test error');
        });

        await sleep(0);

        NodeAssert.ok(lastError instanceof Error, 'lastError should be an Error instance');
        NodeAssert.strictEqual((lastError as Error).message, 'Test error', 'Error message should match');
    });

    NodeTest.it('B-F-00002: Method run should emit error event if callback throws synchronously', async () => {

        let lastError: unknown = null;
        const runner = new BackgroundRunner()
            .on('error', (error) => {
                lastError = error as Error;
            });

        runner.run(() => {
            throw new Error('Test error');
        });

        NodeAssert.ok(lastError instanceof Error, 'lastError should be an Error instance');
        NodeAssert.strictEqual((lastError as Error).message, 'Test error', 'Error message should match');
    });

    await NodeTest.it('B-F-00003: Method runLater should emit error event if callback throws after the wait', async () => {

        let lastError: unknown = null;
        const runner = new BackgroundRunner()
            .on('error', (error) => { lastError = error; });

        runner.runLater(async () => {
            throw new Error('runLater error');
        });

        await sleep(10);

        NodeAssert.ok(lastError instanceof Error, 'lastError should be an Error instance');
        NodeAssert.strictEqual((lastError as Error).message, 'runLater error', 'Error message should match');
    });

});
