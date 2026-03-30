/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { isEmailAddress } from './IsEmailAddress.js';

NodeTest.describe('Module String - Function IsEmailAddress', () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    NodeTest.it('B-M-00001: Should return true for valid email addresses', () => {

        for (const email of [
            'i@example.org',
            'hello@ex-ample.cc',
            'world@ex-ample.org',
            'i.am.hello@gmail.com',
        ]) {

            NodeAssert.strictEqual(isEmailAddress(email), true, `Email "${email}" should be valid.`);
        }
    });

    NodeTest.it('B-M-00002: Specific maximum length of email addresses should work', () => {

        NodeAssert.strictEqual(
            isEmailAddress('i@example.org', { maxLength: 20, domains: [], }),
            true,
        );

        NodeAssert.strictEqual(
            isEmailAddress('i@example.org', { maxLength: 10 }),
            false,
        );

        // Construct a valid 256-char email to verify the hard limit of 255 is enforced
        // even when a caller passes maxLength > 255.
        const email256 = 'a' + 'b'.repeat(60)
            + '@'
            + 'a' + 'b'.repeat(62) + '.'
            + 'a' + 'b'.repeat(62) + '.'
            + 'a' + 'b'.repeat(62)
            + '.ab';
        NodeAssert.strictEqual(email256.length, 256);
        NodeAssert.strictEqual(
            isEmailAddress(email256, { maxLength: 300 }),
            false,
            'The hard limit of 255 is enforced even when maxLength is set larger than 255.',
        );
    });

    NodeTest.it('B-M-00003: Specific allowed list of domains should work', () => {

        NodeAssert.strictEqual(
            isEmailAddress('i@example.org', { domains: [
                'example.org',
                'example.io',
            ] }),
            true,
        );

        NodeAssert.strictEqual(
            isEmailAddress('i@example.io', { domains: [
                'example.org',
                'example.io',
            ] }),
            true,
        );

        NodeAssert.strictEqual(
            isEmailAddress('i@example.io', { domains: [
                'example.org',
                'example.IO',
            ] }),
            false,
            'The domain will not be treated as case-insensitive.',
        );

        NodeAssert.strictEqual(
            isEmailAddress('I@EXAMPLE.ORG', { domains: [
                'example.org',
                'example.io',
            ] }),
            true,
            'The domain and email address should be case-insensitive.',
        );

        NodeAssert.strictEqual(
            isEmailAddress('i@example.org', { domains: ['example.com'] }),
            false,
        );

        NodeAssert.strictEqual(
            isEmailAddress('I@EXAMPLE.ORG', { domains: ['example.com'] }),
            false,
            'The domain and email address should be case-insensitive.',
        );
    });

    // ─── Black-Box: Failure Flow ─────────────────────────

    NodeTest.it('B-F-00001: Should return false for invalid email addresses', () => {

        for (const email of [
            'i.@example.org',
            'i..2@example.org',
            'a~v@example.org',
            '',
        ]) {

            NodeAssert.strictEqual(isEmailAddress(email), false, `Email "${email}" should be invalid.`);
        }
    });

    // ─── Black-Box: Edge Cases ───────────────────────────

    NodeTest.it('B-E-00001: Should enforce the minimum email length of 6 characters', () => {

        NodeAssert.strictEqual(isEmailAddress('a@b.c'), false, '"a@b.c" (5 chars) is below MIN_EMAIL_LENGTH');
        NodeAssert.strictEqual(isEmailAddress('a@b.cd'), true,  '"a@b.cd" (6 chars) is at MIN_EMAIL_LENGTH');
    });

    NodeTest.it('B-E-00002: Should enforce the hard maximum email length of 255 characters', () => {

        // Build a valid 255-char email (local 60 + @ + domain 194)
        const domain = 'a' + 'b'.repeat(62) + '.' + 'a' + 'b'.repeat(62) + '.' + 'a' + 'b'.repeat(62) + '.ab';
        const email255 = 'a' + 'b'.repeat(59) + '@' + domain;
        NodeAssert.strictEqual(email255.length, 255);
        NodeAssert.strictEqual(isEmailAddress(email255), true, '255-char email should pass');

        // 256-char email – always rejected regardless of maxLength
        const email256 = 'a' + 'b'.repeat(60) + '@' + domain;
        NodeAssert.strictEqual(email256.length, 256);
        NodeAssert.strictEqual(isEmailAddress(email256), false, '256-char email exceeds hard limit');
        NodeAssert.strictEqual(isEmailAddress(email256, { maxLength: 300 }), false, 'Hard limit not bypassable via maxLength');
    });

    NodeTest.it('B-E-00003: Should allow all domains when domains option is an empty array', () => {

        NodeAssert.strictEqual(
            isEmailAddress('i@example.org', { domains: [] }),
            true,
            'Empty domains array should allow all domains',
        );
    });
});
