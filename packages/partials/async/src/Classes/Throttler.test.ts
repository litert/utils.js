import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import * as NodeTimer from 'node:timers/promises';
import { Throttler } from './Throttler';

NodeTest.describe('Class Throttler', async () => {

    await NodeTest.it('Wrapper Class: All calls during the current call done should get the same result', async () => {

        const throttler = new Throttler(
            async (input: number) => {
                await NodeTimer.setTimeout(20);
                return input * 2;
            },
            (input) => `${input}`,
        );

        const pr = throttler.call(1);
        const results = await Promise.all([
            pr,
            throttler.call(1),
            throttler.call(1),
            throttler.call(1),
        ]);

        NodeAssert.deepStrictEqual(results, [2, 2, 2, 2]);
    });

    await NodeTest.it('Wrapper Class: All calls during the current call done should get the same error result', async () => {

        const throttler = new Throttler(
            async (input: number) => {
                await NodeTimer.setTimeout(20);
                throw new Error(`Error in call with input: ${input}`);
            },
            (input) => `${input}`
        );

        const pr = throttler.call(1);
        const results = await Promise.allSettled([
            pr,
            throttler.call(1),
            throttler.call(1),
            throttler.call(1),
        ]);

        NodeAssert.deepStrictEqual(results[0].status, 'rejected');
        NodeAssert.deepStrictEqual(results[1].status, 'rejected');
        NodeAssert.deepStrictEqual(results[2].status, 'rejected');
        NodeAssert.deepStrictEqual(results[3].status, 'rejected');
    });

    await NodeTest.it('Wrapper Class: calls with different args should not bother each other', async () => {

        const throttler = new Throttler(
            async (input: number) => {
                await NodeTimer.setTimeout(20);
                return input * 2;
            },
            (input) => `${input}`
        );

        const pr = throttler.call(1);
        const results = await Promise.allSettled([
            pr,
            throttler.call(1),
            throttler.call(2),
            throttler.call(2),
        ]);

        NodeAssert.strictEqual(results[0].status, 'fulfilled');
        NodeAssert.strictEqual(results[1].status, 'fulfilled');
        NodeAssert.strictEqual(results[2].status, 'fulfilled');
        NodeAssert.strictEqual(results[3].status, 'fulfilled');
        NodeAssert.strictEqual(results[0].value, 2);
        NodeAssert.strictEqual(results[1].value, 2);
        NodeAssert.strictEqual(results[2].value, 4);
        NodeAssert.strictEqual(results[3].value, 4);
    });

    await NodeTest.it('Wrapper Class: null call ID maker ignores args affection', async () => {

        const throttler = new Throttler(
            async (input: number) => {
                await NodeTimer.setTimeout(20);
                return input * 2;
            },
            null,
        );

        const pr = throttler.call(1);
        const results = await Promise.allSettled([
            pr,
            throttler.call(1),
            throttler.call(2),
            throttler.call(2),
        ]);

        NodeAssert.strictEqual(results[0].status, 'fulfilled');
        NodeAssert.strictEqual(results[1].status, 'fulfilled');
        NodeAssert.strictEqual(results[2].status, 'fulfilled');
        NodeAssert.strictEqual(results[3].status, 'fulfilled');
        NodeAssert.strictEqual(results[0].value, 2);
        NodeAssert.strictEqual(results[1].value, 2);
        NodeAssert.strictEqual(results[2].value, 2);
        NodeAssert.strictEqual(results[3].value, 2);
    });

    await NodeTest.it('Wrapper Class: A call after one call done should starts a new call', async () => {

        const throttler = new Throttler(
            async (input: number) => {
                await NodeTimer.setTimeout(10);
                if (input < 100) {
                    return Date.now();
                }

                throw new Error(`Input too large: ${input} ${Date.now()}`);
            },
            (input) => `${input}`,
        );

        const r1 = await throttler.call(1);
        const r2 = await throttler.call(1);

        NodeAssert.notStrictEqual(r1, r2, 'The results of the two calls should not be the same');

        let errMsg1: string = '';
        let errMsg2: string = '';

        try {

            await throttler.call(100);
            NodeAssert.fail('Expected an error to be thrown for input 100');
        }
        catch (err) {
            errMsg1 = (err as Error).message;
            NodeAssert.strictEqual(errMsg1.startsWith('Input too large: 100'), true);
        }

        try {

            await throttler.call(100);
            NodeAssert.fail('Expected an error to be thrown for input 100');
        }
        catch (err) {
            errMsg2 = (err as Error).message;
            NodeAssert.strictEqual(errMsg2.startsWith('Input too large: 100'), true);
        }

        NodeAssert.notStrictEqual(errMsg1, errMsg2, 'The error messages should be different for the two calls');

        NodeAssert.deepStrictEqual(await throttler.call(1) > r2, true);
    });

    await NodeTest.it('Wrapped Function: All calls during the current call done should get the same result', async () => {

        const fn = Throttler.wrap(
            async (input: number) => {
                await NodeTimer.setTimeout(20);
                return input * 2;
            },
            (input) => `${input}`,
        );

        const pr = fn(1);
        const results = await Promise.all([
            pr,
            fn(1),
            fn(1),
            fn(1),
        ]);

        NodeAssert.deepStrictEqual(results, [2, 2, 2, 2]);
    });

    await NodeTest.it('Wrapped Function: All calls during the current call done should get the same error result', async () => {

        const fn = Throttler.wrap(
            async (input: number) => {
                await NodeTimer.setTimeout(20);
                throw new Error(`Error in call with input: ${input}`);
            },
            (input) => `${input}`,
        );

        const pr = fn(1);
        const results = await Promise.allSettled([
            pr,
            fn(1),
            fn(1),
            fn(1),
        ]);

        NodeAssert.deepStrictEqual(results[0].status, 'rejected');
        NodeAssert.deepStrictEqual(results[1].status, 'rejected');
        NodeAssert.deepStrictEqual(results[2].status, 'rejected');
        NodeAssert.deepStrictEqual(results[3].status, 'rejected');
    });

    await NodeTest.it('Wrapped Function: A call after one call done should starts a new call', async () => {

        const fn = Throttler.wrap(
            async (input: number) => {
                await NodeTimer.setTimeout(10);
                if (input < 100) {
                    return Date.now();
                }

                throw new Error(`Input too large: ${input} ${Date.now()}`);
            },
            (input) => `${input}`,
        );

        const r1 = await fn(1);
        const r2 = await fn(1);

        NodeAssert.notStrictEqual(r1, r2, 'The results of the two calls should not be the same');

        let errMsg1: string = '';
        let errMsg2: string = '';

        try {

            await fn(100);
            NodeAssert.fail('Expected an error to be thrown for input 100');
        }
        catch (err) {
            errMsg1 = (err as Error).message;
            NodeAssert.strictEqual(errMsg1.startsWith( 'Input too large: 100'), true);
        }

        try {

            await fn(100);
            NodeAssert.fail('Expected an error to be thrown for input 100');
        }
        catch (err) {
            errMsg2 = (err as Error).message;
            NodeAssert.strictEqual(errMsg2.startsWith( 'Input too large: 100'), true);
        }

        NodeAssert.notStrictEqual(errMsg1, errMsg2, 'The error messages should be different for the two calls');

        NodeAssert.strictEqual(await fn(1) > r2, true);
    });

});
