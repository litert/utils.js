/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { splitIntoLines, toUnixString, toWindowsString, toMacString } from './Lines.js';

NodeTest.describe('Module String - Function Lines', () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    NodeTest.it('B-M-00001: Should split on Unix line endings (\\n)', () => {

        NodeAssert.deepStrictEqual(splitIntoLines('a\nb\nc'), ['a', 'b', 'c']);
    });

    NodeTest.it('B-M-00002: Should split on Windows line endings (\\r\\n)', () => {

        NodeAssert.deepStrictEqual(splitIntoLines('a\r\nb\r\nc'), ['a', 'b', 'c']);
    });

    NodeTest.it('B-M-00003: Should split on old Mac line endings (\\r)', () => {

        NodeAssert.deepStrictEqual(splitIntoLines('a\rb\rc'), ['a', 'b', 'c']);
    });

    NodeTest.it('B-M-00004: Should split on mixed line endings', () => {

        NodeAssert.deepStrictEqual(splitIntoLines('a\r\nb\nc\rd'), ['a', 'b', 'c', 'd']);
    });

    NodeTest.it('B-M-00005: Should support a custom string delimiter', () => {

        NodeAssert.deepStrictEqual(splitIntoLines('a|b|c', '|'), ['a', 'b', 'c']);
    });

    NodeTest.it('B-M-00006: Should support a custom RegExp delimiter', () => {

        NodeAssert.deepStrictEqual(splitIntoLines('a--b---c', /--+/), ['a', 'b', 'c']);
    });

    NodeTest.it('B-M-00007: Should convert \\r\\n to \\n', () => {

        NodeAssert.strictEqual(toUnixString('a\r\nb'), 'a\nb');
    });

    NodeTest.it('B-M-00008: Should convert \\r to \\n', () => {

        NodeAssert.strictEqual(toUnixString('a\rb'), 'a\nb');
    });

    NodeTest.it('B-M-00009: Should leave \\n unchanged', () => {

        NodeAssert.strictEqual(toUnixString('a\nb'), 'a\nb');
    });

    NodeTest.it('B-M-00010: Should handle mixed line endings for toUnixString', () => {

        NodeAssert.strictEqual(toUnixString('a\r\nb\rc\nd'), 'a\nb\nc\nd');
    });

    NodeTest.it('B-M-00011: Should convert \\n to \\r\\n', () => {

        NodeAssert.strictEqual(toWindowsString('a\nb'), 'a\r\nb');
    });

    NodeTest.it('B-M-00012: Should convert \\r to \\r\\n', () => {

        NodeAssert.strictEqual(toWindowsString('a\rb'), 'a\r\nb');
    });

    NodeTest.it('B-M-00013: Should not double-convert existing \\r\\n', () => {

        NodeAssert.strictEqual(toWindowsString('a\r\nb'), 'a\r\nb');
    });

    NodeTest.it('B-M-00014: Should handle mixed line endings for toWindowsString', () => {

        NodeAssert.strictEqual(toWindowsString('a\nb\rc\r\nd'), 'a\r\nb\r\nc\r\nd');
    });

    NodeTest.it('B-M-00015: Should convert \\n to \\r', () => {

        NodeAssert.strictEqual(toMacString('a\nb'), 'a\rb');
    });

    NodeTest.it('B-M-00016: Should convert \\r\\n to \\r', () => {

        NodeAssert.strictEqual(toMacString('a\r\nb'), 'a\rb');
    });

    NodeTest.it('B-M-00017: Should leave \\r unchanged', () => {

        NodeAssert.strictEqual(toMacString('a\rb'), 'a\rb');
    });

    NodeTest.it('B-M-00018: Should handle mixed line endings for toMacString', () => {

        NodeAssert.strictEqual(toMacString('a\r\nb\nc\rd'), 'a\rb\rc\rd');
    });

    // ─── Black-Box: Edge Cases ───────────────────────────

    NodeTest.it('B-E-00001: Should return a single-element array for a string with no line endings', () => {

        NodeAssert.deepStrictEqual(splitIntoLines('hello'), ['hello']);
    });

    NodeTest.it('B-E-00002: Should return two elements with a trailing newline', () => {

        NodeAssert.deepStrictEqual(splitIntoLines('hello\n'), ['hello', '']);
    });

    NodeTest.it('B-E-00003: Should return an array with one empty string for an empty input', () => {

        NodeAssert.deepStrictEqual(splitIntoLines(''), ['']);
    });

    NodeTest.it('B-E-00004: Should return an empty string unchanged for toUnixString', () => {

        NodeAssert.strictEqual(toUnixString(''), '');
    });

    NodeTest.it('B-E-00005: Should return an empty string unchanged for toWindowsString', () => {

        NodeAssert.strictEqual(toWindowsString(''), '');
    });

    NodeTest.it('B-E-00006: Should return an empty string unchanged for toMacString', () => {

        NodeAssert.strictEqual(toMacString(''), '');
    });
});
