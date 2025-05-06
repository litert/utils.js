import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { parseIPv6Address, parseIPv6AddressToUInt16Array } from './ParseIPv6Address';

NodeTest.describe('Function Network.parseIPv6Address', () => {

    NodeTest.it('Should process "::" correctly', () => {

        NodeAssert.deepStrictEqual(
            parseIPv6Address('::', false),
            ['0', '0', '0', '0', '0', '0', '0', '0']
        );
        NodeAssert.deepStrictEqual(
            parseIPv6Address('::', true),
            ['0000', '0000', '0000', '0000', '0000', '0000', '0000', '0000']
        );
    });

    NodeTest.it('Should process "::1" correctly', () => {
        NodeAssert.deepStrictEqual(
            parseIPv6Address('::1', false),
            ['0', '0', '0', '0', '0', '0', '0', '1']
        );
        NodeAssert.deepStrictEqual(
            parseIPv6Address('::1', true),
            ['0000', '0000', '0000', '0000', '0000', '0000', '0000', '0001']
        );
    });

    NodeTest.it('Should process middle "::" correctly', () => {
        NodeAssert.deepStrictEqual(
            parseIPv6Address('a::1', false),
            ['a', '0', '0', '0', '0', '0', '0', '1']
        );
        NodeAssert.deepStrictEqual(
            parseIPv6Address('a::1', true),
            ['000a', '0000', '0000', '0000', '0000', '0000', '0000', '0001']
        );

        NodeAssert.deepStrictEqual(
            parseIPv6Address('a:b::1', false),
            ['a', 'b', '0', '0', '0', '0', '0', '1']
        );
        NodeAssert.deepStrictEqual(
            parseIPv6Address('a:b::1', true),
            ['000a', '000b', '0000', '0000', '0000', '0000', '0000', '0001']
        );

        NodeAssert.deepStrictEqual(
            parseIPv6Address('abc:b123::1', false),
            ['abc', 'b123', '0', '0', '0', '0', '0', '1']
        );
        NodeAssert.deepStrictEqual(
            parseIPv6Address('abc:b123::1', true),
            ['0abc', 'b123', '0000', '0000', '0000', '0000', '0000', '0001']
        );
    });

    NodeTest.it('Should process IPv4-mapped IPv6 address correctly', () => {

        NodeAssert.deepStrictEqual(
            parseIPv6Address('abc:b123::1.2.3.4', false),
            ['abc', 'b123', '0', '0', '0', '0', '102', '304']
        );
        NodeAssert.deepStrictEqual(
            parseIPv6Address('abc:b123::1.2.3.4', true),
            ['0abc', 'b123', '0000', '0000', '0000', '0000', '0102', '0304']
        );

        NodeAssert.deepStrictEqual(
            parseIPv6Address('::abc:b123:1.2.3.4', false),
            ['0', '0', '0', '0', 'abc', 'b123', '102', '304']
        );
        NodeAssert.deepStrictEqual(
            parseIPv6Address('::abc:b123:1.2.3.4', true),
            ['0000', '0000', '0000', '0000', '0abc', 'b123', '0102', '0304']
        );

        NodeAssert.deepStrictEqual(
            parseIPv6Address('::ffff:1.2.3.4', true),
            ['0000', '0000', '0000', '0000', '0000', 'ffff', '0102', '0304']
        );
        NodeAssert.deepStrictEqual(
            parseIPv6Address('::ffff:1.2.3.4', false),
            ['0', '0', '0', '0', '0', 'ffff', '102', '304']
        );

        NodeAssert.deepStrictEqual(
            parseIPv6Address('::1.2.3.4', false),
            ['0', '0', '0', '0', '0', '0', '102', '304']
        );

        NodeAssert.deepStrictEqual(
            parseIPv6Address('::1:a:d:e:f:1.2.3.4', false),
            ['0', '1', 'a', 'd', 'e', 'f', '102', '304']
        );
        NodeAssert.deepStrictEqual(
            parseIPv6Address('::1:a:d:e:f:1.2.3.4', true),
            ['0000', '0001', '000a', '000d', '000e', '000f', '0102', '0304']
        );

        NodeAssert.deepStrictEqual(
            parseIPv6Address('2001:db8:3333:4444:5555:6666:1.2.3.4', true),
            ['2001', '0db8', '3333', '4444', '5555', '6666', '0102', '0304']
        );
    });

    NodeTest.it('Should process full IPv6 address correctly', () => {
        NodeAssert.deepStrictEqual(
            parseIPv6Address('2001:0db8:85a3:0000:0000:8a2e:0370:7334', true),
            ['2001', '0db8', '85a3', '0000', '0000', '8a2e', '0370', '7334']
        );
        NodeAssert.deepStrictEqual(
            parseIPv6Address('2001:0db8:85a3:0000:0000:8a2e:0370:7334', false),
            ['2001', 'db8', '85a3', '0', '0', '8a2e', '370', '7334']
        );
    });

    NodeTest.it('Should process zero IPv6 address correctly', () => {

        NodeAssert.deepStrictEqual(
            parseIPv6Address(
                parseIPv6Address('0:0:0:0:0:0:0:0', true).join(':'),
                false
            ),
            ['0', '0', '0', '0', '0', '0', '0', '0']
        );
    });

    NodeTest.it('Should process maximum IPv6 address correctly', () => {
        NodeAssert.deepStrictEqual(
            parseIPv6Address(
                parseIPv6Address('ffff:ffff:ffff:ffff:ffff:ffff:255.255.255.255', true).join(':'),
                false
            ),
            ['ffff', 'ffff', 'ffff', 'ffff', 'ffff', 'ffff', 'ffff', 'ffff']
        );
    });

    NodeTest.it('Should throw error on invalid IPv6 address', () => {
        for (const v of [
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
            '::1:a:d:e:f:a:1.2.3.4', // 0:0:1:a:d:e:f:102:304 // too long
            '::1:a:d:e:f:a:1.2.3.256',
        ]) {
            try {

                NodeAssert.throws(() => {

                    parseIPv6Address(v, false);
                });
            }
            catch (e) {
                console.error(`Failed case: ${v}`);
                throw e;
            }
        }
    });
});

