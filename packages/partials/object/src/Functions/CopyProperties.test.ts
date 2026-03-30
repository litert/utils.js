/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { copyProperties } from './CopyProperties.js';

NodeTest.describe('Module Object - Function CopyProperties', () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    NodeTest.it('B-M-00001: Should copy listed properties from src to dst', () => {

        const dst = { a: 0, b: 0, c: 0 };
        const src = { a: 1, b: 2, c: 3 };

        copyProperties(dst, src, ['a', 'b']);

        NodeAssert.strictEqual(dst.a, 1);
        NodeAssert.strictEqual(dst.b, 2);
        NodeAssert.strictEqual(dst.c, 0);
    });

    NodeTest.it('B-M-00002: Should copy all properties when all are listed', () => {

        const dst = { x: 0, y: 0 };
        const src = { x: 10, y: 20 };

        copyProperties(dst, src, ['x', 'y']);

        NodeAssert.deepStrictEqual(dst, { x: 10, y: 20 });
    });

    NodeTest.it('B-M-00003: Should copy object references', () => {

        const nested = { value: 42 };
        const dst: { ref: typeof nested | null } = { ref: null };
        const src: Partial<typeof dst> = { ref: nested };

        copyProperties(dst, src, ['ref']);

        NodeAssert.strictEqual(dst.ref, nested);
    });

    // ─── Black-Box: Edge Cases ───────────────────────────

    NodeTest.it('B-E-00001: Should not modify dst when properties list is empty', () => {

        const dst = { a: 1, b: 2 };
        const src = { a: 99, b: 88 };

        copyProperties(dst, src, []);

        NodeAssert.deepStrictEqual(dst, { a: 1, b: 2 });
    });

    NodeTest.it('B-E-00002: Should not overwrite dst property when src value is undefined', () => {

        const dst = { a: 42, b: 7 };
        const src: Partial<typeof dst> = { a: undefined, b: 99 };

        copyProperties(dst, src, ['a', 'b']);

        NodeAssert.strictEqual(dst.a, 42);
        NodeAssert.strictEqual(dst.b, 99);
    });

    NodeTest.it('B-E-00003: Should skip a property entirely when it is absent from src', () => {

        const dst = { a: 1, b: 2 };
        const src: Partial<typeof dst> = {};

        copyProperties(dst, src, ['a', 'b']);

        NodeAssert.deepStrictEqual(dst, { a: 1, b: 2 });
    });

    NodeTest.it('B-E-00004: Should copy null values', () => {

        const dst: { key: string | null } = { key: 'original' };
        const src: Partial<typeof dst> = { key: null };

        copyProperties(dst, src, ['key']);

        NodeAssert.strictEqual(dst.key, null);
    });

    NodeTest.it('B-E-00005: Should copy falsy but non-undefined values (false, 0, empty string)', () => {

        // The guard is `src[k] !== undefined`, so falsy-but-defined values must be copied.
        const dst: { a: number | boolean; b: string; c: number } = { a: 1, b: 'x', c: 1 };
        const src: Partial<typeof dst> = { a: false, b: '', c: 0 };

        copyProperties(dst, src, ['a', 'b', 'c']);

        NodeAssert.strictEqual(dst.a, false);
        NodeAssert.strictEqual(dst.b, '');
        NodeAssert.strictEqual(dst.c, 0);
    });
});
