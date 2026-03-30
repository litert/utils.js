/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { parseKeyValue } from './ParseKeyValue.js';

NodeTest.describe('Module String - Function ParseKeyValue', () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    NodeTest.it('B-M-00001: Should return correct key-value pairs', () => {

        NodeAssert.deepStrictEqual(parseKeyValue('a=b'), ['a', 'b']);
        NodeAssert.deepStrictEqual(parseKeyValue('a=b=c'), ['a', 'b=c']);
        NodeAssert.deepStrictEqual(parseKeyValue('a = b'), ['a', 'b']);
        NodeAssert.deepStrictEqual(parseKeyValue(' a = b '), ['a', 'b']);
        NodeAssert.deepStrictEqual(parseKeyValue('a='), ['a', '']);
        NodeAssert.deepStrictEqual(parseKeyValue('=b'), ['', 'b']);
        NodeAssert.deepStrictEqual(parseKeyValue('='), ['', '']);
    });

    NodeTest.it('B-M-00002: Options.assignSign should work', () => {

        NodeAssert.deepStrictEqual(parseKeyValue('a:b', { assignSign: ':' }), ['a', 'b']);
        NodeAssert.deepStrictEqual(parseKeyValue('a:b:c', { assignSign: ':' }), ['a', 'b:c']);
        NodeAssert.deepStrictEqual(parseKeyValue('a:b=c', { assignSign: ':' }), ['a', 'b=c']);
        NodeAssert.deepStrictEqual(parseKeyValue('a=>b', { assignSign: '=>' }), ['a', 'b']);
        NodeAssert.deepStrictEqual(parseKeyValue('a=>b=>c', { assignSign: '=>' }), ['a', 'b=>c']);
        NodeAssert.deepStrictEqual(parseKeyValue('a=>b=c', { assignSign: '=>' }), ['a', 'b=c']);
        NodeAssert.deepStrictEqual(parseKeyValue('a=>b=c', { assignSign: '=' }), ['a', '>b=c']);

        NodeAssert.deepStrictEqual(parseKeyValue('a=b', { assignSign: ':' }), null);
    });

    NodeTest.it('B-M-00003: Options.trimKey and options.trimValue should work', () => {

        NodeAssert.deepStrictEqual(parseKeyValue(' a = b ', { trimKey: false, trimValue: false }), [' a ', ' b ']);
        NodeAssert.deepStrictEqual(parseKeyValue(' a = b ', { trimKey: true, trimValue: false }), ['a', ' b ']);
        NodeAssert.deepStrictEqual(parseKeyValue(' a = b ', { trimKey: false, trimValue: true }), [' a ', 'b']);
        NodeAssert.deepStrictEqual(parseKeyValue(' a = b ', { trimKey: true, trimValue: true }), ['a', 'b']);

        NodeAssert.deepStrictEqual(parseKeyValue('  =  ', { trimKey: false, trimValue: false }), ['  ', '  ']);
        NodeAssert.deepStrictEqual(parseKeyValue('  =  ', { trimKey: true, trimValue: false }), ['', '  ']);
        NodeAssert.deepStrictEqual(parseKeyValue('  =  ', { trimKey: false, trimValue: true }), ['  ', '']);
        NodeAssert.deepStrictEqual(parseKeyValue('  =  ', { trimKey: true, trimValue: true }), ['', '']);
    });

    NodeTest.it('B-M-00004: Should use default trimValue=true when only trimKey is overridden', () => {

        NodeAssert.deepStrictEqual(parseKeyValue(' a = b ', { trimKey: false }), [' a ', 'b']);
    });

    NodeTest.it('B-M-00005: Should use default trimKey=true when only trimValue is overridden', () => {

        NodeAssert.deepStrictEqual(parseKeyValue(' a = b ', { trimValue: false }), ['a', ' b ']);
    });

    NodeTest.it('B-M-00006: Should use default assignSign when only trim options are provided', () => {

        NodeAssert.deepStrictEqual(parseKeyValue('a=b', { trimKey: false, trimValue: false }), ['a', 'b']);
    });

    // ─── Black-Box: Failure Flow ─────────────────────────

    NodeTest.it('B-F-00001: Should return null for invalid expressions', () => {

        NodeAssert.strictEqual(parseKeyValue('abc'), null);
        NodeAssert.strictEqual(parseKeyValue(''), null);
    });
});
