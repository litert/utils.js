import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { isValidIPv4Address } from './IsValidIPv4Address';

NodeTest.describe('Function Network.isValidIPv4Address', () => {

    for (const validIPv4Addr of [
        '1.1.1.1',
        '255.255.255.255',
        '127.0.0.1',
        '127.0.0.1',
        '0.0.0.0',
    ]) {

        NodeTest.it(`Should treat "${validIPv4Addr}" as a valid IPv4 address`, () => {

            NodeAssert.strictEqual(isValidIPv4Address(validIPv4Addr), true);
        });
    }

    for (const invalidIPv4Addr of [
        '256.256.256.256',
        '1.1.1',
        '01.0.0.0',
        '0.00.0.0',
        '0.0.02.0',
        '0.0.025.0',
        '1.1.1.1.1',
        '',
        'a.b.c.d',
        '-1.-1.-1.-1',
    ]) {

        NodeTest.it(`Should treat "${invalidIPv4Addr}" as an invalid IPv4 address`, () => {

            NodeAssert.strictEqual(isValidIPv4Address(invalidIPv4Addr), false);
        });
    }
});
