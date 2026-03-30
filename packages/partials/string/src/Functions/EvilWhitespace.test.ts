/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import {
    includeEvilWhitespaceChars,
    includeEvilSpaceChars,
    replaceEvilWhitespaceChars,
    replaceEvilSpaceChars,
} from './EvilWhitespace.js';

NodeTest.describe('Module String - Function EvilWhitespace', () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    NodeTest.it('B-M-00001: Should return false for a plain ASCII string', () => {

        NodeAssert.strictEqual(includeEvilWhitespaceChars('hello world'), false);
    });

    NodeTest.it('B-M-00002: Should return true for a string with \\u0000 (NUL)', () => {

        NodeAssert.strictEqual(includeEvilWhitespaceChars('abc\u0000def'), true);
    });

    NodeTest.it('B-M-00003: Should return true for a string with \\u000B (vertical tab)', () => {

        NodeAssert.strictEqual(includeEvilWhitespaceChars('abc\u000Bdef'), true);
    });

    NodeTest.it('B-M-00004: Should return true for a string with \\u000C (form feed)', () => {

        NodeAssert.strictEqual(includeEvilWhitespaceChars('abc\u000Cdef'), true);
    });

    NodeTest.it('B-M-00005: Should return true for a string with \\u0080 (PAD)', () => {

        NodeAssert.strictEqual(includeEvilWhitespaceChars('abc\u0080def'), true);
    });

    NodeTest.it('B-M-00006: Should return true for a string with \\u200B (zero width space)', () => {

        NodeAssert.strictEqual(includeEvilWhitespaceChars('abc\u200Bdef'), true);
    });

    NodeTest.it('B-M-00007: Should return false for a string with normal whitespace (\\t, \\n, \\r, space)', () => {

        NodeAssert.strictEqual(includeEvilWhitespaceChars('\t\n\r hello'), false);
    });

    NodeTest.it('B-M-00008: Should remove evil whitespace characters by default', () => {

        NodeAssert.strictEqual(replaceEvilWhitespaceChars('abc\u0000def'), 'abcdef');
    });

    NodeTest.it('B-M-00009: Should replace evil whitespace characters with a custom string', () => {

        NodeAssert.strictEqual(replaceEvilWhitespaceChars('abc\u200Bdef', '_'), 'abc_def');
    });

    NodeTest.it('B-M-00010: Should replace all occurrences', () => {

        NodeAssert.strictEqual(
            replaceEvilWhitespaceChars('\u0001a\u0002b\u0003', ''),
            'ab'
        );
    });

    NodeTest.it('B-M-00011: Should return the original string if no evil characters are found', () => {

        NodeAssert.strictEqual(replaceEvilWhitespaceChars('hello world'), 'hello world');
    });

    NodeTest.it('B-M-00012: IncludeEvilSpaceChars should be the same function as includeEvilWhitespaceChars', () => {

        NodeAssert.strictEqual(includeEvilSpaceChars, includeEvilWhitespaceChars);
    });

    NodeTest.it('B-M-00013: ReplaceEvilSpaceChars should be the same function as replaceEvilWhitespaceChars', () => {

        NodeAssert.strictEqual(replaceEvilSpaceChars, replaceEvilWhitespaceChars);
    });

    // ─── Black-Box: Edge Cases ───────────────────────────

    NodeTest.it('B-E-00001: Should return false for an empty string', () => {

        NodeAssert.strictEqual(includeEvilWhitespaceChars(''), false);
    });

    NodeTest.it('B-E-00002: Should return false for a string ending at \\u007E (last safe ASCII printable)', () => {

        NodeAssert.strictEqual(includeEvilWhitespaceChars('\u007E'), false);
    });

    NodeTest.it('B-E-00003: Should return false for \\u00A1 (inverted exclamation, just above evil range)', () => {

        NodeAssert.strictEqual(includeEvilWhitespaceChars('\u00A1'), false);
    });

    NodeTest.it('B-E-00004: Should return true for \\u0008 (upper boundary of \\u0000-\\u0008 range)', () => {

        NodeAssert.strictEqual(includeEvilWhitespaceChars('abc\u0008def'), true);
    });

    NodeTest.it('B-E-00005: Should return true for \\u000E (lower boundary of \\u000E-\\u001F range)', () => {

        NodeAssert.strictEqual(includeEvilWhitespaceChars('abc\u000Edef'), true);
    });

    NodeTest.it('B-E-00006: Should return true for \\u001F (upper boundary of \\u000E-\\u001F range)', () => {

        NodeAssert.strictEqual(includeEvilWhitespaceChars('abc\u001Fdef'), true);
    });

    NodeTest.it('B-E-00007: Should return true for \\u00A0 (upper boundary of \\u0080-\\u00A0 range)', () => {

        NodeAssert.strictEqual(includeEvilWhitespaceChars('abc\u00A0def'), true);
    });

    NodeTest.it('B-E-00008: Should return true for \\u200F (upper boundary of \\u2000-\\u200F range)', () => {

        NodeAssert.strictEqual(includeEvilWhitespaceChars('abc\u200Fdef'), true);
    });

    NodeTest.it('B-E-00009: Should correctly reset regex state across consecutive calls', () => {

        NodeAssert.strictEqual(includeEvilWhitespaceChars('abc\u0001def'), true);
        NodeAssert.strictEqual(includeEvilWhitespaceChars('hello'), false);
        NodeAssert.strictEqual(includeEvilWhitespaceChars('abc\u0002def'), true);
        NodeAssert.strictEqual(includeEvilWhitespaceChars('world'), false);
    });

    NodeTest.it('B-E-00010: Should return an empty string when all characters are evil', () => {

        NodeAssert.strictEqual(replaceEvilWhitespaceChars('\u0001\u0002\u0003'), '');
    });

    NodeTest.it('B-E-00011: Should do nothing on an empty string', () => {

        NodeAssert.strictEqual(replaceEvilWhitespaceChars(''), '');
    });
});
