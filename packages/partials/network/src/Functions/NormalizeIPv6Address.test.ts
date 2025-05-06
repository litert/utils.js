import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { normalizeIPv6Address } from './NormalizeIPv6Address';

NodeTest.describe('Function Network.normalizeIPv6Address', () => {

    NodeTest.it('Should process "::" correctly', () => {

        NodeAssert.strictEqual(
            normalizeIPv6Address('::', false),
            '0:0:0:0:0:0:0:0'
        );
        NodeAssert.strictEqual(
            normalizeIPv6Address('::', true),
            '0000:0000:0000:0000:0000:0000:0000:0000'
        );
    });

    NodeTest.it('Should process "::1" correctly', () => {
        NodeAssert.strictEqual(
            normalizeIPv6Address('::1', false),
            '0:0:0:0:0:0:0:1'
        );
        NodeAssert.strictEqual(
            normalizeIPv6Address('::1', true),
            '0000:0000:0000:0000:0000:0000:0000:0001'
        );
    });

    NodeTest.it('Should process middle "::" correctly', () => {
        NodeAssert.strictEqual(
            normalizeIPv6Address('a::1', false),
            'a:0:0:0:0:0:0:1'
        );
        NodeAssert.strictEqual(
            normalizeIPv6Address('a::1', true),
            '000a:0000:0000:0000:0000:0000:0000:0001'
        );

        NodeAssert.strictEqual(
            normalizeIPv6Address('a:b::1', false),
            'a:b:0:0:0:0:0:1'
        );
        NodeAssert.strictEqual(
            normalizeIPv6Address('a:b::1', true),
            '000a:000b:0000:0000:0000:0000:0000:0001'
        );

        NodeAssert.strictEqual(
            normalizeIPv6Address('abc:b123::1', false),
            'abc:b123:0:0:0:0:0:1'
        );
        NodeAssert.strictEqual(
            normalizeIPv6Address('abc:b123::1', true),
            '0abc:b123:0000:0000:0000:0000:0000:0001'
        );
    });

    NodeTest.it('Should process IPv4-mapped IPv6 address correctly', () => {

        NodeAssert.strictEqual(
            normalizeIPv6Address('abc:b123::1.2.3.4', false),
            'abc:b123:0:0:0:0:102:304'
        );
        NodeAssert.strictEqual(
            normalizeIPv6Address('abc:b123::1.2.3.4', true),
            '0abc:b123:0000:0000:0000:0000:0102:0304'
        );

        NodeAssert.strictEqual(
            normalizeIPv6Address('::abc:b123:1.2.3.4', false),
            '0:0:0:0:abc:b123:102:304'
        );
        NodeAssert.strictEqual(
            normalizeIPv6Address('::abc:b123:1.2.3.4', true),
            '0000:0000:0000:0000:0abc:b123:0102:0304'
        );

        NodeAssert.strictEqual(
            normalizeIPv6Address('::ffff:1.2.3.4', true),
            '0000:0000:0000:0000:0000:ffff:0102:0304'
        );
        NodeAssert.strictEqual(
            normalizeIPv6Address('::ffff:1.2.3.4', false),
            '0:0:0:0:0:ffff:102:304'
        );

        NodeAssert.strictEqual(
            normalizeIPv6Address('::1.2.3.4', false),
            '0:0:0:0:0:0:102:304'
        );

        NodeAssert.strictEqual(
            normalizeIPv6Address('::1:a:d:e:f:1.2.3.4', false),
            '0:1:a:d:e:f:102:304'
        );
        NodeAssert.strictEqual(
            normalizeIPv6Address('::1:a:d:e:f:1.2.3.4', true),
            '0000:0001:000a:000d:000e:000f:0102:0304'
        );

        NodeAssert.strictEqual(
            normalizeIPv6Address('2001:db8:3333:4444:5555:6666:1.2.3.4', true),
            '2001:0db8:3333:4444:5555:6666:0102:0304'
        );
    });

    NodeTest.it('Should process full IPv6 address correctly', () => {
        NodeAssert.strictEqual(
            normalizeIPv6Address('2001:0db8:85a3:0000:0000:8a2e:0370:7334', true),
            '2001:0db8:85a3:0000:0000:8a2e:0370:7334'
        );
        NodeAssert.strictEqual(
            normalizeIPv6Address('2001:0db8:85a3:0000:0000:8a2e:0370:7334', false),
            '2001:db8:85a3:0:0:8a2e:370:7334'
        );
    });

    NodeTest.it('Should process zero IPv6 address correctly', () => {

        NodeAssert.strictEqual(
            normalizeIPv6Address(
                normalizeIPv6Address('0:0:0:0:0:0:0:0', true),
                false
            ),
            '0:0:0:0:0:0:0:0'
        );
    });

    NodeTest.it('Should process maximum IPv6 address correctly', () => {
        NodeAssert.strictEqual(
            normalizeIPv6Address(
                normalizeIPv6Address('ffff:ffff:ffff:ffff:ffff:ffff:255.255.255.255', true),
                false
            ),
            'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff'
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

                    normalizeIPv6Address(v, false);
                });
            }
            catch (e) {
                console.error(`Failed case: ${v}`);
                throw e;
            }
        }
    });

});
