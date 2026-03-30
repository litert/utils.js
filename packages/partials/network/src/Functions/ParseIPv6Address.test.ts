/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { parseIPv6Address, parseIPv6AddressToUInt16Array } from './ParseIPv6Address.js';

NodeTest.describe('Module Network - Function ParseIPv6Address', () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    NodeTest.it('B-M-00001: Should expand "a::1" without padding', () => {
        NodeAssert.deepStrictEqual(parseIPv6Address('a::1', false), ['a', '0', '0', '0', '0', '0', '0', '1']);
    });

    NodeTest.it('B-M-00002: Should expand "a::1" with padding', () => {
        NodeAssert.deepStrictEqual(parseIPv6Address('a::1', true), ['000a', '0000', '0000', '0000', '0000', '0000', '0000', '0001']);
    });

    NodeTest.it('B-M-00003: Should expand "a:b::1" without padding', () => {
        NodeAssert.deepStrictEqual(parseIPv6Address('a:b::1', false), ['a', 'b', '0', '0', '0', '0', '0', '1']);
    });

    NodeTest.it('B-M-00004: Should expand "a:b::1" with padding', () => {
        NodeAssert.deepStrictEqual(parseIPv6Address('a:b::1', true), ['000a', '000b', '0000', '0000', '0000', '0000', '0000', '0001']);
    });

    NodeTest.it('B-M-00005: Should expand "abc:b123::1" without padding', () => {
        NodeAssert.deepStrictEqual(parseIPv6Address('abc:b123::1', false), ['abc', 'b123', '0', '0', '0', '0', '0', '1']);
    });

    NodeTest.it('B-M-00006: Should expand "abc:b123::1" with padding', () => {
        NodeAssert.deepStrictEqual(parseIPv6Address('abc:b123::1', true), ['0abc', 'b123', '0000', '0000', '0000', '0000', '0000', '0001']);
    });

    NodeTest.it('B-M-00007: Should expand trailing "::" in "abc:b123::" without padding', () => {
        NodeAssert.deepStrictEqual(parseIPv6Address('abc:b123::', false), ['abc', 'b123', '0', '0', '0', '0', '0', '0']);
    });

    NodeTest.it('B-M-00008: Should parse full address without padding', () => {
        NodeAssert.deepStrictEqual(
            parseIPv6Address('2001:0db8:85a3:0000:0000:8a2e:0370:7334', false),
            ['2001', 'db8', '85a3', '0', '0', '8a2e', '370', '7334']
        );
    });

    NodeTest.it('B-M-00009: Should parse full address with padding', () => {
        NodeAssert.deepStrictEqual(
            parseIPv6Address('2001:0db8:85a3:0000:0000:8a2e:0370:7334', true),
            ['2001', '0db8', '85a3', '0000', '0000', '8a2e', '0370', '7334']
        );
    });

    NodeTest.it('B-M-00010: Should parse explicit 8-segment address without padding', () => {
        NodeAssert.deepStrictEqual(parseIPv6Address('1:2:3:4:5:6:7:8', false), ['1', '2', '3', '4', '5', '6', '7', '8']);
    });

    NodeTest.it('B-M-00011: Should parse explicit 8-segment address with padding', () => {
        NodeAssert.deepStrictEqual(parseIPv6Address('1:2:3:4:5:6:7:8', true), ['0001', '0002', '0003', '0004', '0005', '0006', '0007', '0008']);
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
            NodeAssert.throws(() => parseIPv6Address(v, false), TypeError);
        });
    }

    // ─── Black-Box: Edge Cases ───────────────────────────

    NodeTest.it('B-E-00001: Should expand "::" to all-zeros without padding', () => {
        NodeAssert.deepStrictEqual(parseIPv6Address('::', false), ['0', '0', '0', '0', '0', '0', '0', '0']);
    });

    NodeTest.it('B-E-00002: Should expand "::" to all-zeros with padding', () => {
        NodeAssert.deepStrictEqual(parseIPv6Address('::', true), ['0000', '0000', '0000', '0000', '0000', '0000', '0000', '0000']);
    });

    NodeTest.it('B-E-00003: Should expand "::1" without padding', () => {
        NodeAssert.deepStrictEqual(parseIPv6Address('::1', false), ['0', '0', '0', '0', '0', '0', '0', '1']);
    });

    NodeTest.it('B-E-00004: Should expand "::1" with padding', () => {
        NodeAssert.deepStrictEqual(parseIPv6Address('::1', true), ['0000', '0000', '0000', '0000', '0000', '0000', '0000', '0001']);
    });

    NodeTest.it('B-E-00005: Should expand trailing "::" in "fe80::" without padding', () => {
        NodeAssert.deepStrictEqual(parseIPv6Address('fe80::', false), ['fe80', '0', '0', '0', '0', '0', '0', '0']);
    });

    NodeTest.it('B-E-00006: Should expand "abc:b123::1.2.3.4" without padding', () => {
        NodeAssert.deepStrictEqual(parseIPv6Address('abc:b123::1.2.3.4', false), ['abc', 'b123', '0', '0', '0', '0', '102', '304']);
    });

    NodeTest.it('B-E-00007: Should expand "abc:b123::1.2.3.4" with padding', () => {
        NodeAssert.deepStrictEqual(parseIPv6Address('abc:b123::1.2.3.4', true), ['0abc', 'b123', '0000', '0000', '0000', '0000', '0102', '0304']);
    });

    NodeTest.it('B-E-00008: Should expand "::abc:b123:1.2.3.4" without padding', () => {
        NodeAssert.deepStrictEqual(parseIPv6Address('::abc:b123:1.2.3.4', false), ['0', '0', '0', '0', 'abc', 'b123', '102', '304']);
    });

    NodeTest.it('B-E-00009: Should expand "::abc:b123:1.2.3.4" with padding', () => {
        NodeAssert.deepStrictEqual(parseIPv6Address('::abc:b123:1.2.3.4', true), ['0000', '0000', '0000', '0000', '0abc', 'b123', '0102', '0304']);
    });

    NodeTest.it('B-E-00010: Should expand "::ffff:1.2.3.4" without padding', () => {
        NodeAssert.deepStrictEqual(parseIPv6Address('::ffff:1.2.3.4', false), ['0', '0', '0', '0', '0', 'ffff', '102', '304']);
    });

    NodeTest.it('B-E-00011: Should expand "::ffff:1.2.3.4" with padding', () => {
        NodeAssert.deepStrictEqual(parseIPv6Address('::ffff:1.2.3.4', true), ['0000', '0000', '0000', '0000', '0000', 'ffff', '0102', '0304']);
    });

    NodeTest.it('B-E-00012: Should expand "::1.2.3.4" without padding', () => {
        NodeAssert.deepStrictEqual(parseIPv6Address('::1.2.3.4', false), ['0', '0', '0', '0', '0', '0', '102', '304']);
    });

    NodeTest.it('B-E-00013: Should expand "::1.2.3.4" with padding', () => {
        NodeAssert.deepStrictEqual(parseIPv6Address('::1.2.3.4', true), ['0000', '0000', '0000', '0000', '0000', '0000', '0102', '0304']);
    });

    NodeTest.it('B-E-00014: Should expand "::1:a:d:e:f:1.2.3.4" without padding', () => {
        NodeAssert.deepStrictEqual(parseIPv6Address('::1:a:d:e:f:1.2.3.4', false), ['0', '1', 'a', 'd', 'e', 'f', '102', '304']);
    });

    NodeTest.it('B-E-00015: Should expand "::1:a:d:e:f:1.2.3.4" with padding', () => {
        NodeAssert.deepStrictEqual(parseIPv6Address('::1:a:d:e:f:1.2.3.4', true), ['0000', '0001', '000a', '000d', '000e', '000f', '0102', '0304']);
    });

    NodeTest.it('B-E-00016: Should expand "2001:db8:3333:4444:5555:6666:1.2.3.4" with padding', () => {
        NodeAssert.deepStrictEqual(
            parseIPv6Address('2001:db8:3333:4444:5555:6666:1.2.3.4', true),
            ['2001', '0db8', '3333', '4444', '5555', '6666', '0102', '0304']
        );
    });

    NodeTest.it('B-E-00017: Should round-trip all-zeros address through padding then stripping', () => {
        NodeAssert.deepStrictEqual(
            parseIPv6Address(parseIPv6Address('0:0:0:0:0:0:0:0', true).join(':'), false),
            ['0', '0', '0', '0', '0', '0', '0', '0']
        );
    });

    NodeTest.it('B-E-00018: Should round-trip maximum address through IPv4 notation', () => {
        NodeAssert.deepStrictEqual(
            parseIPv6Address(parseIPv6Address('ffff:ffff:ffff:ffff:ffff:ffff:255.255.255.255', true).join(':'), false),
            ['ffff', 'ffff', 'ffff', 'ffff', 'ffff', 'ffff', 'ffff', 'ffff']
        );
    });
});

