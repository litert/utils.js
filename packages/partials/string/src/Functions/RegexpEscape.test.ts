/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { regexpEscape } from './RegexpEscape.js';

NodeTest.describe('Module String - Function RegexpEscape', () => {

    const SPECIAL_CHARS = ['.', '*', '+', '?', '^', '$', '{', '}', '(', ')', '|', '[', ']', '/', '\\'];

    // ─── Black-Box: Main Flow ────────────────────────────

    for (const ch of SPECIAL_CHARS) {

        NodeTest.it(`B-M-00001: Should escape '${ch}'`, () => {

            const escaped = regexpEscape(ch);
            const re = new RegExp(`^${escaped}$`);
            NodeAssert.ok(re.test(ch), `Escaped form "${escaped}" should match the literal character`);
        });
    }

    NodeTest.it('B-M-00002: Should return a plain alphanumeric string unchanged', () => {

        NodeAssert.strictEqual(regexpEscape('hello123'), 'hello123');
    });

    NodeTest.it('B-M-00003: Should escape a URL-like string so it can be used as a literal pattern', () => {

        const url = 'https://example.com/path?q=1&x=2';
        const escaped = regexpEscape(url);
        const re = new RegExp(escaped);
        NodeAssert.ok(re.test(url));
    });

    NodeTest.it('B-M-00004: Should escape a regex-heavy string', () => {

        const input = '.*+?^${}()|[]\\';
        const escaped = regexpEscape(input);
        const re = new RegExp(escaped);
        NodeAssert.ok(re.test(input));
    });

    // ─── Black-Box: Edge Cases ───────────────────────────

    NodeTest.it('B-E-00001: Should return an empty string unchanged', () => {

        NodeAssert.strictEqual(regexpEscape(''), '');
    });
});
