/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { isValidIPv6Address } from './IsValidIPv6Address.js';

NodeTest.describe('Module Network - Function IsValidIPv6Address', () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    for (const [_i, validIPv6Addr] of [
        'a::1',
        'a:0:0:0::1',
        'a:0:0::0:1',
        'a:0:0:0:0:0:0:1',
        '000a:0000:0000:0000:0000:0000:0000:0001',
        'a:b::1',
        'a:b:0:0:0:0:0:1',
        '000a:000b:0000:0000:0000:0000:0000:0001',
        'abc:b123::',
        'abc:b123::1',
        'abc:b123:0:0:0:0:0:1',
        '0abc:b123:0000:0000:0000:0000:0000:0001',
        'abc:b123:0:0:0:0:102:304',
        '0abc:b123:0000:0000:0000:0000:0102:0304',
        '0:0:0:0:abc:b123:102:304',
        '0000:0000:0000:0000:0abc:b123:0102:0304',
        '0000:0000:0000:0000:0000:ffff:0102:0304',
        '0:0:0:0:0:ffff:102:304',
        '0:0:0:0:0:0:102:304',
        '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
        '2001:db8:85a3:0:0:8a2e:370:7334',
    ].entries()) {

        NodeTest.it(`B-M-${String(_i + 1).padStart(5, '0')}: Should treat "${validIPv6Addr}" as a valid IPv6 address`, () => {

            NodeAssert.strictEqual(
                isValidIPv6Address(validIPv6Addr),
                true
            );
        });
    }

    // ─── Black-Box: Failure Flow ─────────────────────────

    for (const [_i, v] of [
        ':',
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
        '::1:a:d:e:f:a:1.2.3.4', // 0:0:1:a:d:e:f:102:304 // too long
        '::1:a:d:e:f:a:1.2.3.256',
        'hello',
        ' ',
        '1234.1.1.1',
        '256.1.1.1',
        '1.256.1.1',
        '1.1.256.1',
        '1.1.1.256',
        '1.1.1.23333',
        '你好',
    ].entries()) {

        NodeTest.it(`B-F-${String(_i + 1).padStart(5, '0')}: Should treat "${v}" as an invalid IPv6 address`, () => {

            NodeAssert.strictEqual(
                isValidIPv6Address(v),
                false
            );
        });
    }

    // ─── Black-Box: Edge Cases ───────────────────────────

    NodeTest.it('B-E-00001: Should treat "::" as a valid IPv6 address', () => {

        NodeAssert.strictEqual(
            isValidIPv6Address('::'),
            true
        );
    });

    NodeTest.it('B-E-00002: Should treat "0:0:0:0:0:0:0:0" as a valid IPv6 address', () => {

        NodeAssert.strictEqual(
            isValidIPv6Address('0:0:0:0:0:0:0:0'),
            true
        );
    });

    NodeTest.it('B-E-00003: Should treat "0000:0000:0000:0000:0000:0000:0000:0000" as a valid IPv6 address', () => {

        NodeAssert.strictEqual(
            isValidIPv6Address('0000:0000:0000:0000:0000:0000:0000:0000'),
            true
        );
    });

    NodeTest.it('B-E-00004: Should treat "::1" as a valid IPv6 address', () => {

        NodeAssert.strictEqual(
            isValidIPv6Address('::1'),
            true
        );
    });

    NodeTest.it('B-E-00005: Should treat "0:0:0:0:0:0:0:1" as a valid IPv6 address', () => {

        NodeAssert.strictEqual(
            isValidIPv6Address('0:0:0:0:0:0:0:1'),
            true
        );
    });

    NodeTest.it('B-E-00006: Should treat "0000:0000:0000:0000:0000:0000:0000:0001" as a valid IPv6 address', () => {

        NodeAssert.strictEqual(
            isValidIPv6Address('0000:0000:0000:0000:0000:0000:0000:0001'),
            true
        );
    });

    NodeTest.it('B-E-00007: Should treat "::ffff:0" as a valid IPv6 address', () => {

        NodeAssert.strictEqual(
            isValidIPv6Address('::ffff:0'),
            true
        );
    });

    NodeTest.it('B-E-00008: Should treat "abc:b123::1.2.3.4" as a valid IPv6 address', () => {

        NodeAssert.strictEqual(
            isValidIPv6Address('abc:b123::1.2.3.4'),
            true
        );
    });

    NodeTest.it('B-E-00009: Should treat "::abc:b123:1.2.3.4" as a valid IPv6 address', () => {

        NodeAssert.strictEqual(
            isValidIPv6Address('::abc:b123:1.2.3.4'),
            true
        );
    });

    NodeTest.it('B-E-00010: Should treat "::ffff:1.2.3.4" as a valid IPv6 address', () => {

        NodeAssert.strictEqual(
            isValidIPv6Address('::ffff:1.2.3.4'),
            true
        );
    });

    NodeTest.it('B-E-00011: Should treat "::1.2.3.4" as a valid IPv6 address', () => {

        NodeAssert.strictEqual(
            isValidIPv6Address('::1.2.3.4'),
            true
        );
    });

    NodeTest.it('B-E-00012: Should treat "::1:a:d:e:f:1.2.3.4" as a valid IPv6 address', () => {

        NodeAssert.strictEqual(
            isValidIPv6Address('::1:a:d:e:f:1.2.3.4'),
            true
        );
    });

    NodeTest.it('B-E-00013: Should treat "2001:db8:3333:4444:5555:6666:1.2.3.4" as a valid IPv6 address', () => {

        NodeAssert.strictEqual(
            isValidIPv6Address('2001:db8:3333:4444:5555:6666:1.2.3.4'),
            true
        );
    });

    NodeTest.it('B-E-00014: Should treat "ffff:ffff:ffff:ffff:ffff:ffff:255.255.255.255" as a valid IPv6 address', () => {

        NodeAssert.strictEqual(
            isValidIPv6Address('ffff:ffff:ffff:ffff:ffff:ffff:255.255.255.255'),
            true
        );
    });

    NodeTest.it('B-E-00015: Should treat "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff" as a valid IPv6 address', () => {

        NodeAssert.strictEqual(
            isValidIPv6Address('ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff'),
            true
        );
    });

    NodeTest.it('B-E-00016: Should treat "1.2.3.4" as a valid IPv6 address', () => {

        NodeAssert.strictEqual(
            isValidIPv6Address('1.2.3.4'),
            true
        );
    });

    NodeTest.it('B-E-00017: Should treat "255.255.255.255" as a valid IPv6 address', () => {

        NodeAssert.strictEqual(
            isValidIPv6Address('255.255.255.255'),
            true
        );
    });

    NodeTest.it('B-E-00018: Should treat "0.0.0.0" as a valid IPv6 address', () => {

        NodeAssert.strictEqual(
            isValidIPv6Address('0.0.0.0'),
            true
        );
    });

    NodeTest.it('B-E-00019: Should treat "fe80::" as a valid IPv6 address', () => {

        NodeAssert.strictEqual(
            isValidIPv6Address('fe80::'),
            true
        );
    });

    NodeTest.it('B-E-00020: Should treat "" as an invalid IPv6 address', () => {

        NodeAssert.strictEqual(
            isValidIPv6Address(''),
            false
        );
    });
});
