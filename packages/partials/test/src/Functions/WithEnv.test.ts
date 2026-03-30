/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { withEnv } from './WithEnv.js';

NodeTest.describe('Module Test - Function WithEnv', () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    NodeTest.it('B-M-00001: Should return the callback\'s return value', () => {

        NodeAssert.strictEqual(withEnv({}, () => 42), 42);
    });

    NodeTest.it('B-M-00002: Should set specified env vars before calling the callback', () => {

        let captured: string | undefined;

        withEnv({ WITHENV_TEST_A: 'hello' }, () => {

            captured = process.env['WITHENV_TEST_A'];
        });

        NodeAssert.strictEqual(captured, 'hello');
    });

    NodeTest.it('B-M-00003: Should restore overwritten env vars after the callback returns', () => {

        process.env['WITHENV_TEST_B'] = 'original';

        withEnv({ WITHENV_TEST_B: 'modified' }, () => {});

        NodeAssert.strictEqual(process.env['WITHENV_TEST_B'], 'original');

        delete process.env['WITHENV_TEST_B'];
    });

    NodeTest.it('B-M-00004: Should restore previously absent env vars to undefined after the callback returns', () => {

        delete process.env['WITHENV_TEST_C'];

        withEnv({ WITHENV_TEST_C: 'temp' }, () => {});

        NodeAssert.strictEqual(process.env['WITHENV_TEST_C'], undefined);
    });

    NodeTest.it('B-M-00005: Should set and restore multiple env vars at once', () => {

        process.env['WITHENV_MULTI_A'] = 'a_orig';
        delete process.env['WITHENV_MULTI_B'];

        let capturedA: string | undefined;
        let capturedB: string | undefined;

        withEnv({ WITHENV_MULTI_A: 'a_new', WITHENV_MULTI_B: 'b_new' }, () => {

            capturedA = process.env['WITHENV_MULTI_A'];
            capturedB = process.env['WITHENV_MULTI_B'];
        });

        NodeAssert.strictEqual(capturedA, 'a_new');
        NodeAssert.strictEqual(capturedB, 'b_new');
        NodeAssert.strictEqual(process.env['WITHENV_MULTI_A'], 'a_orig');
        NodeAssert.strictEqual(process.env['WITHENV_MULTI_B'], undefined);

        delete process.env['WITHENV_MULTI_A'];
    });

    NodeTest.it('B-M-00006: Should return a Promise resolving with the callback\'s return value', async () => {

        const result = await withEnv({}, async () => 'async-value');

        NodeAssert.strictEqual(result, 'async-value');
    });

    NodeTest.it('B-M-00007: Should set specified env vars before the async callback executes', async () => {

        let captured: string | undefined;

        await withEnv({ WITHENV_ASYNC_A: 'async-hello' }, async () => {

            captured = process.env['WITHENV_ASYNC_A'];
        });

        NodeAssert.strictEqual(captured, 'async-hello');
    });

    NodeTest.it('B-M-00008: Should restore overwritten env vars after the promise resolves', async () => {

        process.env['WITHENV_ASYNC_B'] = 'original';

        await withEnv({ WITHENV_ASYNC_B: 'modified' }, async () => {});

        NodeAssert.strictEqual(process.env['WITHENV_ASYNC_B'], 'original');

        delete process.env['WITHENV_ASYNC_B'];
    });

    NodeTest.it('B-M-00009: Should restore previously absent env vars to undefined after the promise resolves', async () => {

        delete process.env['WITHENV_ASYNC_C'];

        await withEnv({ WITHENV_ASYNC_C: 'temp' }, async () => {});

        NodeAssert.strictEqual(process.env['WITHENV_ASYNC_C'], undefined);
    });

    // ─── Black-Box: Failure Flow ─────────────────────────

    NodeTest.it('B-F-00001: Should restore env vars if the callback throws', () => {

        process.env['WITHENV_TEST_D'] = 'original';

        try {

            withEnv({ WITHENV_TEST_D: 'modified' }, () => {

                throw new Error('test error');
            });
        }
        catch { /* expected */ }

        NodeAssert.strictEqual(process.env['WITHENV_TEST_D'], 'original');

        delete process.env['WITHENV_TEST_D'];
    });

    NodeTest.it('B-F-00002: Should propagate the error thrown by the callback', () => {

        NodeAssert.throws(
            () => withEnv({}, () => { throw new Error('oops'); }),
            (e: unknown) => {

                NodeAssert.ok(e instanceof Error);
                NodeAssert.strictEqual((e as Error).message, 'oops');
                return true;
            }
        );
    });

    NodeTest.it('B-F-00003: Should restore env vars after the promise rejects', async () => {

        process.env['WITHENV_ASYNC_D'] = 'original';

        try {

            await withEnv({ WITHENV_ASYNC_D: 'modified' }, async () => {

                throw new Error('async error');
            });
        }
        catch { /* expected */ }

        NodeAssert.strictEqual(process.env['WITHENV_ASYNC_D'], 'original');

        delete process.env['WITHENV_ASYNC_D'];
    });

    NodeTest.it('B-F-00004: Should propagate the rejection from the async callback', async () => {

        await NodeAssert.rejects(
            () => withEnv({}, async () => { throw new Error('async oops'); }),
            (e: unknown) => {

                NodeAssert.ok(e instanceof Error);
                NodeAssert.strictEqual((e as Error).message, 'async oops');
                return true;
            }
        );
    });

    // ─── Black-Box: Edge Cases ───────────────────────────

    NodeTest.it('B-E-00001: Should call the callback when the env dict is empty', () => {

        let called = false;

        withEnv({}, () => { called = true; });

        NodeAssert.strictEqual(called, true);
    });

    NodeTest.it('B-E-00002: Should keep env vars set while the async promise is still pending', async () => {

        delete process.env['WITHENV_ASYNC_PENDING'];

        let resolve!: () => void;

        const promise = withEnv(
            { WITHENV_ASYNC_PENDING: 'pending-value' },
            () => new Promise<void>(r => { resolve = r; })
        );

        NodeAssert.strictEqual(process.env['WITHENV_ASYNC_PENDING'], 'pending-value');

        resolve();
        await promise;

        NodeAssert.strictEqual(process.env['WITHENV_ASYNC_PENDING'], undefined);
    });
});
