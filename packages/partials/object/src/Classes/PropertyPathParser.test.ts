/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { PropertyPathParser } from './PropertyPathParser.js';

NodeTest.describe('Module Object - Class PropertyPathParser', () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    NodeTest.it('B-M-00001: Should parse a simple property path', () => {
        const parser = new PropertyPathParser();
        NodeAssert.deepStrictEqual(parser.parse('$.a'), ['a']);
        NodeAssert.deepStrictEqual(parser.parse('$.a.'), ['a', '']);
        NodeAssert.deepStrictEqual(parser.parse('$.a s]我fff'), ['a s]我fff']);
        NodeAssert.deepStrictEqual(parser.parse('$.a.b.c'), ['a', 'b', 'c']);
        NodeAssert.deepStrictEqual(parser.parse('$.a."b".c'), ['a', '"b"', 'c']);
    });

    NodeTest.it('B-M-00002: Should parse a property path with brackets', () => {
        const parser = new PropertyPathParser();
        NodeAssert.deepStrictEqual(parser.parse('$["a"]'), ['a']);
        NodeAssert.deepStrictEqual(parser.parse('$[\'a\']'), ['a']);
        NodeAssert.deepStrictEqual(parser.parse('$.a[\'b\']'), ['a', 'b']);
        NodeAssert.deepStrictEqual(parser.parse('$.a["b"]'), ['a', 'b']);
        NodeAssert.deepStrictEqual(parser.parse('$.a["b[]"]'), ['a', 'b[]']);
        NodeAssert.deepStrictEqual(parser.parse('$.a["b "]'), ['a', 'b ']);
    });

    NodeTest.it('B-M-00003: Should parse a property path with array indices', () => {
        const parser = new PropertyPathParser();
        NodeAssert.deepStrictEqual(parser.parse('$.a[0].b[1]'), ['a', 0, 'b', 1]);
        NodeAssert.deepStrictEqual(parser.parse('$.a[0x123].b[0x123].b[0x1_2_3].b[0x1,2,3]'), ['a', 0x123, 'b', 0x123, 'b', 0x123, 'b', 0x123]);
        NodeAssert.deepStrictEqual(parser.parse('$.a[0b101].b[0b111].b[0b1_1_1].b[0b1,1,1]'), ['a', 0b101, 'b', 0b111, 'b', 0b111, 'b', 0b111]);
        NodeAssert.deepStrictEqual(parser.parse('$.a[0o123].b[0o123].b[0o1_2_3].b[0o1,2,3]'), ['a', 0o123, 'b', 0o123, 'b', 0o123, 'b', 0o123]);
        NodeAssert.deepStrictEqual(parser.parse('$.a[123].b[123].b[1_2_3].b[1,2,3]'), ['a', 123, 'b', 123, 'b', 123, 'b', 123]);
        NodeAssert.deepStrictEqual(parser.parse('$[123]'), [123]);
        NodeAssert.deepStrictEqual(parser.parse('$.[123]'), ['', 123]);
        NodeAssert.deepStrictEqual(parser.parse('$.["123"]'), ['', '123']);
    });

    NodeTest.it('B-M-00004: Should parse a property path with escaped characters', () => {
        const parser = new PropertyPathParser();
        NodeAssert.deepStrictEqual(parser.parse('$.a\\.b.c'), ['a.b', 'c']);
        NodeAssert.deepStrictEqual(parser.parse('$.a\\["aaa"]'), ['a["aaa"]']);
        NodeAssert.deepStrictEqual(parser.parse('$.a\\\\'), ['a\\']);
    });

    NodeTest.it('B-M-00005: Should parse a property path with nested array indices', () => {
        const parser = new PropertyPathParser();
        NodeAssert.deepStrictEqual(parser.parse('$.a[0][1].b'), ['a', 0, 1, 'b']);
        NodeAssert.deepStrictEqual(parser.parse('$.a[0][1].b[1234]'), ['a', 0, 1, 'b', 1234]);
    });

    NodeTest.it('B-M-00006: Should parse a property path with single quotes', () => {
        const parser = new PropertyPathParser();
        NodeAssert.deepStrictEqual(parser.parse("$.a['b'].c"), ['a', 'b', 'c']);
        NodeAssert.deepStrictEqual(parser.parse("$.a['b\\'a\"aa']['b\\'a\"aa'].c"), ['a', 'b\'a"aa', 'b\'a"aa', 'c']);
    });

    NodeTest.it('B-M-00007: Should parse a property path with double quotes', () => {
        const parser = new PropertyPathParser();
        NodeAssert.deepStrictEqual(parser.parse('$.a["b"].c'), ['a', 'b', 'c']);
        NodeAssert.deepStrictEqual(parser.parse('$.a["b\\"a\'aa"]["b\\"a\'aa"].c'), ['a', 'b"a\'aa', 'b"a\'aa', 'c']);
    });

    // ─── Black-Box: Failure Flow ─────────────────────────

    NodeTest.it('B-F-00001: Should throw error for unexpected ending', () => {
        const parser = new PropertyPathParser();
        NodeAssert.throws(() => parser.parse('$.a["'), SyntaxError);
        NodeAssert.throws(() => parser.parse('$.a["b'), SyntaxError);
        NodeAssert.throws(() => parser.parse('$.a["b"'), SyntaxError);
        NodeAssert.throws(() => parser.parse('$.a["b].c'), SyntaxError);
        NodeAssert.throws(() => parser.parse('$.a['), SyntaxError);
        NodeAssert.throws(() => parser.parse('$.a[\'aaa'), SyntaxError);
        NodeAssert.throws(() => parser.parse('$.a[\'aaa\''), SyntaxError);
        NodeAssert.throws(() => parser.parse('$.a[123'), SyntaxError);
        NodeAssert.throws(() => parser.parse('$.a\\'), SyntaxError);
        NodeAssert.throws(() => parser.parse('$["a" ]'), SyntaxError);
    });

    NodeTest.it('B-F-00002: Should throw error for unexpected start', () => {
        const parser = new PropertyPathParser();
        NodeAssert.throws(() => parser.parse('$a'), SyntaxError);
        NodeAssert.throws(() => parser.parse('${"a"}'), SyntaxError);
        NodeAssert.throws(() => parser.parse('a'), SyntaxError);
    });

    NodeTest.it('B-F-00003: Should throw error for unexpected digit delimiters', () => {
        const parser = new PropertyPathParser();
        NodeAssert.throws(() => parser.parse('$[1,]'), SyntaxError);
        NodeAssert.throws(() => parser.parse('$[1_]'), SyntaxError);
        NodeAssert.throws(() => parser.parse('$[1__1]'), SyntaxError);
        NodeAssert.throws(() => parser.parse('$[1,,1]'), SyntaxError);
        NodeAssert.throws(() => parser.parse('$[1,_1]'), SyntaxError);
        NodeAssert.throws(() => parser.parse('$[1_,1]'), SyntaxError);
        NodeAssert.throws(() => parser.parse('$[_1]'), SyntaxError);
        NodeAssert.throws(() => parser.parse('$[,1]'), SyntaxError);
        NodeAssert.throws(() => parser.parse('$[s]'), SyntaxError);
    });

    NodeTest.it('B-F-00004: Should throw error for invalid indices', () => {
        const parser = new PropertyPathParser();
        NodeAssert.throws(() => parser.parse('$[111x]'), SyntaxError);
        NodeAssert.throws(() => parser.parse('$[111X]'), SyntaxError);
        NodeAssert.throws(() => parser.parse('$[1p]'), SyntaxError);
        NodeAssert.throws(() => parser.parse('$[11o]'), SyntaxError);
        NodeAssert.throws(() => parser.parse('$[11O]'), SyntaxError);
        NodeAssert.throws(() => parser.parse('$[11b]'), SyntaxError);
        NodeAssert.throws(() => parser.parse('$[11B]'), SyntaxError);
        NodeAssert.throws(() => parser.parse('$[0b2]'), SyntaxError);
        NodeAssert.throws(() => parser.parse('$[0B2]'), SyntaxError);
        NodeAssert.throws(() => parser.parse('$[0o9]'), SyntaxError);
        NodeAssert.throws(() => parser.parse('$[0O9]'), SyntaxError);
    });

    // ─── Black-Box: Edge Cases ───────────────────────────

    NodeTest.it('B-E-00001: Should parse an empty property path', () => {
        const parser = new PropertyPathParser();
        NodeAssert.deepStrictEqual(parser.parse('$'), []);
    });

    NodeTest.it('B-E-00002: Should parse hex indices that use b or B as hex digits', () => {
        const parser = new PropertyPathParser();
        // 'b'/'B' must be treated as valid hex digits; e.g. 0xb = 11, 0x1b = 27.
        NodeAssert.deepStrictEqual(parser.parse('$[0xb]'), [0xb]);
        NodeAssert.deepStrictEqual(parser.parse('$[0xB]'), [0xB]);
        NodeAssert.deepStrictEqual(parser.parse('$[0x1b]'), [0x1b]);
        NodeAssert.deepStrictEqual(parser.parse('$[0xab]'), [0xab]);
    });
});
