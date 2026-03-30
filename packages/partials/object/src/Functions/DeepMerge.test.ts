/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { deepMerge } from './DeepMerge.js';

NodeTest.describe('Module Object - Function DeepMerge', () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    NodeTest.it('B-M-00001: Should merge two flat objects', () => {

        NodeAssert.deepStrictEqual(
            deepMerge({ a: 1, b: 2 }, { b: 3, c: 4 }),
            { a: 1, b: 3, c: 4 }
        );
    });

    NodeTest.it('B-M-00002: Should not mutate the original objects', () => {

        const obj1 = { a: 1, b: 2 };
        const obj2 = { b: 99 };

        deepMerge(obj1, obj2);

        NodeAssert.strictEqual(obj1.b, 2);
        NodeAssert.strictEqual(obj2.b, 99);
    });

    NodeTest.it('B-M-00003: Should deep-merge nested objects', () => {

        NodeAssert.deepStrictEqual(
            deepMerge({ x: { a: 1, b: 2 } }, { x: { b: 3, c: 4 } }),
            { x: { a: 1, b: 3, c: 4 } }
        );
    });

    NodeTest.it('B-M-00004: Should deep-merge multiple levels', () => {

        NodeAssert.deepStrictEqual(
            deepMerge({ a: { b: { c: 1 } } }, { a: { b: { d: 2 } } }),
            { a: { b: { c: 1, d: 2 } } }
        );
    });

    NodeTest.it('B-M-00005: Should merge arrays element-wise', () => {

        NodeAssert.deepStrictEqual(
            deepMerge({ arr: [1, 2, 3] }, { arr: [10, 20] }),
            { arr: [10, 20, 3] }
        );
    });

    NodeTest.it('B-M-00006: Should extend target array when source is longer', () => {

        NodeAssert.deepStrictEqual(
            deepMerge({ arr: [1] }, { arr: [10, 20, 30] }),
            { arr: [10, 20, 30] }
        );
    });

    NodeTest.it('B-M-00007: Should deep-merge object elements within arrays', () => {

        NodeAssert.deepStrictEqual(
            deepMerge({ arr: [{ a: 1 }] }, { arr: [{ b: 2 }] }),
            { arr: [{ a: 1, b: 2 }] }
        );
    });

    NodeTest.it('B-M-00008: Should replace the whole array when arrayAsValue is true', () => {

        NodeAssert.deepStrictEqual(
            deepMerge({ arr: [1, 2, 3] }, { arr: [10] }, { arrayAsValue: true }),
            { arr: [10] }
        );
    });

    NodeTest.it('B-M-00009: Should replace nested arrays as values when arrayAsValue is true', () => {

        NodeAssert.deepStrictEqual(
            deepMerge({ a: { arr: [1, 2] } }, { a: { arr: [10] } }, { arrayAsValue: true }),
            { a: { arr: [10] } }
        );
    });

    // ─── Black-Box: Edge Cases ───────────────────────────

    NodeTest.it('B-E-00001: Should return properties from obj1 when obj2 is empty', () => {

        NodeAssert.deepStrictEqual(deepMerge({ a: 1 }, {}), { a: 1 });
    });

    NodeTest.it('B-E-00002: Should return properties from obj2 when obj1 is empty', () => {

        NodeAssert.deepStrictEqual(deepMerge({}, { b: 2 }), { b: 2 });
    });

    NodeTest.it('B-E-00003: Should return an empty object when both inputs are empty', () => {

        NodeAssert.deepStrictEqual(deepMerge({}, {}), {});
    });

    NodeTest.it('B-E-00004: Should overwrite a nested object with a primitive when obj2 has a primitive', () => {

        NodeAssert.deepStrictEqual(
            deepMerge({ a: { b: 1 } }, { a: 42 }),
            { a: 42 }
        );
    });

    NodeTest.it('B-E-00005: Should use a2 element when a1 element is an object but a2 element is a primitive', () => {

        NodeAssert.deepStrictEqual(
            deepMerge({ arr: [{ a: 1 }, { b: 2 }] }, { arr: [42] }),
            { arr: [42, { b: 2 }] }
        );
    });

    NodeTest.it('B-E-00006: Should merge nested arrays within arrays recursively', () => {

        NodeAssert.deepStrictEqual(
            deepMerge({ arr: [[1, 2], [3]] }, { arr: [[10], [20, 30]] }),
            { arr: [[10, 2], [20, 30]] }
        );
    });

    NodeTest.it('B-E-00007: Should treat null in obj1 as empty object when option is set', () => {

        const result = deepMerge(
            { a: null } as any,
            { a: { x: 1 } },
            { nullAsEmptyObject: true }
        );

        // null is treated as {}, so the merge is deepMerge({}, { x: 1 }) = { x: 1 }
        NodeAssert.deepStrictEqual(result.a, { x: 1 });
    });

    NodeTest.it('B-E-00008: Should treat null in obj2 as empty object when option is set', () => {

        const result = deepMerge(
            { a: { x: 1 } },
            { a: null } as any,
            { nullAsEmptyObject: true }
        );

        // null is treated as {}, so the merge is deepMerge({ x: 1 }, {}) = { x: 1 }
        NodeAssert.deepStrictEqual(result.a, { x: 1 });
    });

    NodeTest.it('B-E-00009: Should treat both nulls as empty objects when option is set', () => {

        const result = deepMerge(
            { a: null } as any,
            { a: null } as any,
            { nullAsEmptyObject: true }
        );

        NodeAssert.deepStrictEqual(result.a, null);
    });

    NodeTest.it('B-E-00010: Should not mutate obj2 when nullAsEmptyObject is used', () => {

        // The JSDoc contract states the function must not modify either original object.
        const obj2: { a: null | object } = { a: null };
        deepMerge({ a: { x: 1 } }, obj2 as any, { nullAsEmptyObject: true });
        NodeAssert.strictEqual(obj2.a, null);
    });

    NodeTest.it('B-E-00011: Should include symbol-keyed properties from both objects in the result', () => {

        const s1 = Symbol('s1');
        const s2 = Symbol('s2');
        const obj1 = { [s1]: 1, a: 'from-obj1' };
        const obj2 = { [s2]: 2, a: 'from-obj2' };

        const result = deepMerge(obj1 as any, obj2 as any) as any;

        NodeAssert.strictEqual(result[s1], 1);
        NodeAssert.strictEqual(result[s2], 2);
        NodeAssert.strictEqual(result.a, 'from-obj2');
    });

    NodeTest.it('B-E-00012: Should overwrite a symbol-keyed property when obj2 has the same symbol', () => {

        const s = Symbol('key');
        const result = deepMerge({ [s]: 1 } as any, { [s]: 99 } as any) as any;

        NodeAssert.strictEqual(result[s], 99);
    });

    NodeTest.it('B-E-00013: Should treat null in obj2 as empty object when nullAsEmptyObject is true and obj1 key is an object', () => {

        NodeAssert.deepStrictEqual(
            deepMerge({ a: { x: 1 } }, { a: null as any }, { nullAsEmptyObject: true }),
            { a: { x: 1 } }
        );
    });

    NodeTest.it('B-E-00014: Should keep obj2 value when nullAsEmptyObject is true and obj2 key already has a value', () => {

        // This exercises the ??= skip branch: obj2[k] is already { y: 2 }, so ??= does not assign
        NodeAssert.deepStrictEqual(
            deepMerge({ a: { x: 1 } }, { a: { y: 2 } }, { nullAsEmptyObject: true }),
            { a: { x: 1, y: 2 } }
        );
    });

    NodeTest.it('B-E-00015: Should not apply nullAsEmptyObject when ret[k] is not an object', () => {

        // This exercises the A-true, B-false branch of `opts.nullAsEmptyObject && isObject(ret[k])`:
        // nullAsEmptyObject is true but ret['a'] is 1 (a number), so isObject returns false and
        // the ??= assignment is skipped entirely.
        NodeAssert.deepStrictEqual(
            deepMerge({ a: 1 }, { a: null as any }, { nullAsEmptyObject: true }),
            { a: null }
        );
    });

    NodeTest.it('B-E-00016: Should spread top-level arrays into plain objects when merging', () => {

        // Covers the `Array.isArray(obj1) ? [...obj1]` and `Array.isArray(obj2) ? [...obj2]` branches.
        // getPropertyNames uses Object.getOwnPropertyNames, which includes `length` for arrays.
        NodeAssert.deepStrictEqual(
            deepMerge([1, 2, 3] as any, [4, 5] as any),
            { 0: 4, 1: 5, 2: 3, length: 2 }
        );
    });
});
