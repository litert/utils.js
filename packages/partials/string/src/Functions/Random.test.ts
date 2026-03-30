/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { random, DEFAULT_RANDOM_CHARSET, ERandomStringCharset } from './Random.js';

const REPEAT_COUNT = 1000;

NodeTest.describe('Module String - Function Random', () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    NodeTest.it('B-M-00001: Should return a string of exactly the requested length', () => {

        for (const length of [1, 5, 10, 32, 100]) {

            NodeAssert.strictEqual(random(length).length, length);
        }
    });

    NodeTest.it('B-M-00002: Should only use characters from the default charset', () => {

        const charset = new Set(DEFAULT_RANDOM_CHARSET.split(''));

        for (let i = 0; i < REPEAT_COUNT; i++) {

            for (const ch of random(20)) {

                NodeAssert.ok(charset.has(ch), `Unexpected character: ${ch}`);
            }
        }
    });

    NodeTest.it('B-M-00003: Should only use characters from a custom charset', () => {

        const charset = ERandomStringCharset.DEC_DIGIT;
        const allowed = new Set(charset.split(''));

        for (let i = 0; i < REPEAT_COUNT; i++) {

            for (const ch of random(16, charset)) {

                NodeAssert.ok(allowed.has(ch), `Unexpected character: ${ch}`);
            }
        }
    });

    NodeTest.it('B-M-00004: Should only use characters from the given charset', () => {

        for (const cs of [
            ERandomStringCharset.UPPER_HEX_DIGIT,
            ERandomStringCharset.LOWER_HEX_DIGIT,
            'ABC123!@#',
        ]) {
            const allowed = new Set(cs.split(''));

            for (let i = 0; i < REPEAT_COUNT; i++) {

                for (const ch of random(16, cs)) {

                    NodeAssert.ok(allowed.has(ch), `Unexpected character: ${ch}`);
                }
            }
        }
    });

    NodeTest.it('B-M-00005: UPPER_ALPHA should contain only uppercase letters', () => {

        NodeAssert.match(ERandomStringCharset.UPPER_ALPHA, /^[A-Z]+$/);
    });

    NodeTest.it('B-M-00006: LOWER_ALPHA should contain only lowercase letters', () => {

        NodeAssert.match(ERandomStringCharset.LOWER_ALPHA, /^[a-z]+$/);
    });

    NodeTest.it('B-M-00007: DEC_DIGIT should contain only decimal digits', () => {

        NodeAssert.match(ERandomStringCharset.DEC_DIGIT, /^[0-9]+$/);
    });

    NodeTest.it('B-M-00008: UPPER_HEX_DIGIT should contain only uppercase hex digits', () => {

        NodeAssert.match(ERandomStringCharset.UPPER_HEX_DIGIT, /^[0-9A-F]+$/);
    });

    NodeTest.it('B-M-00009: LOWER_HEX_DIGIT should contain only lowercase hex digits', () => {

        NodeAssert.match(ERandomStringCharset.LOWER_HEX_DIGIT, /^[0-9a-f]+$/);
    });

    NodeTest.it('B-M-00010: Should contain upper alpha, lower alpha and digits', () => {

        NodeAssert.ok(DEFAULT_RANDOM_CHARSET.includes('A'));
        NodeAssert.ok(DEFAULT_RANDOM_CHARSET.includes('z'));
        NodeAssert.ok(DEFAULT_RANDOM_CHARSET.includes('0'));
    });

    NodeTest.it('B-M-00011: Should have the expected length (26 + 26 + 10 = 62)', () => {

        NodeAssert.strictEqual(DEFAULT_RANDOM_CHARSET.length, 62);
    });

    // ─── Black-Box: Edge Cases ───────────────────────────

    NodeTest.it('B-E-00001: Should return an empty string for length 0', () => {

        NodeAssert.strictEqual(random(0), '');
    });

    NodeTest.it('B-E-00002: Should return an empty string for negative length', () => {

        NodeAssert.strictEqual(random(-1), '');
        NodeAssert.strictEqual(random(-100), '');
    });

    NodeTest.it('B-E-00003: Should produce a single-character string when charset has one character', () => {

        for (let i = 0; i < REPEAT_COUNT; i++) {

            NodeAssert.strictEqual(random(5, 'X'), 'XXXXX');
        }
    });
});
