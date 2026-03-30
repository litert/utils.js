/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { isValidMacAddress } from './IsValidMacAddress.js';

NodeTest.describe('Module Network - Function IsValidMacAddress', () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    for (const [_i, validMacAddr] of [
        '00-11-22-33-44-55',
        '00:11:22:33:44:55',
        '01-23-45-67-89-ab',
        '01:23:45:67:89:ab',
        'a1-b2-c3-d4-e5-f6',
        'a1:b2:c3:d4:e5:f6',
        '01-23-45-67-89-aB',
        '01:23:45:67:89:AB',
        '01-23-45-67-89-AB',
        '01:23:45:67:89:AB',
        'A1-B2-C3-D4-E5-F6',
        'A1:B2:C3:D4:E5:F6',
    ].entries()) {

        NodeTest.it(`B-M-${String(_i + 1).padStart(5, '0')}: Should treat "${validMacAddr}" as a valid MAC address`, () => {

            NodeAssert.strictEqual(
                isValidMacAddress(validMacAddr),
                true
            );
        });
    }

    // ─── Black-Box: Failure Flow ─────────────────────────

    for (const [_i, invalidMacAddr] of [
        'a',
        'a1',
        'a1-b2',
        'a1:b2',
        'a1-b2-c3',
        'a1:b2:c3',
        'a1-b2-c3-d4',
        'a1:b2:c3:d4',
        'a1-b2-c3-d4-e5',
        'a1:b2:c3:d4:e5',
        'a1-b2-c3-d4-e5-f6-g7',
        'a1:b2:c3:d4:e5:f6:g7',
        '01-23-45-67-89-aB-cD',
        '01:23:45:67:89:AB:CD',
        '01-23-45-67-89-aB-CD',
        '01:23:45:67:89:AB-CD',
        '01-23-45:67:89:ab',
        '001-22-33-44-55-66',
        '0-22-33-44-55-66',
        'GG-11-22-33-44-55',
        null,
        1234,
    ].entries()) {

        NodeTest.it(`B-F-${String(_i + 1).padStart(5, '0')}: Should treat "${invalidMacAddr}" as an invalid MAC address`, () => {

            NodeAssert.strictEqual(
                isValidMacAddress(invalidMacAddr as string),
                false
            );
        });
    }

    // ─── Black-Box: Edge Cases ───────────────────────────

    NodeTest.it('B-E-00001: Should treat "00-00-00-00-00-00" as a valid MAC address', () => {

        NodeAssert.strictEqual(
            isValidMacAddress('00-00-00-00-00-00'),
            true
        );
    });

    NodeTest.it('B-E-00002: Should treat "ff-ff-ff-ff-ff-ff" as a valid MAC address', () => {

        NodeAssert.strictEqual(
            isValidMacAddress('ff-ff-ff-ff-ff-ff'),
            true
        );
    });

    NodeTest.it('B-E-00003: Should treat "FF:FF:FF:FF:FF:FF" as a valid MAC address', () => {

        NodeAssert.strictEqual(
            isValidMacAddress('FF:FF:FF:FF:FF:FF'),
            true
        );
    });

    NodeTest.it('B-E-00004: Should treat "" as an invalid MAC address', () => {

        NodeAssert.strictEqual(
            isValidMacAddress(''),
            false
        );
    });
});