NodeTest.describe('Function Network.parseIPv6AddressToUInt16Array', () => {

    NodeTest.it('Should process "::" correctly', () => {

        NodeAssert.deepStrictEqual(
            parseIPv6AddressToUInt16Array('::'),
            [0, 0, 0, 0, 0, 0, 0, 0]
        );
    });

    NodeTest.it('Should process "::1" correctly', () => {

        NodeAssert.deepStrictEqual(
            parseIPv6AddressToUInt16Array('::1'),
            [0, 0, 0, 0, 0, 0, 0, 1]
        );
    });

    NodeTest.it('Should process middle "::" correctly', () => {
        NodeAssert.deepStrictEqual(
            parseIPv6AddressToUInt16Array('a::1'),
            [10, 0, 0, 0, 0, 0, 0, 1]
        );

        NodeAssert.deepStrictEqual(
            parseIPv6AddressToUInt16Array('a:b::1'),
            [10, 11, 0, 0, 0, 0, 0, 1]
        );

        NodeAssert.deepStrictEqual(
            parseIPv6AddressToUInt16Array('abc:b123::1'),
            [0xabc, 0xb123, 0, 0, 0, 0, 0, 1]
        );
    });

    NodeTest.it('Should process IPv4-mapped IPv6 address correctly', () => {

        NodeAssert.deepStrictEqual(
            parseIPv6AddressToUInt16Array('abc:b123::1.2.3.4'),
            [0xabc, 0xb123, 0, 0, 0, 0, 0x102, 0x304]
        );

        NodeAssert.deepStrictEqual(
            parseIPv6AddressToUInt16Array('::abc:b123:1.2.3.4'),
            [0, 0, 0, 0, 0xabc, 0xb123, 0x102, 0x304]
        );

        NodeAssert.deepStrictEqual(
            parseIPv6AddressToUInt16Array('::ffff:1.2.3.4'),
            [0, 0, 0, 0, 0, 0xffff, 0x102, 0x304]
        );

        NodeAssert.deepStrictEqual(
            parseIPv6AddressToUInt16Array('::1.2.3.4'),
            [0, 0, 0, 0, 0, 0, 0x102, 0x304]
        );

        NodeAssert.deepStrictEqual(
            parseIPv6AddressToUInt16Array('::1:a:d:e:f:1.2.3.4'),
            [0, 1, 0xa, 0xd, 0xe, 0xf, 0x102, 0x304]
        );

        NodeAssert.deepStrictEqual(
            parseIPv6AddressToUInt16Array('2001:db8:3333:4444:5555:6666:1.2.3.4'),
            [0x2001, 0x0db8, 0x3333, 0x4444, 0x5555, 0x6666, 0x0102, 0x0304]
        );
    });

    NodeTest.it('Should process full IPv6 address correctly', () => {
        NodeAssert.deepStrictEqual(
            parseIPv6AddressToUInt16Array('2001:0db8:85a3:0000:0000:8a2e:0370:7334'),
            [0x2001, 0x0db8, 0x85a3, 0x0000, 0x0000, 0x8a2e, 0x0370, 0x7334]
        );
    });

    NodeTest.it('Should process zero IPv6 address correctly', () => {

        NodeAssert.deepStrictEqual(
            parseIPv6AddressToUInt16Array(
                parseIPv6AddressToUInt16Array('0:0:0:0:0:0:0:0').join(':'),
            ),
            [0, 0, 0, 0, 0, 0, 0, 0]
        );
    });

    NodeTest.it('Should process maximum IPv6 address correctly', () => {
        NodeAssert.deepStrictEqual(
            parseIPv6AddressToUInt16Array(
                parseIPv6AddressToUInt16Array('ffff:ffff:ffff:ffff:ffff:ffff:255.255.255.255').map(i => i.toString(16)).join(':'),
            ),
            [0xffff, 0xffff, 0xffff, 0xffff, 0xffff, 0xffff, 0xffff, 0xffff]
        );
    });

    NodeTest.it('Should throw error on invalid IPv6 address', () => {
        for (const v of [
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
            '::1:a:d:e:f:a:1.2.3.4', // 0:0:1:a:d:e:f:102:304 // too long
            '::1:a:d:e:f:a:1.2.3.256',
        ]) {
            try {

                NodeAssert.throws(() => {

                    parseIPv6AddressToUInt16Array(v);
                });
            }
            catch (e) {
                console.error(`Failed case: ${v}`);
                throw e;
            }
        }
    });
});
