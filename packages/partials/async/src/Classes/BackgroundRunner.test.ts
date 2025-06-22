import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import * as NodeTimer from 'node:timers/promises';
import { BackgroundRunner } from './BackgroundRunner';

NodeTest.describe('Class BackgroundRunner', async () => {

    NodeTest.it('Method run should execute the callback immediately', () => {

        const runner = new BackgroundRunner();
        let executed = false;

        runner.run(async () => {
            executed = true;
            await NodeTimer.setTimeout(1);
        });

        NodeAssert.strictEqual(executed, true);
    });

    NodeTest.it('Method run should emit error event if callback throws uncaught exceptions', async () => {

        let lastError: unknown = null;
        const runner = new BackgroundRunner()
            .on('error', (error) => {
                lastError = error as Error;
            });

        runner.run(async () => {
            throw new Error('Test error');
        });

        await NodeTimer.setImmediate();

        NodeAssert.strictEqual(lastError instanceof Error && lastError.message === 'Test error', true);
    });

    NodeTest.it('Method run should emit error event if callback throws uncaught exceptions', async () => {

        let lastError: unknown = null;
        const runner = new BackgroundRunner()
            .on('error', (error) => {
                lastError = error as Error;
            });

        runner.run(() => {
            throw new Error('Test error');
        });

        NodeAssert.strictEqual(lastError instanceof Error && lastError.message === 'Test error', true);
    });

    await NodeTest.it('Method runLater should execute the callback after the wait function resolves', async () => {

        const runner = new BackgroundRunner();
        let executed = false;

        runner.runLater(async () => {
            executed = true;
            await NodeTimer.setTimeout(1);
        });

        NodeAssert.strictEqual(executed, false);
        await NodeTimer.setTimeout(5);

        NodeAssert.strictEqual(executed, true);
    });

    await NodeTest.it('Method runLater could use custom wait function', async () => {

        let flag = 0;
        const waitFn1 = async () => {
            flag = 1;
            await NodeTimer.setTimeout(1);
        };

        const runner = new BackgroundRunner({ waitFn: waitFn1 });

        runner.runLater(async () => {
            await NodeTimer.setTimeout(1);
        });

        await NodeTimer.setTimeout(10);
        NodeAssert.strictEqual(flag, 1);

        const waitFn2 = async () => {
            flag = 2;
            await NodeTimer.setTimeout(1);
        };

        runner.runLater(async () => {
            await NodeTimer.setTimeout(1);
        }, waitFn2);

        await NodeTimer.setTimeout(10);
        NodeAssert.strictEqual(flag, 2);
    });

});
