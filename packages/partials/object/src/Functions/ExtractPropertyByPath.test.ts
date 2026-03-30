/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { extractPropertyByPath } from './ExtractPropertyByPath.js';

NodeTest.describe('Module Object - Function ExtractPropertyByPath', () => {

    const obj = {
        a: {
            b: [
                { c: 42 }
            ],
            k: null
        }
    };

    // ─── Black-Box: Main Flow ────────────────────────────

    NodeTest.it('B-M-00001: Should return the value of a property at a specified path', () => {

        NodeAssert.strictEqual(extractPropertyByPath(obj, '$.a.b[0].c'), 42);
        NodeAssert.strictEqual(extractPropertyByPath(obj, '$.a.b[1].c'), undefined);
        NodeAssert.strictEqual(extractPropertyByPath(obj, '$.a.b[1].c', { defaultValue: 'hello' }), 'hello');
        NodeAssert.strictEqual(extractPropertyByPath(obj, '$.a.b[0].d', { defaultValue: 'hello' }), 'hello');
    });

    NodeTest.it('B-M-00002: Should accept an array of path segments', () => {
        NodeAssert.strictEqual(extractPropertyByPath(obj, ['a', 'b', 0, 'c']), 42);
    });

    // ─── Black-Box: Failure Flow ─────────────────────────

    NodeTest.it('B-F-00001: Should throw an error if non-object is met in the traversal path', () => {

        NodeAssert.throws(() => extractPropertyByPath(obj, '$.a.b[0].c.s', { defaultValue: 'hello' }), Error);
        NodeAssert.throws(() => extractPropertyByPath(obj, '$.a.k.s', { defaultValue: 'hello' }), Error);
    });

    // ─── Black-Box: Edge Cases ───────────────────────────

    NodeTest.it('B-E-00001: Should return itself if an empty path is provided', () => {

        NodeAssert.strictEqual(extractPropertyByPath(obj, '$'), obj);
        NodeAssert.strictEqual(extractPropertyByPath(obj, []), obj);
    });

    NodeTest.it('B-E-00002: Should process undefined as input object', () => {

        NodeAssert.strictEqual(extractPropertyByPath(undefined as any, '$.a.b.c[123]["fff"]'), undefined);
        NodeAssert.strictEqual(extractPropertyByPath(undefined as any, '$.a.b.c[123]["fff"]', { defaultValue: 'default' }), 'default');
        NodeAssert.strictEqual(extractPropertyByPath(undefined as any, ['a', 123], { defaultValue: 'default' }), 'default');
    });

    NodeTest.it('B-E-00003: Should return a falsy defaultValue when the property is missing', () => {

        // The check is `=== undefined`, so 0/false/null/'' must be returned as-is.
        NodeAssert.strictEqual(extractPropertyByPath(obj, '$.a.missing', { defaultValue: 0 }), 0);
        NodeAssert.strictEqual(extractPropertyByPath(obj, '$.a.missing', { defaultValue: false }), false);
        NodeAssert.strictEqual(extractPropertyByPath(obj, '$.a.missing', { defaultValue: null }), null);
        NodeAssert.strictEqual(extractPropertyByPath(obj, '$.a.missing', { defaultValue: '' }), '');
    });
});
