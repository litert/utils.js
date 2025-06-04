import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { toChunks, toChunksBackward} from './ToChunks';

NodeTest.describe('Function String.toChunks', () => {

    NodeTest.it('Should return empty if the string is empty', () => {

        NodeAssert.deepStrictEqual(toChunks('', 1), []);
        NodeAssert.deepStrictEqual(toChunks('', 1000), []);
    });

    NodeTest.it('Should throw exception if chunk size is not a positive integer', () => {

        NodeAssert.throws(() => toChunks('abc', 0), RangeError);
        NodeAssert.throws(() => toChunks('abc', -1), RangeError);
        NodeAssert.throws(() => toChunks('abc', 1.5), RangeError);
        NodeAssert.throws(() => toChunks('abc', NaN), RangeError);
        NodeAssert.throws(() => toChunks('abc', Infinity), RangeError);
    });

    NodeTest.it('Should return chunks of the specified size', () => {

        NodeAssert.deepStrictEqual(toChunks('abcde', 2), ['ab', 'cd', 'e']);
        NodeAssert.deepStrictEqual(toChunks('abcdefghij', 3), ['abc', 'def', 'ghi', 'j']);
        NodeAssert.deepStrictEqual(toChunks('abcdefghij', 5), ['abcde', 'fghij']);
        NodeAssert.deepStrictEqual(toChunks('abcdefghij', 10), ['abcdefghij']);
        NodeAssert.deepStrictEqual(toChunks('abcdefghi', 10), ['abcdefghi']);
        NodeAssert.deepStrictEqual(toChunks('abcdefghij', 1), ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']);
    });
});

NodeTest.describe('Function String.toChunksBackward', () => {

    NodeTest.it('Should return empty if the string is empty', () => {

        NodeAssert.deepStrictEqual(toChunksBackward('', 1), []);
        NodeAssert.deepStrictEqual(toChunksBackward('', 1000), []);
    });

    NodeTest.it('Should throw exception if chunk size is not a positive integer', () => {

        NodeAssert.throws(() => toChunksBackward('abc', 0), RangeError);
        NodeAssert.throws(() => toChunksBackward('abc', -1), RangeError);
        NodeAssert.throws(() => toChunksBackward('abc', 1.5), RangeError);
        NodeAssert.throws(() => toChunksBackward('abc', NaN), RangeError);
        NodeAssert.throws(() => toChunksBackward('abc', Infinity), RangeError);
    });

    NodeTest.it('Should return chunks of the specified size', () => {

        NodeAssert.deepStrictEqual(toChunksBackward('abcde', 2), ['a', 'bc', 'de']);
        NodeAssert.deepStrictEqual(toChunksBackward('abcdefghij', 3), ['a', 'bcd', 'efg', 'hij']);
        NodeAssert.deepStrictEqual(toChunksBackward('abcdefghij', 5), ['abcde', 'fghij']);
        NodeAssert.deepStrictEqual(toChunksBackward('abcdefghij', 10), ['abcdefghij']);
        NodeAssert.deepStrictEqual(toChunksBackward('abcdefghi', 10), ['abcdefghi']);
        NodeAssert.deepStrictEqual(toChunksBackward('abcdefghij', 1), ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']);
        NodeAssert.deepStrictEqual(toChunksBackward('abcdefghij', 11), ['abcdefghij']);
    });
});
