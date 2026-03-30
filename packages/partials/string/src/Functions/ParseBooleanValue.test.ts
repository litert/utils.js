/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { parseBooleanValue, DEFAULT_BOOLEAN_VALUE_MAPPINGS } from './ParseBooleanValue.js';

NodeTest.describe('Module String - Function ParseBooleanValue', () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    const TRUTHY_VALUES = ['true', '1', 'yes', 'on', 'y', 'enabled', 'active', 'ok', 'allow', 'allowed'];

    for (const val of TRUTHY_VALUES) {

        NodeTest.it(`B-M-00001: Should return true for "${val}"`, () => {

            NodeAssert.strictEqual(parseBooleanValue(val), true);
        });
    }

    const FALSY_VALUES = ['false', '0', 'no', 'off', 'n', 'disabled', 'inactive', 'deny', 'denied'];

    for (const val of FALSY_VALUES) {

        NodeTest.it(`B-M-00002: Should return false for "${val}"`, () => {

            NodeAssert.strictEqual(parseBooleanValue(val), false);
        });
    }

    NodeTest.it('B-M-00003: Should be case-insensitive by default (caseSensitive not set)', () => {

        NodeAssert.strictEqual(parseBooleanValue('TRUE'), true);
        NodeAssert.strictEqual(parseBooleanValue('YES'), true);
        NodeAssert.strictEqual(parseBooleanValue('ON'), true);
        NodeAssert.strictEqual(parseBooleanValue('FALSE'), false);
        NodeAssert.strictEqual(parseBooleanValue('NO'), false);
        NodeAssert.strictEqual(parseBooleanValue('OFF'), false);
    });

    NodeTest.it('B-M-00004: Should be case-insensitive when caseSensitive is false', () => {

        NodeAssert.strictEqual(parseBooleanValue('True', { caseSensitive: false }), true);
        NodeAssert.strictEqual(parseBooleanValue('FALSE', { caseSensitive: false }), false);
        NodeAssert.strictEqual(parseBooleanValue('No', { caseSensitive: false }), false);
    });

    NodeTest.it('B-M-00005: Should return undefined for uppercase when caseSensitive is true', () => {

        NodeAssert.strictEqual(parseBooleanValue('TRUE', { caseSensitive: true }), undefined);
        NodeAssert.strictEqual(parseBooleanValue('YES', { caseSensitive: true }), undefined);
        NodeAssert.strictEqual(parseBooleanValue('NO', { caseSensitive: true }), undefined);
        NodeAssert.strictEqual(parseBooleanValue('FALSE', { caseSensitive: true }), undefined);
    });

    NodeTest.it('B-M-00006: Should match exact case when caseSensitive is true', () => {

        NodeAssert.strictEqual(parseBooleanValue('true', { caseSensitive: true }), true);
        NodeAssert.strictEqual(parseBooleanValue('false', { caseSensitive: true }), false);
        NodeAssert.strictEqual(parseBooleanValue('yes', { caseSensitive: true }), true);
        NodeAssert.strictEqual(parseBooleanValue('no', { caseSensitive: true }), false);
    });

    NodeTest.it('B-M-00007: Should return defaultValue:true for unknown string', () => {

        NodeAssert.strictEqual(parseBooleanValue('unknown', { defaultValue: true }), true);
    });

    NodeTest.it('B-M-00008: Should return defaultValue:false for unknown string', () => {

        NodeAssert.strictEqual(parseBooleanValue('unknown', { defaultValue: false }), false);
    });

    NodeTest.it('B-M-00009: Should NOT use defaultValue when key matches (even if value is false)', () => {

        NodeAssert.strictEqual(parseBooleanValue('no', { defaultValue: true }), false);
        NodeAssert.strictEqual(parseBooleanValue('false', { defaultValue: true }), false);
        NodeAssert.strictEqual(parseBooleanValue('0', { defaultValue: true }), false);
    });

    NodeTest.it('B-M-00010: Should use custom mappings instead of defaults', () => {

        const customMappings = { 'oui': true, 'non': false };

        NodeAssert.strictEqual(parseBooleanValue('oui', { mappings: customMappings }), true);
        NodeAssert.strictEqual(parseBooleanValue('non', { mappings: customMappings }), false);
    });

    NodeTest.it('B-M-00011: Should return undefined for default keys when custom mappings provided', () => {

        const customMappings = { 'oui': true };

        NodeAssert.strictEqual(parseBooleanValue('true', { mappings: customMappings }), undefined);
        NodeAssert.strictEqual(parseBooleanValue('false', { mappings: customMappings }), undefined);
    });

    NodeTest.it('B-M-00012: Custom mappings with defaultValue fallback', () => {

        const customMappings = { 'da': true };

        NodeAssert.strictEqual(parseBooleanValue('nyet', { mappings: customMappings, defaultValue: false }), false);
    });

    NodeTest.it('B-M-00013: Custom mappings are case-sensitive when caseSensitive is true', () => {

        const customMappings = { 'oui': true };

        NodeAssert.strictEqual(parseBooleanValue('OUI', { mappings: customMappings, caseSensitive: true }), undefined);
        NodeAssert.strictEqual(parseBooleanValue('oui', { mappings: customMappings, caseSensitive: true }), true);
    });

    NodeTest.it('B-M-00014: Custom mappings are case-insensitive when caseSensitive is false', () => {

        const customMappings = { 'oui': true };

        NodeAssert.strictEqual(parseBooleanValue('OUI', { mappings: customMappings, caseSensitive: false }), true);
    });

    NodeTest.it('B-M-00015: Should export DEFAULT_BOOLEAN_VALUE_MAPPINGS with truthy entries', () => {

        for (const key of ['true', '1', 'yes', 'on', 'y', 'enabled', 'active', 'ok', 'allow', 'allowed']) {

            NodeAssert.strictEqual(DEFAULT_BOOLEAN_VALUE_MAPPINGS[key], true, `Expected "${key}" to map to true`);
        }
    });

    NodeTest.it('B-M-00016: Should export DEFAULT_BOOLEAN_VALUE_MAPPINGS with falsy entries', () => {

        for (const key of ['false', '0', 'no', 'off', 'n', 'disabled', 'inactive', 'deny', 'denied']) {

            NodeAssert.strictEqual(DEFAULT_BOOLEAN_VALUE_MAPPINGS[key], false, `Expected "${key}" to map to false`);
        }
    });

    NodeTest.it('B-M-00017: DEFAULT_BOOLEAN_VALUE_MAPPINGS should be sealed (not extensible)', () => {

        NodeAssert.strictEqual(Object.isSealed(DEFAULT_BOOLEAN_VALUE_MAPPINGS), true);
    });

    // ─── Black-Box: Edge Cases ───────────────────────────

    NodeTest.it('B-E-00001: Should return undefined for unknown string', () => {

        NodeAssert.strictEqual(parseBooleanValue('unknown'), undefined);
    });

    NodeTest.it('B-E-00002: Should return undefined for empty string', () => {

        NodeAssert.strictEqual(parseBooleanValue(''), undefined);
    });

    NodeTest.it('B-E-00003: Should return undefined for whitespace-only string', () => {

        NodeAssert.strictEqual(parseBooleanValue('   '), undefined);
    });

    NodeTest.it('B-E-00004: Should return undefined for numeric string not in defaults', () => {

        NodeAssert.strictEqual(parseBooleanValue('2'), undefined);
        NodeAssert.strictEqual(parseBooleanValue('-1'), undefined);
    });

    NodeTest.it('B-E-00005: Should return defaultValue for empty string', () => {

        NodeAssert.strictEqual(parseBooleanValue('', { defaultValue: true }), true);
    });

    NodeTest.it('B-E-00006: Should return undefined when no match and defaultValue is not set', () => {

        NodeAssert.strictEqual(parseBooleanValue('nope', {}), undefined);
    });
});
