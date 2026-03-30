/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { toDict } from './ToDict.js';

NodeTest.describe('Module Array - Function ToDict', () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    NodeTest.it('B-M-00001: Should index objects by a string property', () => {

        const input = [
            { id: 'a', value: 1 },
            { id: 'b', value: 2 },
            { id: 'c', value: 3 },
        ];

        const result = toDict(input, 'id');

        NodeAssert.deepStrictEqual(result, {
            a: { id: 'a', value: 1 },
            b: { id: 'b', value: 2 },
            c: { id: 'c', value: 3 },
        });
    });

    NodeTest.it('B-M-00002: Should index objects by a numeric property', () => {

        const input = [
            { code: 1, label: 'one' },
            { code: 2, label: 'two' },
        ];

        const result = toDict(input, 'code');

        NodeAssert.deepStrictEqual(result, {
            1: { code: 1, label: 'one' },
            2: { code: 2, label: 'two' },
        });
    });

    NodeTest.it('B-M-00003: Should overwrite with the last item when keys collide', () => {

        const input = [
            { id: 'x', value: 1 },
            { id: 'x', value: 2 },
        ];

        const result = toDict(input, 'id');

        NodeAssert.deepStrictEqual(result, { x: { id: 'x', value: 2 } });
    });

    NodeTest.it('B-M-00004: Should index objects using a key function', () => {

        const input = [
            { first: 'John', last: 'Doe' },
            { first: 'Jane', last: 'Smith' },
        ];

        const result = toDict(input, (v) => `${v.first}_${v.last}`);

        NodeAssert.deepStrictEqual(result, {
            'John_Doe': { first: 'John', last: 'Doe' },
            'Jane_Smith': { first: 'Jane', last: 'Smith' },
        });
    });

    NodeTest.it('B-M-00005: Should index objects by a numeric key returned by the function', () => {

        const input = [
            { code: 10, name: 'ten' },
            { code: 20, name: 'twenty' },
        ];

        const result = toDict(input, (v) => v.code);

        NodeAssert.deepStrictEqual(result, {
            10: { code: 10, name: 'ten' },
            20: { code: 20, name: 'twenty' },
        });
    });

    NodeTest.it('B-M-00006: Should overwrite with the last item when function keys collide', () => {

        const input = [
            { id: 1, label: 'first' },
            { id: 1, label: 'second' },
        ];

        const result = toDict(input, (v) => v.id);

        NodeAssert.deepStrictEqual(result, { 1: { id: 1, label: 'second' } });
    });

    NodeTest.it('B-M-00007: Should support symbol keys returned by the key function', () => {

        const sym = Symbol('key');
        const input = [{ value: 42 }];

        const result = toDict(input, () => sym);

        NodeAssert.deepStrictEqual(result[sym], { value: 42 });
    });

    // ─── Black-Box: Edge Cases ───────────────────────────

    NodeTest.it('B-E-00001: Should return an empty object for an empty array', () => {

        NodeAssert.deepStrictEqual(toDict([], 'id' as never), {});
    });

    NodeTest.it('B-E-00002: Should return an empty object for an empty array with function key', () => {

        NodeAssert.deepStrictEqual(toDict([], () => 'key'), {});
    });

    NodeTest.it('B-E-00003: Should handle single-element arrays', () => {

        const input = [{ id: 'only', x: 99 }];
        const result = toDict(input, 'id');

        NodeAssert.deepStrictEqual(result, { only: { id: 'only', x: 99 } });
    });
});
