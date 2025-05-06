import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { isValidIPv6Address } from './IsValidIPv6Address';

NodeTest.describe('Function Network.isValidIPv6Address', () => {

    for (const validIPv6Addr of [
        '::',
        '0:0:0:0:0:0:0:0',
        '0000:0000:0000:0000:0000:0000:0000:0000',
        '::1',
        '0:0:0:0:0:0:0:1',
        '0000:0000:0000:0000:0000:0000:0000:0001',
        '::ffff:0',
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
        'abc:b123::1.2.3.4',
        'abc:b123:0:0:0:0:102:304',
        '0abc:b123:0000:0000:0000:0000:0102:0304',
        '::abc:b123:1.2.3.4',
        '0:0:0:0:abc:b123:102:304',
        '0000:0000:0000:0000:0abc:b123:0102:0304',
        '::ffff:1.2.3.4',
        '0000:0000:0000:0000:0000:ffff:0102:0304',
        '0:0:0:0:0:ffff:102:304',
        '::1.2.3.4',
        '0:0:0:0:0:0:102:304',
        '::1:a:d:e:f:1.2.3.4',
        '2001:db8:3333:4444:5555:6666:1.2.3.4',
        '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
        '2001:db8:85a3:0:0:8a2e:370:7334',
        'ffff:ffff:ffff:ffff:ffff:ffff:255.255.255.255',
        'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
        '1.2.3.4',
        '255.255.255.255',
        '0.0.0.0',
    ]) {

        NodeTest.it(`Should treat "${validIPv6Addr}" as a valid IPv6 address`, () => {

            NodeAssert.strictEqual(
                isValidIPv6Address(validIPv6Addr),
                true
            );
        });
    }

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
        'hello',
        ' ',
        '1234.1.1.1',
        '256.1.1.1',
        '1.256.1.1',
        '1.1.256.1',
        '1.1.1.256',
        '1.1.1.23333',
        '你好',
    ]) {

        NodeTest.it(`Should treat "${v}" as an invalid IPv6 address`, () => {
            NodeAssert.strictEqual(
                isValidIPv6Address(v),
                false
            );
        });
    }
});
