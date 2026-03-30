/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { pickProperties } from './PickProperties.js';

NodeTest.describe('Module Object - Function PickProperties', () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    NodeTest.it('B-M-00001: Should get all specific properties', () => {

        NodeAssert.deepStrictEqual(
            pickProperties({ a: 1, b: 2, c: 3 }, ['a', 'c']),
            { a: 1, c: 3 }
        );
    });

    // ─── Black-Box: Failure Flow ─────────────────────────

    NodeTest.it('B-F-00001: Should throw exceptions if non-object is passed in', () => {

        NodeAssert.throws(() => { pickProperties(1 as any, []); });
        NodeAssert.throws(() => { pickProperties('1' as any, []); });
        NodeAssert.throws(() => { pickProperties(true as any, []); });
        NodeAssert.throws(() => { pickProperties(undefined as any, []); });
        NodeAssert.throws(() => { pickProperties(Symbol('1') as any, []); });
        NodeAssert.throws(() => { pickProperties(BigInt(1) as any, []); });
    });

    NodeTest.it('B-F-00002: Should throw TypeError with the expected message for non-object inputs', () => {

        const EXPECTED_MSG = 'An object is expected by "pickProperties" function.';

        for (const v of [1, '1', true, undefined, Symbol('1'), BigInt(1)]) {
            NodeAssert.throws(
                () => pickProperties(v as any, []),
                (e: unknown) => {
                    NodeAssert.ok(e instanceof TypeError);
                    NodeAssert.strictEqual((e as TypeError).message, EXPECTED_MSG);
                    return true;
                }
            );
        }
    });

    // ─── Black-Box: Edge Cases ───────────────────────────

    NodeTest.it('B-E-00001: Should get an empty object if no properties are asked for', () => {

        NodeAssert.deepStrictEqual(
            pickProperties({}, []),
            {}
        );
    });

    NodeTest.it('B-E-00002: Should get an empty object if null is passed in', () => {

        NodeAssert.deepStrictEqual(
            pickProperties(null, []),
            {}
        );
    });

    NodeTest.it('B-E-00003: Should return empty object when null is passed with non-empty keys', () => {

        // null hits the early-return before iterating keys.
        NodeAssert.deepStrictEqual(
            pickProperties(null, ['a', 'b'] as any),
            {}
        );
    });

    NodeTest.it('B-E-00004: Should get undefined if asking for non-existent properties', () => {

        NodeAssert.deepStrictEqual(
            pickProperties({ a: 1, b: 2, c: 3 }, ['d', 'e'] as any),
            { d: undefined, e: undefined }
        );
    });
});
