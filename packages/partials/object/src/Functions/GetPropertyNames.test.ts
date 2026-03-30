/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { getPropertyNames } from './GetPropertyNames.js';

NodeTest.describe('Module Object - Function GetPropertyNames', () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    NodeTest.it('B-M-00001: Should get all string-named properties', () => {

        const obj = {
            a: 1,
            b: 2,
            c: 3
        };

        NodeAssert.deepStrictEqual(
            getPropertyNames(obj),
            ['a', 'b', 'c']
        );
    });

    // ─── Black-Box: Failure Flow ─────────────────────────

    NodeTest.it('B-F-00001: Should throw exception if not a valid object', () => {

        NodeAssert.throws(
            () => getPropertyNames(null as any),
            (e: unknown) => {
                NodeAssert.ok(e instanceof TypeError);
                NodeAssert.strictEqual((e as TypeError).message, 'An object is expected by "getPropertyNames" function.');
                return true;
            }
        );
    });

    NodeTest.it('B-F-00002: Should throw TypeError for non-null non-object primitives', () => {

        for (const v of [1, 'str', true, undefined, Symbol('s'), BigInt(1)]) {
            NodeAssert.throws(() => getPropertyNames(v as any), TypeError);
        }
    });

    // ─── Black-Box: Edge Cases ───────────────────────────

    NodeTest.it('B-E-00001: Should get all symbol-named properties', () => {

        const s1 = Symbol('a');
        const s2 = Symbol('b');
        const s3 = Symbol('c');
        const obj = {
            [s1]: 1,
            [s2]: 2,
            [s3]: 3
        };

        NodeAssert.deepStrictEqual(
            getPropertyNames(obj),
            [s1, s2, s3]
        );
    });

    NodeTest.it('B-E-00002: Should get all string-named and symbol-named properties', () => {

        const s1 = Symbol('a');
        const s2 = Symbol('b');
        const s3 = Symbol('c');
        const obj = {
            a: 1,
            b: 2,
            c: 3,
            [s1]: 4,
            [s2]: 5,
            [s3]: 6
        };

        NodeAssert.deepStrictEqual(
            getPropertyNames(obj),
            ['a', 'b', 'c', s1, s2, s3]
        );
    });

    NodeTest.it('B-E-00003: Should return an empty array for an empty object', () => {

        NodeAssert.deepStrictEqual(getPropertyNames({}), []);
    });

    NodeTest.it('B-E-00004: Should not include inherited properties — only own properties', () => {

        const proto = { inherited: 42 };
        const obj = Object.assign(Object.create(proto), { own: 1 }) as { own: number };
        const names = getPropertyNames(obj);

        NodeAssert.ok((names as string[]).includes('own'), '"own" must be present');
        NodeAssert.ok(!(names as string[]).includes('inherited'), '"inherited" must not be present');
    });
});
