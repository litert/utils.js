/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { toChunks } from './ToChunks.js';

NodeTest.describe('Module Array - Function ToChunks', () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    NodeTest.it('B-M-00001: Should split an array into equal-size chunks when divisible by chunk size', () => {

        NodeAssert.deepStrictEqual(
            toChunks([1, 2, 3, 4, 5, 6], 3),
            [[1, 2, 3], [4, 5, 6]]
        );
    });

    NodeTest.it('B-M-00002: Should return one chunk when chunkSize equals array length', () => {

        NodeAssert.deepStrictEqual(
            toChunks([1, 2, 3], 3),
            [[1, 2, 3]]
        );
    });

    NodeTest.it('B-M-00003: Should return a partial last chunk when array length is not divisible', () => {

        NodeAssert.deepStrictEqual(
            toChunks([1, 2, 3, 4, 5], 2),
            [[1, 2], [3, 4], [5]]
        );
    });

    NodeTest.it('B-M-00004: Should work with an array of strings', () => {

        NodeAssert.deepStrictEqual(
            toChunks(['a', 'b', 'c', 'd'], 2),
            [['a', 'b'], ['c', 'd']]
        );
    });

    // ─── Black-Box: Failure Flow ─────────────────────────

    NodeTest.it('B-F-00001: Should throw RangeError for chunkSize of 0', () => {

        NodeAssert.throws(
            () => toChunks([1, 2, 3], 0),
            RangeError
        );
    });

    NodeTest.it('B-F-00002: Should throw RangeError for a negative chunkSize', () => {

        NodeAssert.throws(
            () => toChunks([1, 2, 3], -1),
            RangeError
        );
    });

    NodeTest.it('B-F-00003: Should throw RangeError for a non-integer chunkSize', () => {

        NodeAssert.throws(
            () => toChunks([1, 2, 3], 1.5),
            RangeError
        );
    });

    NodeTest.it('B-F-00004: Should throw RangeError for NaN chunkSize', () => {

        NodeAssert.throws(
            () => toChunks([1, 2, 3], NaN),
            RangeError
        );
    });

    NodeTest.it('B-F-00005: Should throw RangeError for Infinity chunkSize', () => {

        NodeAssert.throws(
            () => toChunks([1, 2, 3], Infinity),
            RangeError
        );
    });

    NodeTest.it('B-F-00006: Should throw RangeError for -Infinity chunkSize', () => {

        NodeAssert.throws(
            () => toChunks([1, 2, 3], -Infinity),
            RangeError
        );
    });

    // ─── Black-Box: Edge Cases ───────────────────────────

    NodeTest.it('B-E-00001: Should return chunks with chunkSize of 1', () => {

        NodeAssert.deepStrictEqual(
            toChunks([1, 2, 3], 1),
            [[1], [2], [3]]
        );
    });

    NodeTest.it('B-E-00002: Should return one chunk when chunkSize is larger than array length', () => {

        NodeAssert.deepStrictEqual(
            toChunks([1, 2], 100),
            [[1, 2]]
        );
    });

    NodeTest.it('B-E-00003: Should return an empty array for an empty input', () => {

        NodeAssert.deepStrictEqual(toChunks([], 5), []);
    });

    NodeTest.it('B-E-00004: Should work with a single-element array', () => {

        NodeAssert.deepStrictEqual(toChunks([42], 3), [[42]]);
    });
});
