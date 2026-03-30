/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { randomBetween } from './RandomBetween.js';

NodeTest.describe('Module Number - Function RandomBetween', () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    NodeTest.it('B-M-00001: Should always return values within [min, max) for a positive range', () => {

        const MIN_VALUE = 10;
        const MAX_BOUND = 20;

        for (let i = 0; i < 10_000; i++) {

            const value = randomBetween(MIN_VALUE, MAX_BOUND);

            NodeAssert.ok(value >= MIN_VALUE, `Value ${value} must be >= ${MIN_VALUE}`);
            NodeAssert.ok(value < MAX_BOUND, `Value ${value} must be < ${MAX_BOUND}`);
        }
    });

    NodeTest.it('B-M-00002: Should always return values within [min, max) when min is negative', () => {

        const MIN_VALUE = -10;
        const MAX_BOUND = 5;

        for (let i = 0; i < 10_000; i++) {

            const value = randomBetween(MIN_VALUE, MAX_BOUND);

            NodeAssert.ok(value >= MIN_VALUE, `Value ${value} must be >= ${MIN_VALUE}`);
            NodeAssert.ok(value < MAX_BOUND, `Value ${value} must be < ${MAX_BOUND}`);
        }
    });

    // ─── Black-Box: Failure Flow ─────────────────────────

    NodeTest.it('B-F-00001: Should throw RangeError if the min is greater than max', () => {

        NodeAssert.throws(
            () => randomBetween(10, 5),
            { name: 'RangeError', message: 'The minimum value can not be greater than maximum value.' },
        );
    });

    // ─── Black-Box: Edge Cases ───────────────────────────

    NodeTest.it('B-E-00001: Should return exactly min when min equals max', () => {

        NodeAssert.strictEqual(randomBetween(0, 0), 0);
        NodeAssert.strictEqual(randomBetween(5, 5), 5);
        NodeAssert.strictEqual(randomBetween(-3, -3), -3);
    });
});
