/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { getConstructor } from './GetConstructor.js';

NodeTest.describe('Module Object - Function GetConstructor', () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    NodeTest.it('B-M-00001: Should return the constructor of a object created from a class', () => {

        class A {}
        class B {}

        const a = new A();

        NodeAssert.strictEqual(getConstructor(a), A);
        NodeAssert.strictEqual(getConstructor(a) === B, false);
    });

    NodeTest.it('B-M-00002: Should return Object of a object created literally', () => {

        NodeAssert.strictEqual(getConstructor({ a: 'string' }), Object);
    });

    NodeTest.it('B-M-00003: Should return Array of an array object', () => {

        NodeAssert.strictEqual(getConstructor([]), Array);
        NodeAssert.strictEqual(getConstructor([1, 2, 3]), Array);
        NodeAssert.strictEqual(getConstructor(new Array(1, 2, 3)), Array);
        NodeAssert.strictEqual(getConstructor(new Array()), Array);
        NodeAssert.strictEqual(getConstructor(new Array(1)), Array);
        NodeAssert.strictEqual(getConstructor(new Array(1, 2)), Array);
    });

    NodeTest.it('B-M-00004: Should return the subclass constructor, not the parent constructor', () => {

        class Base {}
        class Sub extends Base {}

        NodeAssert.strictEqual(getConstructor(new Sub()), Sub);
        NodeAssert.notStrictEqual(getConstructor(new Sub()), Base);
    });

    // ─── Black-Box: Failure Flow ─────────────────────────

    NodeTest.it('B-F-00001: Should throw exceptions if non-object is passed in', () => {

        NodeAssert.throws(() => { getConstructor(1); });
        NodeAssert.throws(() => { getConstructor(true); });
        NodeAssert.throws(() => { getConstructor(null); });
        NodeAssert.throws(() => { getConstructor(undefined); });
        NodeAssert.throws(() => { getConstructor('string'); });
        NodeAssert.throws(() => { getConstructor(Symbol('symbol')); });
        NodeAssert.throws(() => { getConstructor(BigInt(1)); });
    });

    NodeTest.it('B-F-00002: Should throw TypeError with the expected message for non-object inputs', () => {

        const EXPECTED_MSG = 'An object is expected by "getConstructor" function.';

        for (const v of [1, true, null, undefined, 'string', Symbol('s'), BigInt(1)]) {
            NodeAssert.throws(
                () => getConstructor(v as any),
                (e: unknown) => {
                    NodeAssert.ok(e instanceof TypeError);
                    NodeAssert.strictEqual((e as TypeError).message, EXPECTED_MSG);
                    return true;
                }
            );
        }
    });

    // ─── Black-Box: Edge Cases ───────────────────────────

    NodeTest.it('B-E-00001: Should correctly return the constructor even with a property named "constructor"', () => {

        class A {}

        const a = new A();

        Object.assign(a, {
            constructor: 123,
        });

        NodeAssert.strictEqual(getConstructor(a), A);
    });

    NodeTest.it('B-E-00002: Should throw for an object with a null prototype', () => {

        // Object.getPrototypeOf(Object.create(null)) returns null;
        // null.constructor then throws at runtime.
        NodeAssert.throws(() => getConstructor(Object.create(null)));
    });
});
