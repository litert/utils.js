import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { isValidMacAddress } from './IsValidMacAddress';

NodeTest.describe('Function Network.isValidMacAddress', () => {

    for (const validMacAddr of [
        '00-11-22-33-44-55',
        '00:11:22:33:44:55',
        '00-11-22-33-44-55',
        '00:11:22:33:44:55',
        '01-23-45-67-89-ab',
        '01:23:45:67:89:ab',
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
    ]) {

        NodeTest.it(`Should treat "${validMacAddr}" as a valid MAC address`, () => {

            NodeAssert.strictEqual(
                isValidMacAddress(validMacAddr),
                true
            );
        });
    }

    for (const invalidMacAddr of [
        '',
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
    ]) {

        NodeTest.it(`Should treat "${invalidMacAddr}" as an invalid MAC address`, () => {

            NodeAssert.strictEqual(
                isValidMacAddress(invalidMacAddr),
                false
            );
        });
    }
});
