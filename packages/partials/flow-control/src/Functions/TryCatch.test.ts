import * as NodeTest from 'node:test';
import * as NodeTimer from 'node:timers/promises';
import * as NodeAssert from 'node:assert';
import { tryCatch } from './TryCatch';

NodeTest.describe('Function FlowControl.tryCatch', () => {

    NodeTest.it('Should work with all sync callbacks', () => {

        let finallyValue = '';
        let finallyCalled = 0;
        let cases = 0;

        NodeAssert.equal(tryCatch({
            try: () => 999,
            catch: () => 456,
        }), 999);

        cases++;
        NodeAssert.equal(tryCatch({
            try: () => 123,
            catch: () => 456,
            finally: () => { finallyCalled++; finallyValue = '1234'; },
        }), 123);

        NodeAssert.equal(finallyValue, '1234');
        NodeAssert.equal(finallyCalled, cases);

        try {
            tryCatch({
                try: () => 123,
                catch: () => 456,
                finally: () => { throw new Error('1'); },
            });

            NodeAssert.fail('Should not reach here.');
        }
        catch (e) {

            NodeAssert.ok(e instanceof Error && e.message === '1');
        }

        NodeAssert.equal(tryCatch({
            try: () => { throw new Error('1'); },
            catch: () => 456,
        }), 456);

        cases++;
        NodeAssert.equal(tryCatch({
            try: () => { throw new Error('1'); },
            catch: () => 777,
            finally: () => { finallyCalled++; finallyValue = '5678'; },
        }), 777);

        NodeAssert.equal(finallyValue, '5678');
        NodeAssert.equal(finallyCalled, cases);

        cases++;
        NodeAssert.throws(function() {

            tryCatch({
                try: () => { throw new Error('1'); },
                catch: () => { throw new Error('2'); },
            });
        });
        NodeAssert.throws(function() {

            tryCatch({
                try: () => { throw new Error('1'); },
                catch: () => { throw new Error('2'); },
                finally: () => { finallyCalled++; finallyValue = '2333'; },
            });
        });

        NodeAssert.equal(finallyValue, '2333');
        NodeAssert.equal(finallyCalled, cases);

        (() => {

            cases++;
            const p = tryCatch({
                try: () => { throw new Error('1'); },
                catch: (e) => { return e; },
                finally: () => { finallyCalled++; finallyValue = '666'; },
            });

            NodeAssert.equal(p instanceof Error, true);
            NodeAssert.equal((p as Error).message, '1');
            NodeAssert.equal(finallyValue, '666');
            NodeAssert.equal(finallyCalled, cases);
        })();
    });

    NodeTest.it('Should work with async finally callbacks', async () => {

        let finallyValue = '';
        let finallyCalled = 0;
        let cases = 0;

        NodeAssert.equal(tryCatch({
            try: () => 999,
            catch: () => 456,
        }), 999);

        cases++;
        NodeAssert.equal(await tryCatch({
            try: () => 123,
            catch: () => 456,
            finally: async () => { await NodeTimer.setTimeout(1); finallyCalled++; finallyValue = '1234'; },
        }), 123);

        NodeAssert.equal(finallyValue, '1234');
        NodeAssert.equal(finallyCalled, cases);

        try {
            await tryCatch({
                try: () => 123,
                catch: () => 456,
                finally: async () => { await NodeTimer.setTimeout(1); throw new Error('1'); },
            });

            NodeAssert.fail('Should not reach here.');
        }
        catch (e) {

            NodeAssert.ok(e instanceof Error && e.message === '1');
        }

        NodeAssert.equal(tryCatch({
            try: () => { throw new Error('1'); },
            catch: () => 456,
        }), 456);

        cases++;
        NodeAssert.equal(await tryCatch({
            try: () => { throw new Error('1'); },
            catch: () => 777,
            finally: async () => { await NodeTimer.setTimeout(1); finallyCalled++; finallyValue = '5678'; },
        }), 777);

        NodeAssert.equal(finallyValue, '5678');
        NodeAssert.equal(finallyCalled, cases);

        cases++;
        try {

            tryCatch({
                try: () => { throw new Error('1'); },
                catch: () => { throw new Error('2'); },
            });

            NodeAssert.fail('Should not reach here.');
        }
        catch (e) {

            NodeAssert.ok(e instanceof Error && e.message === '2');
        }

        try {

            await tryCatch({
                try: () => { throw new Error('1'); },
                catch: () => { throw new Error('2'); },
                finally: async () => { await NodeTimer.setTimeout(1); finallyCalled++; finallyValue = '2333'; },
            });

            NodeAssert.fail('Should not reach here.');
        }
        catch (e) {

            NodeAssert.ok(e instanceof Error && e.message === '2');
        }

        NodeAssert.equal(finallyValue, '2333');
        NodeAssert.equal(finallyCalled, cases);

        await (async () => {

            cases++;
            const p = await tryCatch({
                try: () => { throw new Error('1'); },
                catch: (e) => { return e; },
                finally: async () => { await NodeTimer.setTimeout(1); finallyCalled++; finallyValue = '666'; },
            });

            NodeAssert.equal(p instanceof Error, true);
            NodeAssert.equal((p as Error).message, '1');
            NodeAssert.equal(finallyValue, '666');
            NodeAssert.equal(finallyCalled, cases);
        })();
    });

    NodeTest.it('Should work with async try', async () => {

        let finallyValue = '';
        let finallyCalled = 0;
        let cases = 0;

        NodeAssert.equal(await tryCatch({
            try: async () => {
                await NodeTimer.setTimeout(1);
                return 123;
            },
            catch: () => 456,
        }), 123);

        try {
            await tryCatch({
                try: async () => {
                    await NodeTimer.setTimeout(1);
                    return 123;
                },
                catch: () => 456,
                finally: () => { throw new Error('1'); },
            });

            NodeAssert.fail('Should not reach here.');
        }
        catch (e) {

            NodeAssert.ok(e instanceof Error && e.message === '1');
        }

        cases++;
        NodeAssert.equal(await tryCatch({
            try: async () => {
                await NodeTimer.setTimeout(1);
                return 999;
            },
            catch: () => 456,
            finally: () => { finallyCalled++; finallyValue = '1234'; },
        }), 999);

        NodeAssert.equal(finallyValue, '1234');
        NodeAssert.equal(finallyCalled, cases);

        NodeAssert.equal(await tryCatch({
            try: async () => { await NodeTimer.setTimeout(1); throw new Error('1'); },
            catch: () => 777,
        }), 777);
        cases++;
        NodeAssert.equal(await tryCatch({
            try: async () => { await NodeTimer.setTimeout(1); throw new Error('1'); },
            catch: () => 456,
            finally: () => { finallyCalled++; finallyValue = '5678'; },
        }), 456);

        NodeAssert.equal(finallyValue, '5678');
        NodeAssert.equal(finallyCalled, cases);

        try {

            cases++;
            await tryCatch({
                try: async () => { await NodeTimer.setTimeout(1); throw new Error('1'); },
                catch: () => { throw new Error('2'); },
                finally: () => { finallyCalled++; finallyValue = '2333'; },
            });

            NodeAssert.fail('Should not reach here.');
        }
        catch (e) {

            NodeAssert.equal((e as Error).message, '2');
            NodeAssert.equal(finallyValue, '2333');
            NodeAssert.equal(finallyCalled, cases);
        }

        try {

            await tryCatch({
                try: async () => { await NodeTimer.setTimeout(1); throw new Error('1'); },
                catch: () => { throw new Error('2'); },
            });

            NodeAssert.fail('Should not reach here.');
        }
        catch (e) {

            NodeAssert.equal((e as Error).message, '2');
        }

        await (async () => {

            cases++;
            const p = await tryCatch({
                try: async () => { await NodeTimer.setTimeout(1); throw new Error('1'); },
                catch: (e) => { return e; },
                finally: () => { finallyCalled++; finallyValue = '666'; },
            });

            NodeAssert.equal(p instanceof Error, true);
            NodeAssert.equal((p as Error).message, '1');
            NodeAssert.equal(finallyValue, '666');
            NodeAssert.equal(finallyCalled, cases);
        })();
    });

    NodeTest.it('Should work with async catch', async () => {

        let finallyValue = '';
        let finallyCalled = 0;
        let cases = 0;

        NodeAssert.equal(await tryCatch({
            try: () => 123,
            catch: async () => {
                await NodeTimer.setTimeout(1);
                return 456;
            },
        }), 123);

        try {
            await tryCatch({
                try: () => 123,
                catch: async () => {
                    await NodeTimer.setTimeout(1);
                    return 456;
                },
                finally: () => { throw new Error('1'); },
            });

            NodeAssert.fail('Should not reach here.');
        }
        catch (e) {

            NodeAssert.ok(e instanceof Error && e.message === '1');
        }

        cases++;
        NodeAssert.equal(await tryCatch({
            try: () => 123,
            catch: async () => {
                await NodeTimer.setTimeout(1);
                return 456;
            },
            finally: () => { finallyCalled++; finallyValue = '1234'; },
        }), 123);

        NodeAssert.equal(finallyValue, '1234');
        NodeAssert.equal(finallyCalled, cases);

        cases++;
        NodeAssert.equal(await tryCatch({
            try: () => { throw new Error('1'); },
            catch: async () => {
                await NodeTimer.setTimeout(1);
                return 456;
            },
            finally: () => { finallyCalled++; finallyValue = '5678'; },
        }), 456);

        NodeAssert.equal(finallyValue, '5678');
        NodeAssert.equal(finallyCalled, cases);

        cases++;
        try {

            await tryCatch({
                try: () => { throw new Error('1'); },
                catch: async () => { await NodeTimer.setTimeout(1); throw new Error('2'); },
                finally: () => { finallyCalled++; finallyValue = '2333'; },
            });

            NodeAssert.fail('Should not reach here.');
        }
        catch (e) {

            NodeAssert.equal((e as Error).message, '2');
            NodeAssert.equal(finallyValue, '2333');
            NodeAssert.equal(finallyCalled, cases);
        }
        try {

            await tryCatch({
                try: () => { throw new Error('1'); },
                catch: async () => { await NodeTimer.setTimeout(1); throw new Error('2'); },
            });

            NodeAssert.fail('Should not reach here.');
        }
        catch (e) {

            NodeAssert.equal((e as Error).message, '2');
        }

        await (async () => {

            cases++;
            const p = await tryCatch({
                try: () => { throw new Error('1'); },
                catch: async (e) => { await NodeTimer.setTimeout(1); return e; },
                finally: () => { finallyCalled++; finallyValue = '666'; },
            });

            NodeAssert.equal(p instanceof Error, true);
            NodeAssert.equal((p as Error).message, '1');
            NodeAssert.equal(finallyValue, '666');
            NodeAssert.equal(finallyCalled, cases);
        })();
    });

    NodeTest.it('Should work with all async', async () => {

        let finallyValue = '';
        let finallyCalled = 0;
        let cases = 0;

        NodeAssert.equal(await tryCatch({
            try: async () => {
                await NodeTimer.setTimeout(1);
                return 123;
            },
            catch: async () => {
                await NodeTimer.setTimeout(1);
                return 456;
            },
        }), 123);

        try {
            await tryCatch({
                try: async () => {
                    await NodeTimer.setTimeout(1);
                    return 123;
                },
                catch: async () => {
                    await NodeTimer.setTimeout(1);
                    return 456;
                },
                finally: () => { throw new Error('1'); },
            });

            NodeAssert.fail('Should not reach here.');
        }
        catch (e) {

            NodeAssert.ok(e instanceof Error && e.message === '1');
        }

        cases++;
        NodeAssert.equal(await tryCatch({
            try: async () => {
                await NodeTimer.setTimeout(1);
                return 123;
            },
            catch: async () => {
                await NodeTimer.setTimeout(1);
                return 456;
            },
            finally: () => { finallyCalled++; finallyValue = '1234'; },
        }), 123);

        NodeAssert.equal(finallyValue, '1234');
        NodeAssert.equal(finallyCalled, cases);

        cases++;
        NodeAssert.equal(await tryCatch({
            try: async () => { await NodeTimer.setTimeout(1); throw new Error('1'); },
            catch: async () => {
                await NodeTimer.setTimeout(1);
                return 456;
            },
            finally: () => { finallyCalled++; finallyValue = '5678'; },
        }), 456);

        NodeAssert.equal(finallyValue, '5678');
        NodeAssert.equal(finallyCalled, cases);

        cases++;
        try {

            await tryCatch({
                try: async () => { await NodeTimer.setTimeout(1); throw new Error('1'); },
                catch: async () => { await NodeTimer.setTimeout(1); throw new Error('2'); },
                finally: () => { finallyCalled++; finallyValue = '2333'; },
            });

            NodeAssert.fail('Should not reach here.');
        }
        catch (e) {

            NodeAssert.equal((e as Error).message, '2');
            NodeAssert.equal(finallyValue, '2333');
            NodeAssert.equal(finallyCalled, cases);
        }
        try {

            await tryCatch({
                try: async () => { await NodeTimer.setTimeout(1); throw new Error('1'); },
                catch: async () => { await NodeTimer.setTimeout(1); throw new Error('2'); },
            });

            NodeAssert.fail('Should not reach here.');
        }
        catch (e) {

            NodeAssert.equal((e as Error).message, '2');
        }

        await (async () => {

            cases++;
            const p = await tryCatch({
                try: async () => { await NodeTimer.setTimeout(1); throw new Error('1'); },
                catch: async (e) => { await NodeTimer.setTimeout(1); return e; },
                finally: () => { finallyCalled++; finallyValue = '666'; },
            });

            NodeAssert.equal(p instanceof Error, true);
            NodeAssert.equal((p as Error).message, '1');
            NodeAssert.equal(finallyValue, '666');
            NodeAssert.equal(finallyCalled, cases);
        })();
    });
});
