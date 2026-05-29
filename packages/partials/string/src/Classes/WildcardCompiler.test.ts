/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { WildcardCompiler } from './WildcardCompiler.js';

NodeTest.describe('Module String - Class WildcardCompiler', () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    NodeTest.describe('Options disableQuestionMark', () => {

        NodeTest.it('B-M-00001: The default value of disableQuestionMark should be false', () => {
            const compiler = new WildcardCompiler();
            NodeAssert.strictEqual(compiler.disableQuestionMark, false);
        });

        NodeTest.it('B-M-00002: The disableQuestionMark should be as it is set', () => {
            NodeAssert.strictEqual(new WildcardCompiler({ disableQuestionMark: true }).disableQuestionMark, true);
            NodeAssert.strictEqual(new WildcardCompiler({ disableQuestionMark: false }).disableQuestionMark, false);
        });

        NodeTest.it('B-M-00003: Should treat question mark as a normal character when disableQuestionMark is true', () => {
            const compiler = new WildcardCompiler({ disableQuestionMark: true });
            const pattern = compiler.compile('t?st');
            NodeAssert.ok(pattern.test('t?st'));
            NodeAssert.ok(!pattern.test('test'));
        });
    });

    NodeTest.describe('Method compileToString', () => {

        NodeTest.it('B-M-01001: Should return a string', () => {

            const compiler = new WildcardCompiler();
            const pattern = compiler.compileToString('test');
            NodeAssert.strictEqual(typeof pattern, 'string');
        });

        NodeTest.it('B-M-01002: Should return a valid RegExp pattern string', () => {

            const compiler = new WildcardCompiler();
            const pattern = compiler.compileToString('test*');
            NodeAssert.doesNotThrow(() => new RegExp(pattern));
        });

        NodeTest.it('B-M-01003: Should merge consecutive asterisks into one', () => {

            const compiler = new WildcardCompiler();
            const pattern = compiler.compileToString('*test**test***test');
            NodeAssert.strictEqual(pattern, '.*\\x74est.*\\x74est.*\\x74est$');
        });

        NodeTest.it('B-M-01004: Should merge consecutive question marks into one', () => {

            const compiler = new WildcardCompiler();
            const pattern = compiler.compileToString('??t?test??test???test');
            NodeAssert.strictEqual(pattern, '^.{2}\\x74.\\x74est.{2}\\x74est.{3}\\x74est$');
        });

        NodeTest.it('B-M-01005: Should handle mixed wildcards correctly', () => {

            const compiler = new WildcardCompiler();
            const pattern = compiler.compileToString('test?*test');
            NodeAssert.strictEqual(pattern, '^\\x74est..*\\x74est$');
        });

        NodeTest.it('B-M-01006: Empty pattern should match empty string', () => {

            const compiler = new WildcardCompiler();
            const pattern = compiler.compileToString('');
            NodeAssert.strictEqual(pattern, '^$');
        });

        NodeTest.it('B-M-01007: Single question mark should work as expected', () => {

            const compiler = new WildcardCompiler();
            const pattern = compiler.compileToString('?');
            NodeAssert.strictEqual(pattern, '^.$');
        });

        NodeTest.it('B-M-01008: Multiple question marks should work as expected', () => {

            const compiler = new WildcardCompiler();
            const pattern = compiler.compileToString('??????');
            NodeAssert.strictEqual(pattern, '^.{6}$');
        });

        NodeTest.it('B-M-01009: Single asterisk should work as expected', () => {

            const compiler = new WildcardCompiler();
            const pattern = compiler.compileToString('*');
            NodeAssert.strictEqual(pattern, '.*');
        });

        NodeTest.it('B-M-01010: Pattern starting with * should not have ^ anchor', () => {

            const compiler = new WildcardCompiler();
            const pattern = compiler.compileToString('*test');
            NodeAssert.ok(pattern.startsWith('.*'), `Expected pattern to start with ".*", got: ${pattern}`);
            NodeAssert.ok(!pattern.startsWith('^'), `Expected pattern NOT to start with "^", got: ${pattern}`);
        });

        NodeTest.it('B-M-01011: Pattern ending with * should not have $ anchor', () => {

            const compiler = new WildcardCompiler();
            const pattern = compiler.compileToString('test*');
            NodeAssert.ok(pattern.endsWith('.*'), `Expected pattern to end with ".*", got: ${pattern}`);
            NodeAssert.ok(!pattern.endsWith('$'), `Expected pattern NOT to end with "$", got: ${pattern}`);
        });

        NodeTest.it('B-M-01012: Pattern surrounded by * on both sides should have neither ^ nor $ anchor', () => {

            const compiler = new WildcardCompiler();
            const pattern = compiler.compileToString('*test*');
            NodeAssert.ok(pattern.startsWith('.*'), `Expected pattern to start with ".*", got: ${pattern}`);
            NodeAssert.ok(pattern.endsWith('.*'), `Expected pattern to end with ".*", got: ${pattern}`);
        });

        NodeTest.it('B-M-01013: Pattern ? immediately followed by * should produce ^..*', () => {

            const compiler = new WildcardCompiler();
            const pattern = compiler.compileToString('?*');
            NodeAssert.strictEqual(pattern, '^..*');
        });

        NodeTest.it('B-M-01014: Pattern * immediately followed by ? should produce .*.$', () => {

            const compiler = new WildcardCompiler();
            const pattern = compiler.compileToString('*?');
            NodeAssert.strictEqual(pattern, '.*.$');
        });

        NodeTest.it('B-M-01015: With disableQuestionMark=true, ? should be treated as a literal character', () => {

            const compiler = new WildcardCompiler({ disableQuestionMark: true });
            // The result should be a valid pattern that matches the literal "?"
            const pattern = compiler.compileToString('t?st');
            NodeAssert.ok(new RegExp(pattern).test('t?st'), 'Should match literal t?st');
            NodeAssert.ok(!new RegExp(pattern).test('test'), 'Should NOT match test');
        });

        NodeTest.it('B-M-01016: With disableQuestionMark=true, only * acts as wildcard in compileToString', () => {

            const compiler = new WildcardCompiler({ disableQuestionMark: true });
            const pattern = compiler.compileToString('t?st*');
            NodeAssert.ok(pattern.endsWith('.*'), `Expected pattern to end with ".*", got: ${pattern}`);
            NodeAssert.ok(new RegExp(pattern).test('t?stABC'), 'Should match t?stABC');
            NodeAssert.ok(!new RegExp(pattern).test('testABC'), 'Should NOT match testABC');
        });

        // ─── Black-Box: Edge Cases ───────────────────────────

        NodeTest.it('B-E-01001: Regex special characters in the pattern should be treated as literals', () => {

            const compiler = new WildcardCompiler();
            const regex = new RegExp(compiler.compileToString('hello.world'));
            NodeAssert.ok(regex.test('hello.world'), 'Should match literal hello.world');
            NodeAssert.ok(!regex.test('helloXworld'), 'Should NOT match helloXworld (dot is literal)');
        });

        NodeTest.it('B-E-01002: Regex special characters ( ) [ ] ^ $ + in pattern should be treated as literals', () => {

            const compiler = new WildcardCompiler();
            const cases: Array<[string, string, string]> = [
                ['(a)', '(a)', 'b'],
                ['a+b', 'a+b', 'ab'],
                ['a^b', 'a^b', 'aXb'],
                ['a$b', 'a$b', 'aXb'],
            ];
            for (const [wildcardPattern, shouldMatch, shouldNotMatch] of cases) {
                const regex = new RegExp(compiler.compileToString(wildcardPattern));
                NodeAssert.ok(regex.test(shouldMatch), `Pattern "${wildcardPattern}" should match "${shouldMatch}"`);
                NodeAssert.ok(!regex.test(shouldNotMatch), `Pattern "${wildcardPattern}" should NOT match "${shouldNotMatch}"`);
            }
        });

        NodeTest.it('B-E-01003: Pattern consisting only of multiple asterisks should equal single *', () => {

            const compiler = new WildcardCompiler();
            NodeAssert.strictEqual(compiler.compileToString('**'), '.*');
            NodeAssert.strictEqual(compiler.compileToString('***'), '.*');
            NodeAssert.strictEqual(compiler.compileToString('****'), '.*');
        });

        NodeTest.it('B-E-01004: Pattern consisting only of multiple question marks should merge into .{n}', () => {

            const compiler = new WildcardCompiler();
            NodeAssert.strictEqual(compiler.compileToString('???'), '^.{3}$');
            NodeAssert.strictEqual(compiler.compileToString('????'), '^.{4}$');
        });

        // ─── Black-Box: Update Compatibility ─────────────────

        NodeTest.it('B-U-01001: Should preserve compileToString output patterns for representative inputs', () => {

            /**
             * @undocumented
             * Captures the current compileToString output across a diverse set of
             * wildcard patterns. If a compatible change causes any of these to fail,
             * the change may have unintended side effects.
             */
            const compiler = new WildcardCompiler();
            const cases: Array<[string, string]> = [
                ['',          '^$'],
                ['*',         '.*'],
                ['?',         '^.$'],
                ['??',        '^.{2}$'],
                ['???',       '^.{3}$'],
                ['?*',        '^..*'],
                ['*?',        '.*.$'],
                ['**',        '.*'],
                ['***',       '.*'],
            ];
            for (const [input, expected] of cases) {
                NodeAssert.strictEqual(
                    compiler.compileToString(input), expected,
                    `input: ${JSON.stringify(input)}`
                );
            }
        });
    });

    NodeTest.describe('Method compile', () => {

        NodeTest.it('B-M-02001: Should return a RegExp object', () => {

            const compiler = new WildcardCompiler();
            const regex = compiler.compile('test');
            NodeAssert.strictEqual(regex instanceof RegExp, true);
        });

        NodeTest.it('B-M-02002: * wildcard should match zero or more characters', () => {

            const compiler = new WildcardCompiler();
            const regex = compiler.compile('test*');
            NodeAssert.ok(regex.test('test'),       'Should match "test" (zero chars after)');
            NodeAssert.ok(regex.test('test123'),    'Should match "test123"');
            NodeAssert.ok(regex.test('test hello'), 'Should match "test hello"');
        });

        NodeTest.it('B-M-02003: * wildcard should not match when required prefix is absent', () => {

            const compiler = new WildcardCompiler();
            const regex = compiler.compile('test*');
            NodeAssert.ok(!regex.test('tes'),   'Should NOT match "tes" (missing t)');
            NodeAssert.ok(!regex.test('hello'), 'Should NOT match "hello"');
            NodeAssert.ok(!regex.test(''),      'Should NOT match empty string');
        });

        NodeTest.it('B-M-02004: ? wildcard should match exactly one character', () => {

            const compiler = new WildcardCompiler();
            const regex = compiler.compile('t?st');
            NodeAssert.ok(regex.test('test'), 'Should match "test"');
            NodeAssert.ok(regex.test('tast'), 'Should match "tast"');
            NodeAssert.ok(regex.test('t1st'), 'Should match "t1st"');
        });

        NodeTest.it('B-M-02005: ? wildcard should not match zero or two characters', () => {

            const compiler = new WildcardCompiler();
            const regex = compiler.compile('t?st');
            NodeAssert.ok(!regex.test('tst'),   'Should NOT match "tst" (zero chars for ?)');
            NodeAssert.ok(!regex.test('teest'), 'Should NOT match "teest" (two chars for ?)');
        });

        NodeTest.it('B-M-02006: Combining * and ? wildcards should work correctly', () => {

            const compiler = new WildcardCompiler();
            const regex = compiler.compile('t?st*');
            NodeAssert.ok(regex.test('test'),       'Should match "test"');
            NodeAssert.ok(regex.test('testABC'),    'Should match "testABC"');
            NodeAssert.ok(regex.test('tast123'),    'Should match "tast123"');
            NodeAssert.ok(!regex.test('tst'),       'Should NOT match "tst"');
            NodeAssert.ok(!regex.test('hello'),     'Should NOT match "hello"');
        });

        NodeTest.it('B-M-02007: Leading * should match any prefix', () => {

            const compiler = new WildcardCompiler();
            const regex = compiler.compile('*end');
            NodeAssert.ok(regex.test('end'),        'Should match "end" (zero prefix)');
            NodeAssert.ok(regex.test('theend'),     'Should match "theend"');
            NodeAssert.ok(regex.test('some end'),   'Should match "some end"');
            NodeAssert.ok(!regex.test('ending'),    'Should NOT match "ending"');
        });

        NodeTest.it('B-M-02008: * alone should match any string including empty', () => {

            const compiler = new WildcardCompiler();
            const regex = compiler.compile('*');
            NodeAssert.ok(regex.test(''),           'Should match empty string');
            NodeAssert.ok(regex.test('anything'),   'Should match "anything"');
            NodeAssert.ok(regex.test('hello world'), 'Should match strings with spaces');
        });

        // ─── Black-Box: Edge Cases ───────────────────────────

        NodeTest.it('B-E-02001: Empty pattern should match only the empty string', () => {

            const compiler = new WildcardCompiler();
            const regex = compiler.compile('');
            NodeAssert.ok(regex.test(''),       'Should match empty string');
            NodeAssert.ok(!regex.test(' '),     'Should NOT match single space');
            NodeAssert.ok(!regex.test('a'),     'Should NOT match "a"');
        });

        NodeTest.it('B-E-02002: Single ? should match exactly one character', () => {

            const compiler = new WildcardCompiler();
            const regex = compiler.compile('?');
            NodeAssert.ok(regex.test('a'),  'Should match single char "a"');
            NodeAssert.ok(regex.test('1'),  'Should match single char "1"');
            NodeAssert.ok(!regex.test(''), 'Should NOT match empty string');
            NodeAssert.ok(!regex.test('ab'), 'Should NOT match two chars "ab"');
        });

        NodeTest.it('B-E-02003: Special regex characters in pattern should be treated as literals', () => {

            const compiler = new WildcardCompiler();
            const cases: Array<[string, string, string]> = [
                ['hello.world', 'hello.world', 'helloXworld'],
                ['a(b)c',       'a(b)c',       'abc'],
                ['x[0]',        'x[0]',        'x0'],
                ['a+b',         'a+b',         'ab'],
            ];
            for (const [pattern, shouldMatch, shouldNotMatch] of cases) {
                const regex = compiler.compile(pattern);
                NodeAssert.ok(regex.test(shouldMatch),    `Pattern "${pattern}" should match "${shouldMatch}"`);
                NodeAssert.ok(!regex.test(shouldNotMatch), `Pattern "${pattern}" should NOT match "${shouldNotMatch}"`);
            }
        });

        NodeTest.it('B-E-02004: disableQuestionMark=true with compile should treat ? as literal', () => {

            const compiler = new WildcardCompiler({ disableQuestionMark: true });
            const regex = compiler.compile('t?st');
            NodeAssert.ok(regex.test('t?st'),  'Should match literal "t?st"');
            NodeAssert.ok(!regex.test('test'), 'Should NOT match "test"');
            NodeAssert.ok(!regex.test('tst'),  'Should NOT match "tst"');
        });

        // ─── Black-Box: Update Compatibility ─────────────────

        NodeTest.it('B-U-02001: Should preserve matching behavior for representative wildcard patterns', () => {

            /**
             * @undocumented
             * Captures the current match/no-match behavior across a wide range of
             * wildcard patterns and input strings. Failures here indicate an
             * unintended regression in a compatible change.
             */
            const compiler = new WildcardCompiler();

            type Case = { pattern: string; matches: string[]; rejects: string[] };
            const cases: Case[] = [
                {
                    pattern: '*',
                    matches: ['', 'a', 'abc', 'hello world'],
                    rejects: [],
                },
                {
                    pattern: '?',
                    matches: ['a', 'z', '1', ' '],
                    rejects: ['', 'ab'],
                },
                {
                    pattern: '',
                    matches: [''],
                    rejects: ['a', ' '],
                },
                {
                    pattern: 'hello',
                    matches: ['hello'],
                    rejects: ['Hello', 'hell', 'helloo', ''],
                },
                {
                    pattern: 'hello*',
                    matches: ['hello', 'hello world', 'helloABC'],
                    rejects: ['hell', 'world', ''],
                },
                {
                    pattern: '*world',
                    matches: ['world', 'hello world', 'myworld'],
                    rejects: ['worlds', 'worl', ''],
                },
                {
                    pattern: '*hello*',
                    matches: ['hello', 'say hello now', 'hello!', 'xhellox'],
                    rejects: ['hell', 'world', ''],
                },
                {
                    pattern: 'h?llo',
                    matches: ['hello', 'hallo', 'h1llo'],
                    rejects: ['hllo', 'heello', 'hello!'],
                },
                {
                    pattern: '??',
                    matches: ['ab', '12', '  '],
                    rejects: ['', 'a', 'abc'],
                },
                {
                    pattern: 'a*b*c',
                    matches: ['abc', 'aXbc', 'abXc', 'aXbXc'],
                    rejects: ['ab', 'ac', 'bc', ''],
                },
            ];

            for (const { pattern, matches, rejects } of cases) {
                const regex = compiler.compile(pattern);
                for (const s of matches) {
                    NodeAssert.ok(regex.test(s), `Pattern "${pattern}" should match "${s}"`);
                }
                for (const s of rejects) {
                    NodeAssert.ok(!regex.test(s), `Pattern "${pattern}" should NOT match "${s}"`);
                }
            }
        });
    });

    // ─── White-Box Tests ─────────────────────────────────

    NodeTest.describe('White-Box: _findNextWildcardIndex', () => {

        NodeTest.it('W-M-00001: When ? appears before *, ? position is returned first', () => {

            // Pattern "?*abc": ? is at 0, * is at 1.
            // _findNextWildcardIndex returns min(1, 0) = 0, so ? is processed before *.
            // The compiled pattern must start with "^." (anchored single-char wildcard) not ".*".
            const compiler = new WildcardCompiler();
            const pattern = compiler.compileToString('?*abc');
            NodeAssert.ok(pattern.startsWith('^.'), `Expected "^." prefix, got: ${pattern}`);
        });

        NodeTest.it('W-M-00002: When * appears before ?, * position is returned first', () => {

            // Pattern "*?abc": * is at 0, ? is at 1.
            // _findNextWildcardIndex returns min(0, 1) = 0, so * is processed before ?.
            // The compiled pattern must start with ".*" (no ^ anchor).
            const compiler = new WildcardCompiler();
            const pattern = compiler.compileToString('*?abc');
            NodeAssert.ok(pattern.startsWith('.*'), `Expected ".*" prefix, got: ${pattern}`);
        });

        NodeTest.it('W-M-00003: When disableQuestionMark=true, ? is never returned as a wildcard index', () => {

            // With disableQuestionMark the ? path inside _findNextWildcardIndex is
            // forced to INDEX_MISSING, so only * can act as a wildcard.
            const compiler = new WildcardCompiler({ disableQuestionMark: true });
            const regex = compiler.compile('?*suffix');
            // "?" is literal, "*" still matches anything → "?anything suffix" and "?suffix" match
            NodeAssert.ok(regex.test('?suffix'),    'Should match "?suffix" (literal ?)');
            NodeAssert.ok(regex.test('?XYZsuffix'), 'Should match "?XYZsuffix"');
            NodeAssert.ok(!regex.test('Xsuffix'),   'Should NOT match "Xsuffix" (? is literal, not wildcard)');
        });
    });

    NodeTest.describe('White-Box: _mergeConsecutiveChunks', () => {

        NodeTest.it('W-M-01001: .* followed by . is NOT merged (different wildcard types)', () => {

            // Pattern "*?" produces chunks ['.*', '.'].
            // The REGEX_ANY_CHAR branch checks chunks[i] === '.' or REGEX_CHAR_IN_QTY;
            // '.*' matches neither, so no merge occurs.
            const compiler = new WildcardCompiler();
            const pattern = compiler.compileToString('*?');
            NodeAssert.strictEqual(pattern, '.*.$');
        });

        NodeTest.it('W-M-01002: . followed by .* is NOT merged (different wildcard types)', () => {

            // Pattern "?*" produces chunks ['.', '.*'].
            // The REGEX_ANY branch checks chunks[i] === '.*'; '.' is not, so no merge.
            const compiler = new WildcardCompiler();
            const pattern = compiler.compileToString('?*');
            NodeAssert.strictEqual(pattern, '^..*');
        });

        NodeTest.it('W-M-01003: qmQty resets when a non-? chunk interrupts a ? run', () => {

            // Pattern "??a??" should produce .{2} + literal + .{2}, not .{4} or .{5}.
            // This exercises the default branch in _mergeConsecutiveChunks resetting qmQty=1,
            // so the second run of ?? starts its count fresh.
            const compiler = new WildcardCompiler();
            const regex = compiler.compile('??a??');
            NodeAssert.ok(regex.test('XYaXY'),  'Should match "XYaXY"');
            NodeAssert.ok(!regex.test('XaXY'),  'Should NOT match "XaXY" (only one char before a)');
            NodeAssert.ok(!regex.test('XYaX'),  'Should NOT match "XYaX" (only one char after a)');
            NodeAssert.ok(!regex.test('XYZaXY'), 'Should NOT match "XYZaXY" (three chars before a)');
        });

        NodeTest.it('W-E-01001: qmQty resets via REGEX_ANY else-branch between two ? runs', () => {

            // Pattern "??*??" — two ?-runs separated by *.
            // When the REGEX_ANY chunk is seen after the first .{2}, the else branch sets qmQty=1
            // so that the second ?? group correctly produces .{2} rather than continuing the count.
            const compiler = new WildcardCompiler();
            const regex = compiler.compile('??*??');
            NodeAssert.ok(regex.test('ABcdEF'),  'Should match "ABcdEF" (2 + anything + 2)');
            NodeAssert.ok(regex.test('ABEF'),    'Should match "ABEF" (2 + empty + 2)');
            NodeAssert.ok(!regex.test('AEF'),    'Should NOT match "AEF" (only 1 before *)');
            NodeAssert.ok(!regex.test('ABE'),    'Should NOT match "ABE" (only 1 after *)');
        });
    });

    NodeTest.describe('White-Box: _sealPattern', () => {

        NodeTest.it('W-M-02001: Pattern with * at start has no ^ anchor', () => {

            const compiler = new WildcardCompiler();
            const pattern = compiler.compileToString('*abc');
            NodeAssert.ok(!pattern.startsWith('^'), `Expected no "^" at start, got: ${pattern}`);
        });

        NodeTest.it('W-M-02002: Pattern with * at end has no $ anchor', () => {

            const compiler = new WildcardCompiler();
            const pattern = compiler.compileToString('abc*');
            NodeAssert.ok(!pattern.endsWith('$'), `Expected no "$" at end, got: ${pattern}`);
        });

        NodeTest.it('W-M-02003: Pattern with * at both ends has no ^ or $ anchors', () => {

            const compiler = new WildcardCompiler();
            const pattern = compiler.compileToString('*abc*');
            NodeAssert.ok(!pattern.startsWith('^'), `Expected no "^" at start, got: ${pattern}`);
            NodeAssert.ok(!pattern.endsWith('$'),   `Expected no "$" at end, got: ${pattern}`);
        });

        NodeTest.it('W-M-02004: Pattern with no * has both ^ and $ anchors', () => {

            const compiler = new WildcardCompiler();
            const pattern = compiler.compileToString('abc');
            NodeAssert.ok(pattern.startsWith('^'), `Expected "^" at start, got: ${pattern}`);
            NodeAssert.ok(pattern.endsWith('$'),   `Expected "$" at end, got: ${pattern}`);
        });
    });
});
