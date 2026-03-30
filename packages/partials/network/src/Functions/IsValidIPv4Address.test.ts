/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { isValidIPv4Address } from './IsValidIPv4Address.js';

NodeTest.describe('Module Network - Function IsValidIPv4Address', () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    for (const [_i, validIPv4Addr] of [
        '1.1.1.1',
        '192.168.1.1',
        '10.0.0.0',
        '0.0.0.255',
    ].entries()) {

        NodeTest.it(`B-M-${String(_i + 1).padStart(5, '0')}: Should treat "${validIPv4Addr}" as a valid IPv4 address`, () => {

            NodeAssert.strictEqual(isValidIPv4Address(validIPv4Addr), true);
        });
    }

    // ─── Black-Box: Failure Flow ─────────────────────────

    for (const [_i, invalidIPv4Addr] of [
        '256.256.256.256',
        '1.1.1.256',
        '1.1.1',
        '1.1',
        '1',
        '01.0.0.0',
        '0.00.0.0',
        '0.0.02.0',
        '0.0.025.0',
        '1.1.1.1.1',
        '1.1.1.',
        '.1.1.1',
        '1..1.1',
        'a.b.c.d',
        '-1.-1.-1.-1',
    ].entries()) {

        NodeTest.it(`B-F-${String(_i + 1).padStart(5, '0')}: Should treat "${invalidIPv4Addr}" as an invalid IPv4 address`, () => {

            NodeAssert.strictEqual(isValidIPv4Address(invalidIPv4Addr), false);
        });
    }

    // ─── Black-Box: Edge Cases ───────────────────────────

    NodeTest.it('B-E-00001: Should treat "255.255.255.255" as a valid IPv4 address', () => {

        NodeAssert.strictEqual(isValidIPv4Address('255.255.255.255'), true);
    });

    NodeTest.it('B-E-00002: Should treat "127.0.0.1" as a valid IPv4 address', () => {

        NodeAssert.strictEqual(isValidIPv4Address('127.0.0.1'), true);
    });

    NodeTest.it('B-E-00003: Should treat "0.0.0.0" as a valid IPv4 address', () => {

        NodeAssert.strictEqual(isValidIPv4Address('0.0.0.0'), true);
    });

    NodeTest.it('B-E-00004: Should treat "" as an invalid IPv4 address', () => {

        NodeAssert.strictEqual(isValidIPv4Address(''), false);
    });
});
