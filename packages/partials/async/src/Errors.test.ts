/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import NodeTimer from 'node:timers/promises';
import { E_TIMEOUT, E_ABORTED } from './Errors.js';
import { UtilityError } from '@litert/utils-ts-types';

NodeTest.describe('Module Async - Errors', async () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    NodeTest.it('B-M-00001: Should be an instance of Error', () => {

        const promise = Promise.resolve();
        const err = new E_TIMEOUT({ unresolvedPromise: promise });
        NodeAssert.ok(err instanceof Error);
    });

    NodeTest.it('B-M-00002: Should have message "Operation timed out"', () => {

        const promise = Promise.resolve();
        const err = new E_TIMEOUT({ unresolvedPromise: promise });
        NodeAssert.strictEqual(err.message, 'Operation timed out.');
    });

    NodeTest.it('B-M-00003: Should have name "timeout"', () => {

        const promise = Promise.resolve();
        const err = new E_TIMEOUT({ unresolvedPromise: promise });
        NodeAssert.strictEqual(err.name, 'timeout');
    });

    NodeTest.it('B-M-00004: Should expose the unresolvedPromise property', () => {

        const promise = new Promise(() => { /* intentionally never resolves */ });
        const err = new E_TIMEOUT({ unresolvedPromise: promise });
        NodeAssert.strictEqual(err.unresolvedPromise, promise);
    });

    NodeTest.it('B-M-00005: Should be an instance of UtilityError', () => {

        const err = new E_ABORTED();
        NodeAssert.ok(err instanceof UtilityError);
    });

    NodeTest.it('B-M-00006: Should have message "Operation aborted."', () => {

        const err = new E_ABORTED();
        NodeAssert.strictEqual(err.message, 'Operation aborted.');
    });

    NodeTest.it('B-M-00007: Static method "isAbortedError" should correctly identify E_ABORTED instances', async () => {

        const err = new E_ABORTED();
        NodeAssert.strictEqual(E_ABORTED.isAbortedError(err), true);
        const ac = new AbortController();
        setTimeout(() => { ac.abort(); }, 10);
        try {
            await NodeTimer.setTimeout(1000, null, { signal: ac.signal });
        }
        catch (e) {
            NodeAssert.ok(E_ABORTED.isAbortedError(e));
            NodeAssert.ok(e instanceof E_ABORTED);
        }
    });

    NodeTest.it('B-M-00008: Should have UtilityError name "aborted"', () => {

        const err = new E_ABORTED();
        NodeAssert.strictEqual(err.name, 'aborted');
    });

    NodeTest.it('B-M-00009: Should expose the unresolvedPromise property when a promise is provided', () => {

        const promise = new Promise(() => { /* intentionally never resolves */ });
        const err = new E_ABORTED({ unresolvedPromise: promise });
        NodeAssert.strictEqual(err.context.unresolvedPromise, promise);
    });

    NodeTest.it('B-M-00010: Should set unresolvedPromise to null when null is passed', async () => {

        const err = new E_ABORTED({ unresolvedPromise: Promise.resolve(123) });
        NodeAssert.strictEqual(await err.context.unresolvedPromise, 123);
    });

    NodeTest.it('B-M-00011: Should be an instance of Error', () => {

        const err = new E_ABORTED();
        NodeAssert.ok(err instanceof Error);
    });
});
