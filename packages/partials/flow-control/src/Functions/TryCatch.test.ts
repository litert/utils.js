/* eslint-disable */
import * as NodeTest from 'node:test';
import NodeTimer from 'node:timers/promises';
import * as NodeAssert from 'node:assert';
import { tryCatch } from './TryCatch.js';

NodeTest.describe('Module flow-control - Function TryCatch', () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    NodeTest.it('B-M-00001: Should work with all sync callbacks', () => {

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

            NodeAssert.ok(e instanceof Error);
            NodeAssert.strictEqual((e as Error).message, '1');
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
        }, (e: unknown) => {
            NodeAssert.ok(e instanceof Error);
            NodeAssert.strictEqual((e as Error).message, '2');
            return true;
        });
        NodeAssert.throws(function() {

            tryCatch({
                try: () => { throw new Error('1'); },
                catch: () => { throw new Error('2'); },
                finally: () => { finallyCalled++; finallyValue = '2333'; },
            });
        }, (e: unknown) => {
            NodeAssert.ok(e instanceof Error);
            NodeAssert.strictEqual((e as Error).message, '2');
            return true;
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

    NodeTest.it('B-M-00002: Should work with async finally callbacks', async () => {

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

            NodeAssert.ok(e instanceof Error);
            NodeAssert.strictEqual((e as Error).message, '1');
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

            NodeAssert.ok(e instanceof Error);
            NodeAssert.strictEqual((e as Error).message, '2');
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

    NodeTest.it('B-M-00003: Should work with async try', async () => {

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

            NodeAssert.ok(e instanceof Error);
            NodeAssert.strictEqual((e as Error).message, '1');
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

    NodeTest.it('B-M-00004: Should work with async catch', async () => {

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

            NodeAssert.ok(e instanceof Error);
            NodeAssert.strictEqual((e as Error).message, '1');
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

    NodeTest.it('B-M-00005: Should work with all async', async () => {

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

            NodeAssert.ok(e instanceof Error);
            NodeAssert.strictEqual((e as Error).message, '1');
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

    NodeTest.it('B-M-00006: Should return the async catch result when sync try throws and there is no finally', async () => {

        NodeAssert.strictEqual(await tryCatch({
            try: () => { throw new Error('oops'); },
            catch: async (e) => {
                await NodeTimer.setTimeout(1);
                return (e as Error).message;
            },
        }), 'oops');
    });

    NodeTest.it('B-M-00007: Should return the try result after awaiting async finally when async try succeeds', async () => {

        let finallyValue = '';
        NodeAssert.strictEqual(await tryCatch({
            try: async () => { await NodeTimer.setTimeout(1); return 123; },
            catch: () => 456,
            finally: async () => { await NodeTimer.setTimeout(1); finallyValue = 'done'; },
        }), 123);
        NodeAssert.strictEqual(finallyValue, 'done');
    });

    NodeTest.it('B-M-00008: Should return the catch result after awaiting async finally when async try throws and sync catch succeeds', async () => {

        let finallyValue = '';
        NodeAssert.strictEqual(await tryCatch({
            try: async () => { await NodeTimer.setTimeout(1); throw new Error('1'); },
            catch: () => 456,
            finally: async () => { await NodeTimer.setTimeout(1); finallyValue = 'done'; },
        }), 456);
        NodeAssert.strictEqual(finallyValue, 'done');
    });

    NodeTest.it('B-M-00009: Should return the async catch result after awaiting async finally when sync try throws', async () => {

        let finallyValue = '';
        NodeAssert.strictEqual(await tryCatch({
            try: () => { throw new Error('1'); },
            catch: async () => { await NodeTimer.setTimeout(1); return 456; },
            finally: async () => { await NodeTimer.setTimeout(1); finallyValue = 'done'; },
        }), 456);
        NodeAssert.strictEqual(finallyValue, 'done');
    });

    NodeTest.it('B-M-00010: Should return the try result after awaiting async finally when all callbacks are async and try succeeds', async () => {

        let finallyValue = '';
        NodeAssert.strictEqual(await tryCatch({
            try: async () => { await NodeTimer.setTimeout(1); return 123; },
            catch: async () => { await NodeTimer.setTimeout(1); return 456; },
            finally: async () => { await NodeTimer.setTimeout(1); finallyValue = 'done'; },
        }), 123);
        NodeAssert.strictEqual(finallyValue, 'done');
    });

    NodeTest.it('B-M-00011: Should return the catch result after awaiting async finally when all callbacks are async and try throws', async () => {

        let finallyValue = '';
        NodeAssert.strictEqual(await tryCatch({
            try: async () => { await NodeTimer.setTimeout(1); throw new Error('1'); },
            catch: async () => { await NodeTimer.setTimeout(1); return 456; },
            finally: async () => { await NodeTimer.setTimeout(1); finallyValue = 'done'; },
        }), 456);
        NodeAssert.strictEqual(finallyValue, 'done');
    });

    NodeTest.it('B-M-00012: Should return the catch result after awaiting async finally when sync try throws and sync catch succeeds', async () => {

        let finallyValue = '';
        NodeAssert.strictEqual(await tryCatch({
            try: () => { throw new Error('1'); },
            catch: () => 456,
            finally: async () => { await NodeTimer.setTimeout(1); finallyValue = 'done'; },
        }), 456);
        NodeAssert.strictEqual(finallyValue, 'done');
    });

    // ─── Black-Box: Failure Flow ─────────────────────────

    NodeTest.it('B-F-00001: Should reject with the async finally error when async try succeeds and async finally throws', async () => {

        await NodeAssert.rejects(
            tryCatch({
                try: async () => { await NodeTimer.setTimeout(1); return 123; },
                catch: () => 456,
                finally: async () => { await NodeTimer.setTimeout(1); throw new Error('fin'); },
            }),
            (e: unknown) => {
                NodeAssert.ok(e instanceof Error);
                NodeAssert.strictEqual((e as Error).message, 'fin');
                return true;
            }
        );
    });

    NodeTest.it('B-F-00002: Should reject with the catch error after awaiting async finally when async try throws and sync catch also throws', async () => {

        let finallyValue = '';
        await NodeAssert.rejects(
            tryCatch({
                try: async () => { await NodeTimer.setTimeout(1); throw new Error('1'); },
                catch: () => { throw new Error('2'); },
                finally: async () => { await NodeTimer.setTimeout(1); finallyValue = 'done'; },
            }),
            (e: unknown) => {
                NodeAssert.ok(e instanceof Error);
                NodeAssert.strictEqual((e as Error).message, '2');
                return true;
            }
        );
        NodeAssert.strictEqual(finallyValue, 'done');
    });

    NodeTest.it('B-F-00003: Should reject with the async catch error after awaiting async finally when sync try throws and async catch also throws', async () => {

        let finallyValue = '';
        await NodeAssert.rejects(
            tryCatch({
                try: () => { throw new Error('1'); },
                catch: async () => { await NodeTimer.setTimeout(1); throw new Error('2'); },
                finally: async () => { await NodeTimer.setTimeout(1); finallyValue = 'done'; },
            }),
            (e: unknown) => {
                NodeAssert.ok(e instanceof Error);
                NodeAssert.strictEqual((e as Error).message, '2');
                return true;
            }
        );
        NodeAssert.strictEqual(finallyValue, 'done');
    });

    NodeTest.it('B-F-00004: Should throw the error from sync finally when sync try throws, sync catch succeeds, and sync finally also throws', () => {

        // This test covers the `!isFinalCalled` false branch inside the inner catch (line 217):
        // sync try throws → sync catch runs ok → isFinalCalled=true → finally throws →
        // inner catch fires with isFinalCalled already true → `opts.finally && !isFinalCalled` is false →
        // falls through to `throw e` (the finally error)
        NodeAssert.throws(() => {
            tryCatch({
                try: () => { throw new Error('1'); },
                catch: () => 456,
                finally: () => { throw new Error('final'); },
            });
        }, (e: unknown) => {
            NodeAssert.ok(e instanceof Error);
            NodeAssert.strictEqual((e as Error).message, 'final');
            return true;
        });
    });

    NodeTest.it('B-F-00005: Should reject with the catch error after awaiting async finally when all callbacks are async and both try and catch throw', async () => {

        let finallyValue = '';
        await NodeAssert.rejects(
            tryCatch({
                try: async () => { await NodeTimer.setTimeout(1); throw new Error('1'); },
                catch: async () => { await NodeTimer.setTimeout(1); throw new Error('2'); },
                finally: async () => { await NodeTimer.setTimeout(1); finallyValue = 'done'; },
            }),
            (e: unknown) => {
                NodeAssert.ok(e instanceof Error);
                NodeAssert.strictEqual((e as Error).message, '2');
                return true;
            }
        );
        NodeAssert.strictEqual(finallyValue, 'done');
    });
});
