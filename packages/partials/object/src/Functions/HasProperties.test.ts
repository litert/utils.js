/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { hasProperties } from './HasProperties.js';

NodeTest.describe('Module Object - Function HasProperties', () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    NodeTest.it('B-M-00001: Should return true when all requested properties exist', () => {

        NodeAssert.strictEqual(
            hasProperties({ a: 1, b: 2, c: 3 }, ['a', 'b']),
            true
        );
    });

    NodeTest.it('B-M-00002: Should return true when checking a single property that exists', () => {

        NodeAssert.strictEqual(
            hasProperties({ x: 0 }, ['x']),
            true
        );
    });

    NodeTest.it('B-M-00003: Should return false when at least one property is missing', () => {

        NodeAssert.strictEqual(
            hasProperties({ a: 1 }, ['a', 'b'] as any),
            false
        );
    });

    NodeTest.it('B-M-00004: Should return false when all properties are missing', () => {

        NodeAssert.strictEqual(
            hasProperties({}, ['x', 'y'] as any),
            false
        );
    });

    // ─── Black-Box: Edge Cases ───────────────────────────

    NodeTest.it('B-E-00001: Should return true even when the property value is undefined', () => {

        NodeAssert.strictEqual(
            hasProperties({ key: undefined }, ['key']),
            true
        );
    });

    NodeTest.it('B-E-00002: Should return true even when the property value is null', () => {

        NodeAssert.strictEqual(
            hasProperties({ key: null }, ['key']),
            true
        );
    });

    NodeTest.it('B-E-00003: Should return false for an empty properties list', () => {

        NodeAssert.strictEqual(hasProperties({ a: 1 }, []), false);
    });

    NodeTest.it('B-E-00004: Should work with inherited properties (in operator)', () => {

        class Base {
            public get inherited(): number { return 1; }
        }

        const obj = new Base();
        NodeAssert.strictEqual(hasProperties(obj, ['inherited']), true);
    });

    NodeTest.it('B-E-00005: Should work with symbol keys', () => {

        const sym = Symbol('test');
        const obj = { [sym]: 42 };

        NodeAssert.strictEqual(hasProperties(obj as any, [sym as any]), true);
        NodeAssert.strictEqual(hasProperties({} as any, [sym as any]), false);
    });
});
