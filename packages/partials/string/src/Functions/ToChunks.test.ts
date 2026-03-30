/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { toChunks, toChunksBackward} from './ToChunks.js';

NodeTest.describe('Module String - Function ToChunks', () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    NodeTest.it('B-M-00001: Should return chunks of the specified size (toChunks)', () => {

        NodeAssert.deepStrictEqual(toChunks('abcde', 2), ['ab', 'cd', 'e']);
        NodeAssert.deepStrictEqual(toChunks('abcdefghij', 3), ['abc', 'def', 'ghi', 'j']);
        NodeAssert.deepStrictEqual(toChunks('abcdefghij', 5), ['abcde', 'fghij']);
        NodeAssert.deepStrictEqual(toChunks('abcdefghij', 10), ['abcdefghij']);
        NodeAssert.deepStrictEqual(toChunks('abcdefghi', 10), ['abcdefghi']);
        NodeAssert.deepStrictEqual(toChunks('abcdefghij', 1), ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']);
    });

    NodeTest.it('B-M-00002: Should return chunks of the specified size (toChunksBackward)', () => {

        NodeAssert.deepStrictEqual(toChunksBackward('abcde', 2), ['a', 'bc', 'de']);
        NodeAssert.deepStrictEqual(toChunksBackward('abcdefghij', 3), ['a', 'bcd', 'efg', 'hij']);
        NodeAssert.deepStrictEqual(toChunksBackward('abcdefghij', 5), ['abcde', 'fghij']);
        NodeAssert.deepStrictEqual(toChunksBackward('abcdefghij', 10), ['abcdefghij']);
        NodeAssert.deepStrictEqual(toChunksBackward('abcdefghi', 10), ['abcdefghi']);
        NodeAssert.deepStrictEqual(toChunksBackward('abcdefghij', 1), ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']);
        NodeAssert.deepStrictEqual(toChunksBackward('abcdefghij', 11), ['abcdefghij']);
    });

    // ─── Black-Box: Failure Flow ─────────────────────────

    NodeTest.it('B-F-00001: Should throw exception if chunk size is not a positive integer (toChunks)', () => {

        for (const invalidSize of [0, -1, 1.5, NaN, Infinity]) {

            NodeAssert.throws(
                () => toChunks('abc', invalidSize),
                (e: unknown) => {
                    NodeAssert.ok(e instanceof RangeError, `Expected RangeError for size=${invalidSize}`);
                    NodeAssert.strictEqual((e as RangeError).message, 'Chunk size must be a positive integer.');
                    return true;
                },
            );
        }
    });

    NodeTest.it('B-F-00002: Should throw exception if chunk size is not a positive integer (toChunksBackward)', () => {

        for (const invalidSize of [0, -1, 1.5, NaN, Infinity]) {

            NodeAssert.throws(
                () => toChunksBackward('abc', invalidSize),
                (e: unknown) => {
                    NodeAssert.ok(e instanceof RangeError, `Expected RangeError for size=${invalidSize}`);
                    NodeAssert.strictEqual((e as RangeError).message, 'Chunk size must be a positive integer.');
                    return true;
                },
            );
        }
    });

    // ─── Black-Box: Edge Cases ───────────────────────────

    NodeTest.it('B-E-00001: Should return empty if the string is empty (toChunks)', () => {

        NodeAssert.deepStrictEqual(toChunks('', 1), []);
        NodeAssert.deepStrictEqual(toChunks('', 1000), []);
    });

    NodeTest.it('B-E-00002: Should return empty if the string is empty (toChunksBackward)', () => {

        NodeAssert.deepStrictEqual(toChunksBackward('', 1), []);
        NodeAssert.deepStrictEqual(toChunksBackward('', 1000), []);
    });
});
