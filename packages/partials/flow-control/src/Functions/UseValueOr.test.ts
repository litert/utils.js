/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { useValueOr } from './UseValueOr.js';

NodeTest.describe('Module flow-control - Function UseValueOr', () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    NodeTest.it('B-M-00001: Should return value when check returns true', () => {

        NodeAssert.strictEqual(
            useValueOr(5, (v) => v > 0, -1),
            5
        );
    });

    NodeTest.it('B-M-00002: Should return value for string when check passes', () => {

        NodeAssert.strictEqual(
            useValueOr('hello', (v) => v.length > 0, 'default'),
            'hello'
        );
    });

    NodeTest.it('B-M-00003: Should return value for object when check passes', () => {

        const obj = { x: 1 };
        NodeAssert.strictEqual(
            useValueOr(obj, (v) => v.x === 1, { x: 0 }),
            obj
        );
    });

    NodeTest.it('B-M-00004: Should return elseValue when check returns false', () => {

        NodeAssert.strictEqual(
            useValueOr(-5, (v) => v > 0, 0),
            0
        );
    });

    NodeTest.it('B-M-00005: Should return elseValue for empty string when check fails', () => {

        NodeAssert.strictEqual(
            useValueOr('', (v) => v.length > 0, 'fallback'),
            'fallback'
        );
    });

    NodeTest.it('B-M-00006: Should return elseValue for null-like value when check fails', () => {

        NodeAssert.strictEqual(
            useValueOr(0, (v) => v !== 0, 42),
            42
        );
    });

    // ─── Black-Box: Edge Cases ───────────────────────────

    NodeTest.it('B-E-00001: Should work when value and elseValue are the same', () => {

        NodeAssert.strictEqual(
            useValueOr(1, () => false, 1),
            1
        );
    });

    NodeTest.it('B-E-00002: Should work with a check that always returns false', () => {

        NodeAssert.strictEqual(
            useValueOr(100, () => false, -1),
            -1
        );
    });

    NodeTest.it('B-E-00003: Should work with a check that always returns true', () => {

        NodeAssert.strictEqual(
            useValueOr(100, () => true, -1),
            100
        );
    });

    NodeTest.it('B-E-00004: Should return a falsy value when the check passes', () => {

        NodeAssert.strictEqual(
            useValueOr(0, (v) => v === 0, 1),
            0
        );
    });

    NodeTest.it('B-E-00005: Should pass value, not elseValue, to the check function', () => {

        let received: number | undefined;
        useValueOr(5, (v) => { received = v; return true; }, 99);
        NodeAssert.strictEqual(received, 5);
    });
});
