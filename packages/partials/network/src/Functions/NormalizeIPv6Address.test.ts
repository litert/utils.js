/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { normalizeIPv6Address } from './NormalizeIPv6Address.js';

NodeTest.describe('Module Network - Function NormalizeIPv6Address', () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    NodeTest.it('B-M-00001: Should expand "a::1" without padding', () => {
        NodeAssert.strictEqual(normalizeIPv6Address('a::1', false), 'a:0:0:0:0:0:0:1');
    });

    NodeTest.it('B-M-00002: Should expand "a::1" with padding', () => {
        NodeAssert.strictEqual(normalizeIPv6Address('a::1', true), '000a:0000:0000:0000:0000:0000:0000:0001');
    });

    NodeTest.it('B-M-00003: Should expand "a:b::1" without padding', () => {
        NodeAssert.strictEqual(normalizeIPv6Address('a:b::1', false), 'a:b:0:0:0:0:0:1');
    });

    NodeTest.it('B-M-00004: Should expand "a:b::1" with padding', () => {
        NodeAssert.strictEqual(normalizeIPv6Address('a:b::1', true), '000a:000b:0000:0000:0000:0000:0000:0001');
    });

    NodeTest.it('B-M-00005: Should expand "abc:b123::1" without padding', () => {
        NodeAssert.strictEqual(normalizeIPv6Address('abc:b123::1', false), 'abc:b123:0:0:0:0:0:1');
    });

    NodeTest.it('B-M-00006: Should expand "abc:b123::1" with padding', () => {
        NodeAssert.strictEqual(normalizeIPv6Address('abc:b123::1', true), '0abc:b123:0000:0000:0000:0000:0000:0001');
    });

    NodeTest.it('B-M-00007: Should expand trailing "::" in "abc:b123::" without padding', () => {
        NodeAssert.strictEqual(normalizeIPv6Address('abc:b123::', false), 'abc:b123:0:0:0:0:0:0');
    });

    NodeTest.it('B-M-00008: Should normalize full address without padding', () => {
        NodeAssert.strictEqual(
            normalizeIPv6Address('2001:0db8:85a3:0000:0000:8a2e:0370:7334', false),
            '2001:db8:85a3:0:0:8a2e:370:7334'
        );
    });

    NodeTest.it('B-M-00009: Should normalize full address with padding', () => {
        NodeAssert.strictEqual(
            normalizeIPv6Address('2001:0db8:85a3:0000:0000:8a2e:0370:7334', true),
            '2001:0db8:85a3:0000:0000:8a2e:0370:7334'
        );
    });

    NodeTest.it('B-M-00010: Should normalize explicit 8-segment address without padding', () => {
        NodeAssert.strictEqual(normalizeIPv6Address('1:2:3:4:5:6:7:8', false), '1:2:3:4:5:6:7:8');
    });

    NodeTest.it('B-M-00011: Should normalize explicit 8-segment address with padding', () => {
        NodeAssert.strictEqual(normalizeIPv6Address('1:2:3:4:5:6:7:8', true), '0001:0002:0003:0004:0005:0006:0007:0008');
    });

    // ─── Black-Box: Failure Flow ─────────────────────────

    for (const [_i, v] of [
        '',
        'a',
        '-',
        '::1-',
        '*::1',
        '::1::',
        '::::',
        ':::',
        '::1:2:3:4:5:6:',
        '::1:2:3:1.4.3.4:5:6',
        '1:2:3:1.4.3.4::5:6',
        '1:2:3:::5:6',
        '::1:2:3:4:5:6:7:8',
        '::1:a:d:e:f:a:1.2.3.4',
        '::1:a:d:e:f:a:1.2.3.256',
    ].entries()) {

        NodeTest.it(`B-F-${String(_i + 1).padStart(5, '0')}: Should throw TypeError for invalid address "${v}"`, () => {
            NodeAssert.throws(() => normalizeIPv6Address(v, false), TypeError);
        });
    }

    // ─── Black-Box: Edge Cases ───────────────────────────

    NodeTest.it('B-E-00001: Should expand "::" to all-zeros without padding', () => {
        NodeAssert.strictEqual(normalizeIPv6Address('::', false), '0:0:0:0:0:0:0:0');
    });

    NodeTest.it('B-E-00002: Should expand "::" to all-zeros with padding', () => {
        NodeAssert.strictEqual(normalizeIPv6Address('::', true), '0000:0000:0000:0000:0000:0000:0000:0000');
    });

    NodeTest.it('B-E-00003: Should expand "::1" without padding', () => {
        NodeAssert.strictEqual(normalizeIPv6Address('::1', false), '0:0:0:0:0:0:0:1');
    });

    NodeTest.it('B-E-00004: Should expand "::1" with padding', () => {
        NodeAssert.strictEqual(normalizeIPv6Address('::1', true), '0000:0000:0000:0000:0000:0000:0000:0001');
    });

    NodeTest.it('B-E-00005: Should expand trailing "::" in "fe80::" without padding', () => {
        NodeAssert.strictEqual(normalizeIPv6Address('fe80::', false), 'fe80:0:0:0:0:0:0:0');
    });

    NodeTest.it('B-E-00006: Should expand "abc:b123::1.2.3.4" without padding', () => {
        NodeAssert.strictEqual(normalizeIPv6Address('abc:b123::1.2.3.4', false), 'abc:b123:0:0:0:0:102:304');
    });

    NodeTest.it('B-E-00007: Should expand "abc:b123::1.2.3.4" with padding', () => {
        NodeAssert.strictEqual(normalizeIPv6Address('abc:b123::1.2.3.4', true), '0abc:b123:0000:0000:0000:0000:0102:0304');
    });

    NodeTest.it('B-E-00008: Should expand "::abc:b123:1.2.3.4" without padding', () => {
        NodeAssert.strictEqual(normalizeIPv6Address('::abc:b123:1.2.3.4', false), '0:0:0:0:abc:b123:102:304');
    });

    NodeTest.it('B-E-00009: Should expand "::abc:b123:1.2.3.4" with padding', () => {
        NodeAssert.strictEqual(normalizeIPv6Address('::abc:b123:1.2.3.4', true), '0000:0000:0000:0000:0abc:b123:0102:0304');
    });

    NodeTest.it('B-E-00010: Should expand "::ffff:1.2.3.4" without padding', () => {
        NodeAssert.strictEqual(normalizeIPv6Address('::ffff:1.2.3.4', false), '0:0:0:0:0:ffff:102:304');
    });

    NodeTest.it('B-E-00011: Should expand "::ffff:1.2.3.4" with padding', () => {
        NodeAssert.strictEqual(normalizeIPv6Address('::ffff:1.2.3.4', true), '0000:0000:0000:0000:0000:ffff:0102:0304');
    });

    NodeTest.it('B-E-00012: Should expand "::1.2.3.4" without padding', () => {
        NodeAssert.strictEqual(normalizeIPv6Address('::1.2.3.4', false), '0:0:0:0:0:0:102:304');
    });

    NodeTest.it('B-E-00013: Should expand "::1.2.3.4" with padding', () => {
        NodeAssert.strictEqual(normalizeIPv6Address('::1.2.3.4', true), '0000:0000:0000:0000:0000:0000:0102:0304');
    });

    NodeTest.it('B-E-00014: Should expand "::1:a:d:e:f:1.2.3.4" without padding', () => {
        NodeAssert.strictEqual(normalizeIPv6Address('::1:a:d:e:f:1.2.3.4', false), '0:1:a:d:e:f:102:304');
    });

    NodeTest.it('B-E-00015: Should expand "::1:a:d:e:f:1.2.3.4" with padding', () => {
        NodeAssert.strictEqual(normalizeIPv6Address('::1:a:d:e:f:1.2.3.4', true), '0000:0001:000a:000d:000e:000f:0102:0304');
    });

    NodeTest.it('B-E-00016: Should expand "2001:db8:3333:4444:5555:6666:1.2.3.4" with padding', () => {
        NodeAssert.strictEqual(
            normalizeIPv6Address('2001:db8:3333:4444:5555:6666:1.2.3.4', true),
            '2001:0db8:3333:4444:5555:6666:0102:0304'
        );
    });

    NodeTest.it('B-E-00017: Should round-trip all-zeros address through padding then stripping', () => {
        NodeAssert.strictEqual(
            normalizeIPv6Address(normalizeIPv6Address('0:0:0:0:0:0:0:0', true), false),
            '0:0:0:0:0:0:0:0'
        );
    });

    NodeTest.it('B-E-00018: Should round-trip maximum address through IPv4 notation', () => {
        NodeAssert.strictEqual(
            normalizeIPv6Address(normalizeIPv6Address('ffff:ffff:ffff:ffff:ffff:ffff:255.255.255.255', true), false),
            'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff'
        );
    });
});
