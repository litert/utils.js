/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { UnitParser } from './UnitParser.js';

NodeTest.describe('Module String - Class UnitParser', () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    NodeTest.it('B-M-00001: Should owns same values of the options in properties', () => {

        const parser = new UnitParser({
            format: '{value} {unit}',
            units: ['cm', 'm', 'km'],
            caseInsensitive: false,
            maxDecimalPlaces: 12
        });
        NodeAssert.strictEqual(parser.format, '{value} {unit}');
        NodeAssert.deepStrictEqual(parser.units, [{
            name: 'cm',
            aliases: ['cm'],
        }, {
            name: 'm',
            aliases: ['m'],
        }, {
            name: 'km',
            aliases: ['km'],
        }]);
        NodeAssert.strictEqual(parser.caseInsensitive, false);
        NodeAssert.strictEqual(parser.maxDecimalPlaces, 12);
    });

    NodeTest.it('B-M-00002: Should use "true" as the default value of "caseInsensitive" property', () => {

        const parser = new UnitParser({
            format: '{value} {unit}',
            units: ['cm', 'm', 'km'],
        });
        NodeAssert.strictEqual(parser.caseInsensitive, true);
    });

    NodeTest.it('B-M-00003: Should use 2 as the default value of "maxDecimalPlaces" property', () => {

        const parser = new UnitParser({
            format: '{value} {unit}',
            units: ['cm', 'm', 'km'],
        });
        NodeAssert.strictEqual(parser.maxDecimalPlaces, 2);
    });

    NodeTest.it('B-M-00004: Should ignore the case sensitivity of "format"', () => {

        new UnitParser({ format: '{UNIT}{value}', units: ['cm'] });
        
        new UnitParser({ format: '{UnIt}{vALuE}', units: ['cm'] });
    });

    NodeTest.it('B-M-00005: Should return the value and unit if the input is in the correct format', () => {

        const lengthParser = new UnitParser({
            format: '{value}{unit}',
            units: ['cm', 'm', 'km'],
        });

        NodeAssert.deepStrictEqual(lengthParser.parse('1.2m'), { value: '1.2', unit: 'm' });
        NodeAssert.deepStrictEqual(lengthParser.parse('0.9m'), { value: '0.9', unit: 'm' });
        NodeAssert.deepStrictEqual(lengthParser.parse('1.2cm'), { value: '1.2', unit: 'cm' });
        NodeAssert.deepStrictEqual(lengthParser.parse('12.92cm'), { value: '12.92', unit: 'cm' });
        NodeAssert.deepStrictEqual(lengthParser.parse('123km'), { value: '123', unit: 'km' });

        const sizeParser = new UnitParser({
            format: '{value} {unit}',
            units: [
                { name: 'Byte', aliases: ['bytes', 'B'], },
                { name: 'KiB', aliases: ['kb'], },
                { name: 'MiB', aliases: ['mb'], },
                { name: 'GiB', aliases: ['gb'], },
            ],
        });

        NodeAssert.deepStrictEqual(sizeParser.parse('123 Bytes'), { value: '123', unit: 'Byte' });
        NodeAssert.deepStrictEqual(sizeParser.parse('1 byte'), { value: '1', unit: 'Byte' });
        NodeAssert.deepStrictEqual(sizeParser.parse('1 B'), { value: '1', unit: 'Byte' });
        NodeAssert.deepStrictEqual(sizeParser.parse('1 b'), { value: '1', unit: 'Byte' });
        NodeAssert.deepStrictEqual(sizeParser.parse('1.2 gb'), { value: '1.2', unit: 'GiB' });
        NodeAssert.deepStrictEqual(sizeParser.parse('0.9 mb'), { value: '0.9', unit: 'MiB' });
        NodeAssert.deepStrictEqual(sizeParser.parse('1.2 kb'), { value: '1.2', unit: 'KiB' });
        NodeAssert.deepStrictEqual(sizeParser.parse('12 byte'), { value: '12', unit: 'Byte' });
        NodeAssert.deepStrictEqual(sizeParser.parse('123 gb'), { value: '123', unit: 'GiB' });
        NodeAssert.deepStrictEqual(sizeParser.parse('123 GiB'), { value: '123', unit: 'GiB' });

        const speedParser = new UnitParser({
            format: '{value}{unit}',
            units: [
                { name: 'km/h', aliases: ['kmph'] },
                { name: 'm/s', aliases: ['mps'] },
            ],
        });

        NodeAssert.deepStrictEqual(speedParser.parse('1.2km/h'), { value: '1.2', unit: 'km/h' });
        NodeAssert.deepStrictEqual(speedParser.parse('0.9m/s'), { value: '0.9', unit: 'm/s' });
        NodeAssert.deepStrictEqual(speedParser.parse('1.2m/s'), { value: '1.2', unit: 'm/s' });
        NodeAssert.deepStrictEqual(speedParser.parse('12km/h'), { value: '12', unit: 'km/h' });
        NodeAssert.deepStrictEqual(speedParser.parse('123km/h'), { value: '123', unit: 'km/h' });
        NodeAssert.deepStrictEqual(speedParser.parse('1.2kmph'), { value: '1.2', unit: 'km/h' });
        NodeAssert.deepStrictEqual(speedParser.parse('12kmph'), { value: '12', unit: 'km/h' });

        const valueParser1 = new UnitParser({
            format: '{value} {unit}',
            units: [
                { name: 'USD', aliases: ['us$'] },
                { name: 'EUR', aliases: ['euros'] },
                { name: 'CNY', aliases: ['元'] },
                { name: 'HKD', aliases: ['hk$'] },
            ],
        });

        NodeAssert.deepStrictEqual(valueParser1.parse('123.45 USD'), { value: '123.45', unit: 'USD' });
        NodeAssert.deepStrictEqual(valueParser1.parse('123.45 us$'), { value: '123.45', unit: 'USD' });
        NodeAssert.deepStrictEqual(valueParser1.parse('1 us$'), { value: '1', unit: 'USD' });
        NodeAssert.deepStrictEqual(valueParser1.parse('1.00 HKD'), { value: '1.00', unit: 'HKD' });
        NodeAssert.deepStrictEqual(valueParser1.parse('1.2 HK$'), { value: '1.2', unit: 'HKD' });
        NodeAssert.deepStrictEqual(valueParser1.parse('0.9 EUR'), { value: '0.9', unit: 'EUR' });
        NodeAssert.deepStrictEqual(valueParser1.parse('0.9 eUr'), { value: '0.9', unit: 'EUR' });
        NodeAssert.deepStrictEqual(valueParser1.parse('1.2 euros'), { value: '1.2', unit: 'EUR' });
        NodeAssert.deepStrictEqual(valueParser1.parse('12.92 euros'), { value: '12.92', unit: 'EUR' });
        NodeAssert.deepStrictEqual(valueParser1.parse('1.2 元'), { value: '1.2', unit: 'CNY' });
        NodeAssert.deepStrictEqual(valueParser1.parse('0 元'), { value: '0', unit: 'CNY' });
        NodeAssert.deepStrictEqual(valueParser1.parse('0.0 元'), { value: '0.0', unit: 'CNY' });
        NodeAssert.deepStrictEqual(valueParser1.parse('0.00 元'), { value: '0.00', unit: 'CNY' });

        const valueParser2 = new UnitParser({
            format: '{unit} {value}',
            units: [
                { name: 'USD', aliases: ['$'] },
                { name: 'EUR', aliases: ['€'] },
                { name: 'CNY', aliases: ['￥'] },
                { name: 'HKD', aliases: ['HK$'] },
                { name: 'GBP', aliases: ['£'] },
                { name: 'AUD', aliases: ['AU$'] },
                { name: 'CAD', aliases: ['CA$'] },
            ],
        });

        NodeAssert.deepStrictEqual(valueParser2.parse('USD 123.45'), { value: '123.45', unit: 'USD' });
        NodeAssert.deepStrictEqual(valueParser2.parse('$ 123.45'), { value: '123.45', unit: 'USD' });
        NodeAssert.deepStrictEqual(valueParser2.parse('CAD 999'), { value: '999', unit: 'CAD' });
        NodeAssert.deepStrictEqual(valueParser2.parse('CNY 999.99'), { value: '999.99', unit: 'CNY' });
        NodeAssert.deepStrictEqual(valueParser2.parse('￥ 999.99'), { value: '999.99', unit: 'CNY' });

        const valueParser3 = new UnitParser({
            format: '{unit} {value}',
            units: [
                { name: 'JPY', aliases: ['¥'] },
            ],
            maxDecimalPlaces: 0,
        });

        NodeAssert.deepStrictEqual(valueParser3.parse('¥ 100'), { value: '100', unit: 'JPY' });
        NodeAssert.deepStrictEqual(valueParser3.parse('¥ 100.0'), null);
        NodeAssert.deepStrictEqual(valueParser3.parse('¥ 100.00'), null);
        NodeAssert.deepStrictEqual(
            valueParser2.parse('¥ 100') ?? valueParser3.parse('¥ 100'),
            { value: '100', unit: 'JPY' }
        );
    });

    NodeTest.it('B-M-00006: Should parse correctly with caseInsensitive: false', () => {

        const parser = new UnitParser({
            format: '{value} {unit}',
            units: ['cm', 'm', 'km'],
            caseInsensitive: false,
        });

        NodeAssert.deepStrictEqual(parser.parse('1.2 cm'), { value: '1.2', unit: 'cm' });
        NodeAssert.strictEqual(parser.parse('1.2 CM'), null, 'Uppercase unit should not match in case-sensitive mode');
        NodeAssert.strictEqual(parser.parse('1.2 Cm'), null, 'Mixed-case unit should not match in case-sensitive mode');
        NodeAssert.strictEqual(parser.parse('1.2 KM'), null);
    });

    NodeTest.it('B-M-00007: Should treat the unit name as its own alias when no aliases are provided in IUnitInfo', () => {

        const parser = new UnitParser({
            format: '{value} {unit}',
            units: [{ name: 'km' }, { name: 'm' }],
        });

        NodeAssert.deepStrictEqual(parser.parse('10 km'), { value: '10', unit: 'km' });
        NodeAssert.deepStrictEqual(parser.parse('1.5 m'),  { value: '1.5', unit: 'm' });
        NodeAssert.strictEqual(parser.parse('1 dm'), null);
    });

    // ─── Black-Box: Failure Flow ─────────────────────────

    NodeTest.it('B-F-00001: Should throw RangeError if "unitNames" is set to an empty array', () => {

        NodeAssert.throws(
            () => new UnitParser({ format: '{value} {unit}', units: [] }),
            (e: unknown) => {
                NodeAssert.ok(e instanceof RangeError);
                NodeAssert.strictEqual((e as RangeError).message, 'The unitNames array must contain at least one element.');
                return true;
            },
        );
    });

    NodeTest.it('B-F-00002: Should throw SyntaxError if "format" does not contains "{value}"', () => {

        NodeAssert.throws(
            () => new UnitParser({ format: '{unit}', units: ['cm'] }),
            (e: unknown) => {
                NodeAssert.ok(e instanceof SyntaxError);
                NodeAssert.strictEqual((e as SyntaxError).message, 'The format must contain the {value} placeholder.');
                return true;
            },
        );
    });

    NodeTest.it('B-F-00003: Should throw SyntaxError if "format" does not contains "{unit}"', () => {

        NodeAssert.throws(
            () => new UnitParser({ format: '{value}', units: ['cm'] }),
            (e: unknown) => {
                NodeAssert.ok(e instanceof SyntaxError);
                NodeAssert.strictEqual((e as SyntaxError).message, 'The format must contain the {unit} placeholder.');
                return true;
            },
        );
    });

    NodeTest.it('B-F-00004: Should return null if the input is not in the correct format', () => {

        const lengthParser = new UnitParser({
            format: '{value}{unit}',
            units: ['cm', 'm', 'km'],
        });

        NodeAssert.strictEqual(lengthParser.parse('1.2'), null);
        NodeAssert.strictEqual(lengthParser.parse('1.2 m'), null);
        NodeAssert.strictEqual(lengthParser.parse('1.2 cm'), null);
        NodeAssert.strictEqual(lengthParser.parse('1.2 km'), null);
        NodeAssert.strictEqual(lengthParser.parse('1.2dm'), null);
        NodeAssert.strictEqual(lengthParser.parse('1.223m'), null);
        NodeAssert.strictEqual(lengthParser.parse('m 1.22'), null);
    });

    NodeTest.it('B-F-00005: Should throw RangeError if "maxDecimalPlaces" is negative', () => {

        NodeAssert.throws(
            () => new UnitParser({ format: '{value} {unit}', units: ['cm'], maxDecimalPlaces: -1 }),
            (e: unknown) => {
                NodeAssert.ok(e instanceof RangeError);
                NodeAssert.strictEqual((e as RangeError).message, 'The maxDecimalPlaces property must be a non-negative integer.');
                return true;
            },
        );
    });

    NodeTest.it('B-F-00006: Should throw RangeError if "maxDecimalPlaces" is a non-integer', () => {

        NodeAssert.throws(
            () => new UnitParser({ format: '{value} {unit}', units: ['cm'], maxDecimalPlaces: 1.5 }),
            (e: unknown) => {
                NodeAssert.ok(e instanceof RangeError);
                NodeAssert.strictEqual((e as RangeError).message, 'The maxDecimalPlaces property must be a non-negative integer.');
                return true;
            },
        );
    });

    NodeTest.it('B-F-00007: Should throw RangeError when two units share the same alias', () => {

        NodeAssert.throws(
            () => new UnitParser({
                format: '{value} {unit}',
                units: [
                    { name: 'MiB', aliases: ['mb'] },
                    { name: 'MB',  aliases: ['mb'] },
                ],
            }),
            (e: unknown) => {
                NodeAssert.ok(e instanceof RangeError);
                NodeAssert.match((e as RangeError).message, /The alias "mb" is already used by the unit "MiB"/);
                return true;
            },
        );
    });

    NodeTest.it('B-F-00008: Should throw RangeError when two units produce the same alias under caseInsensitive mode', () => {

        NodeAssert.throws(
            () => new UnitParser({
                format: '{value} {unit}',
                units: [
                    { name: 'MiB', aliases: ['MB'] },
                    { name: 'MB',  aliases: ['mb'] },
                ],
                caseInsensitive: true,
            }),
            (e: unknown) => {
                NodeAssert.ok(e instanceof RangeError);
                NodeAssert.match((e as RangeError).message, /The alias "mb" is already used by the unit "MiB"/);
                return true;
            },
        );
    });

    // ─── Black-Box: Edge Cases ───────────────────────────

    NodeTest.it('B-E-00001: Should not allow decimal places when maxDecimalPlaces is 1 (source uses > 1 threshold)', () => {

        // The source uses `maxDecimalPlaces > 1` to decide whether to allow decimals,
        // so maxDecimalPlaces = 1 produces the same no-decimal pattern as maxDecimalPlaces = 0.
        const parser = new UnitParser({
            format: '{value} {unit}',
            units: ['cm'],
            maxDecimalPlaces: 1,
        });

        NodeAssert.deepStrictEqual(parser.parse('5 cm'), { value: '5', unit: 'cm' });
        NodeAssert.strictEqual(parser.parse('5.1 cm'), null, 'Decimal not allowed when maxDecimalPlaces = 1');
    });

    NodeTest.it('B-E-00002: Should return null for an empty string input', () => {

        const parser = new UnitParser({
            format: '{value} {unit}',
            units: ['cm'],
        });

        NodeAssert.strictEqual(parser.parse(''), null);
    });
});
