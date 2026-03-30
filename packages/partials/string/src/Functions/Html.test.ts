/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { htmlEscape } from './Html.js';

NodeTest.describe('Module String - Function Html', () => {

    const cases: Array<[string, string, string]> = [
        ['&', '&amp;', 'ampersand'],
        ['<', '&lt;', 'less-than'],
        ['>', '&gt;', 'greater-than'],
        ['"', '&quot;', 'double quote'],
        ["'", '&#39;', 'single quote'],
    ];

    // ─── Black-Box: Main Flow ────────────────────────────

    for (const [input, expected, label] of cases) {

        NodeTest.it(`B-M-00001: Should escape ${label}`, () => {

            NodeAssert.strictEqual(htmlEscape(input), expected);
        });
    }

    NodeTest.it('B-M-00002: Should escape all special characters in a combined string', () => {

        NodeAssert.strictEqual(
            htmlEscape('<script>alert("hello & \'world\'")</script>'),
            '&lt;script&gt;alert(&quot;hello &amp; &#39;world&#39;&quot;)&lt;/script&gt;'
        );
    });

    NodeTest.it('B-M-00003: Should escape multiple occurrences of the same character', () => {

        NodeAssert.strictEqual(htmlEscape('a & b & c'), 'a &amp; b &amp; c');
    });

    NodeTest.it('B-M-00004: Should return a plain string unchanged', () => {

        NodeAssert.strictEqual(htmlEscape('hello world'), 'hello world');
    });

    NodeTest.it('B-M-00005: Should apply extra replacement pairs after built-in ones', () => {

        NodeAssert.strictEqual(
            htmlEscape('hello world', [[' ', '&nbsp;']]),
            'hello&nbsp;world'
        );
    });

    NodeTest.it('B-M-00006: Should apply multiple extra replacement pairs', () => {

        NodeAssert.strictEqual(
            htmlEscape('a+b=c', [['+', '&#43;'], ['=', '&#61;']]),
            'a&#43;b&#61;c'
        );
    });

    NodeTest.it('B-M-00007: Should apply built-in escaping before extra replacements', () => {

        // '&' → '&amp;', then 'amp' → 'AMP'
        NodeAssert.strictEqual(
            htmlEscape('&', [['amp', 'AMP']]),
            '&AMP;'
        );
    });

    // ─── Black-Box: Edge Cases ───────────────────────────

    NodeTest.it('B-E-00001: Should return an empty string unchanged', () => {

        NodeAssert.strictEqual(htmlEscape(''), '');
    });

    NodeTest.it('B-E-00002: Should skip extra replacements when the array is empty', () => {

        NodeAssert.strictEqual(htmlEscape('<b>', []), '&lt;b&gt;');
    });

    NodeTest.it('B-E-00003: Should skip extra replacements when undefined', () => {

        NodeAssert.strictEqual(htmlEscape('<b>'), '&lt;b&gt;');
    });
});
