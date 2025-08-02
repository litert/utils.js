import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { isEmailAddress } from './IsEmailAddress';

NodeTest.describe('Function String.isEmailAddress', () => {

    NodeTest.it('Should return true for valid email addresses', () => {

        for (const email of [
            'i@example.org',
            'hello@ex-ample.cc',
            'world@ex-ample.org',
            'i.am.hello@gmail.com',
        ]) {

            NodeAssert.strictEqual(isEmailAddress(email), true, `Email "${email}" should be valid.`);
        }
    });

    NodeTest.it('Specific maximum length of email addresses should work', () => {

        NodeAssert.strictEqual(
            isEmailAddress('i@example.org', { maxLength: 20, domains: [], }),
            true,
        );

        NodeAssert.strictEqual(
            isEmailAddress('i@example.org', { maxLength: 10 }),
            false,
        );

        NodeAssert.strictEqual(
            isEmailAddress('i'.repeat(244) + '@example.org', { maxLength: 256 }),
            false,
            'The maxLength should not exceed the hard limit of the maximum length 255.',
        );
    });

    NodeTest.it('Specific allowed list of domains should work', () => {

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

    NodeTest.it('Should return false for invalid email addresses', () => {

        for (const email of [
            'i.@example.org',
            'i..2@example.org',
            'a~v@example.org',
            '',
        ]) {

            NodeAssert.strictEqual(isEmailAddress(email), false, `Email "${email}" should be invalid.`);
        }
    });
});