NodeTest.describe('Module Network - Function ParseIPv6AddressToUInt16Array', () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    NodeTest.it('B-M-00001: Should parse "a::1" to integer array', () => {
        NodeAssert.deepStrictEqual(parseIPv6AddressToUInt16Array('a::1'), [10, 0, 0, 0, 0, 0, 0, 1]);
    });

    NodeTest.it('B-M-00002: Should parse "a:b::1" to integer array', () => {
        NodeAssert.deepStrictEqual(parseIPv6AddressToUInt16Array('a:b::1'), [10, 11, 0, 0, 0, 0, 0, 1]);
    });

    NodeTest.it('B-M-00003: Should parse "abc:b123::1" to integer array', () => {
        NodeAssert.deepStrictEqual(parseIPv6AddressToUInt16Array('abc:b123::1'), [0xabc, 0xb123, 0, 0, 0, 0, 0, 1]);
    });

    NodeTest.it('B-M-00004: Should parse full address to integer array', () => {
        NodeAssert.deepStrictEqual(
            parseIPv6AddressToUInt16Array('2001:0db8:85a3:0000:0000:8a2e:0370:7334'),
            [0x2001, 0x0db8, 0x85a3, 0x0000, 0x0000, 0x8a2e, 0x0370, 0x7334]
        );
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
            NodeAssert.throws(() => parseIPv6AddressToUInt16Array(v), TypeError);
        });
    }

    // ─── Black-Box: Edge Cases ───────────────────────────

    NodeTest.it('B-E-00001: Should parse "::" to all-zero integers', () => {
        NodeAssert.deepStrictEqual(parseIPv6AddressToUInt16Array('::'), [0, 0, 0, 0, 0, 0, 0, 0]);
    });

    NodeTest.it('B-E-00002: Should parse "::1" to loopback integer array', () => {
        NodeAssert.deepStrictEqual(parseIPv6AddressToUInt16Array('::1'), [0, 0, 0, 0, 0, 0, 0, 1]);
    });

    NodeTest.it('B-E-00003: Should parse "abc:b123::1.2.3.4" to integer array', () => {
        NodeAssert.deepStrictEqual(parseIPv6AddressToUInt16Array('abc:b123::1.2.3.4'), [0xabc, 0xb123, 0, 0, 0, 0, 0x102, 0x304]);
    });

    NodeTest.it('B-E-00004: Should parse "::abc:b123:1.2.3.4" to integer array', () => {
        NodeAssert.deepStrictEqual(parseIPv6AddressToUInt16Array('::abc:b123:1.2.3.4'), [0, 0, 0, 0, 0xabc, 0xb123, 0x102, 0x304]);
    });

    NodeTest.it('B-E-00005: Should parse "::ffff:1.2.3.4" to integer array', () => {
        NodeAssert.deepStrictEqual(parseIPv6AddressToUInt16Array('::ffff:1.2.3.4'), [0, 0, 0, 0, 0, 0xffff, 0x102, 0x304]);
    });

    NodeTest.it('B-E-00006: Should parse "::1.2.3.4" to integer array', () => {
        NodeAssert.deepStrictEqual(parseIPv6AddressToUInt16Array('::1.2.3.4'), [0, 0, 0, 0, 0, 0, 0x102, 0x304]);
    });

    NodeTest.it('B-E-00007: Should parse "::1:a:d:e:f:1.2.3.4" to integer array', () => {
        NodeAssert.deepStrictEqual(parseIPv6AddressToUInt16Array('::1:a:d:e:f:1.2.3.4'), [0, 1, 0xa, 0xd, 0xe, 0xf, 0x102, 0x304]);
    });

    NodeTest.it('B-E-00008: Should parse "2001:db8:3333:4444:5555:6666:1.2.3.4" to integer array', () => {
        NodeAssert.deepStrictEqual(
            parseIPv6AddressToUInt16Array('2001:db8:3333:4444:5555:6666:1.2.3.4'),
            [0x2001, 0x0db8, 0x3333, 0x4444, 0x5555, 0x6666, 0x0102, 0x0304]
        );
    });

    NodeTest.it('B-E-00009: Should parse maximum address (0xffff in every segment)', () => {
        NodeAssert.deepStrictEqual(
            parseIPv6AddressToUInt16Array('ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff'),
            [0xffff, 0xffff, 0xffff, 0xffff, 0xffff, 0xffff, 0xffff, 0xffff]
        );
    });

    NodeTest.it('B-E-00010: Should round-trip all-zeros address', () => {
        NodeAssert.deepStrictEqual(
            parseIPv6AddressToUInt16Array(parseIPv6AddressToUInt16Array('0:0:0:0:0:0:0:0').join(':')),
            [0, 0, 0, 0, 0, 0, 0, 0]
        );
    });

    NodeTest.it('B-E-00011: Should round-trip maximum address through IPv4 notation', () => {
        NodeAssert.deepStrictEqual(
            parseIPv6AddressToUInt16Array(
                parseIPv6AddressToUInt16Array('ffff:ffff:ffff:ffff:ffff:ffff:255.255.255.255')
                    .map(i => i.toString(16)).join(':'),
            ),
            [0xffff, 0xffff, 0xffff, 0xffff, 0xffff, 0xffff, 0xffff, 0xffff]
        );
    });
});
