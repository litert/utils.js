/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { quickParseIPv6Address } from './IPv6.js';

NodeTest.describe('Module Network - Internal IPv6', () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    NodeTest.it('B-M-00001: Should parse a full IPv6 address', () => {

        NodeAssert.deepStrictEqual(
            quickParseIPv6Address('2001:db8:85a3:0:0:8a2e:370:7334'),
            ['2001', 'db8', '85a3', '0', '0', '8a2e', '370', '7334']
        );
    });

    NodeTest.it('B-M-00002: Should preserve leading zeros in each segment', () => {

        NodeAssert.deepStrictEqual(
            quickParseIPv6Address('0001:0002:0003:0004:0005:0006:0007:0008'),
            ['0001', '0002', '0003', '0004', '0005', '0006', '0007', '0008']
        );
    });

    NodeTest.it('B-M-00003: Should expand :: in the middle', () => {

        NodeAssert.deepStrictEqual(
            quickParseIPv6Address('2001:db8::1'),
            ['2001', 'db8', '0', '0', '0', '0', '0', '1']
        );
    });

    NodeTest.it('B-M-00004: Should expand :: at the start', () => {

        NodeAssert.deepStrictEqual(
            quickParseIPv6Address('::ffff:1'),
            ['0', '0', '0', '0', '0', '0', 'ffff', '1']
        );
    });

    NodeTest.it('B-M-00005: Should expand trailing :: with two left segments', () => {

        NodeAssert.deepStrictEqual(
            quickParseIPv6Address('2001:db8::'),
            ['2001', 'db8', '0', '0', '0', '0', '0', '0']
        );
    });

    // ─── Black-Box: Failure Flow ─────────────────────────

    for (const [_i, ip] of [
        '',
        ':',
        'not-an-ip',
        ':::1',
        '2001::db8::1',
        '12345::1',
        '::gggg',
        '1:2:3:4:5:6:7:8:9',
        '::256.0.0.1',
        '::192.168.1',
    ].entries()) {

        NodeTest.it(`B-F-${String(_i + 1).padStart(5, '0')}: Should throw TypeError for "${ip}"`, () => {

            NodeAssert.throws(
                () => quickParseIPv6Address(ip),
                TypeError
            );
        });
    }

    // ─── Black-Box: Edge Cases ───────────────────────────

    NodeTest.it('B-E-00001: Should parse the all-zeros address (without compression)', () => {

        NodeAssert.deepStrictEqual(
            quickParseIPv6Address('0:0:0:0:0:0:0:0'),
            ['0', '0', '0', '0', '0', '0', '0', '0']
        );
    });

    NodeTest.it('B-E-00002: Should parse the maximum address', () => {

        NodeAssert.deepStrictEqual(
            quickParseIPv6Address('ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff'),
            ['ffff', 'ffff', 'ffff', 'ffff', 'ffff', 'ffff', 'ffff', 'ffff']
        );
    });

    NodeTest.it('B-E-00003: Should parse the loopback address ::1', () => {

        NodeAssert.deepStrictEqual(
            quickParseIPv6Address('::1'),
            ['0', '0', '0', '0', '0', '0', '0', '1']
        );
    });

    NodeTest.it('B-E-00004: Should parse the unspecified address ::', () => {

        NodeAssert.deepStrictEqual(
            quickParseIPv6Address('::'),
            ['0', '0', '0', '0', '0', '0', '0', '0']
        );
    });

    NodeTest.it('B-E-00005: Should expand :: at the end', () => {

        NodeAssert.deepStrictEqual(
            quickParseIPv6Address('fe80::'),
            ['fe80', '0', '0', '0', '0', '0', '0', '0']
        );
    });

    NodeTest.it('B-E-00006: Should parse an IPv4-mapped IPv6 address', () => {

        NodeAssert.deepStrictEqual(
            quickParseIPv6Address('::ffff:192.168.1.1'),
            ['0', '0', '0', '0', '0', 'ffff', 'c0a8', '101']
        );
    });

    NodeTest.it('B-E-00007: Should parse an IPv4-only address', () => {

        NodeAssert.deepStrictEqual(
            quickParseIPv6Address('::1.2.3.4'),
            ['0', '0', '0', '0', '0', '0', '102', '304']
        );
    });

    NodeTest.it('B-E-00008: Should parse an IPv4-mapped address with full prefix', () => {

        NodeAssert.deepStrictEqual(
            quickParseIPv6Address('64:ff9b::192.0.2.33'),
            ['64', 'ff9b', '0', '0', '0', '0', 'c000', '221']
        );
    });
});
