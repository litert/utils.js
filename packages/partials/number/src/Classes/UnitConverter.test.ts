import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { UnitConverter } from './UnitConverter';

NodeTest.describe('Class UnitConverter', () => {

    NodeTest.it('Should throw exception if duplicated unit used', () => {

        try {

            new UnitConverter({
                baseUnit: 'cm',
                units: [
                    { name: 'cm', factor: 1 },
                ],
            });

            NodeAssert.fail('Should throw exception if duplicated unit used');
        }
        catch (e) {

            NodeAssert.ok(e instanceof RangeError);
            NodeAssert.strictEqual(e.message, 'Duplicated unit "cm".');
        }

        try {

            new UnitConverter({
                baseUnit: 'cm',
                units: [
                    { name: 'km', factor: 1 },
                    { name: 'km', factor: 1 },
                ],
            });

            NodeAssert.fail('Should throw exception if duplicated unit used');
        }
        catch (e) {

            NodeAssert.ok(e instanceof RangeError);
            NodeAssert.strictEqual(e.message, 'Duplicated unit "km".');
        }
    });

    NodeTest.it('Should throw exception if factor is invalid', () => {

        try {

            new UnitConverter({
                baseUnit: 'cm',
                units: [
                    { name: '0m', factor: 0 },
                ],
            });
        }
        catch (e) {

            NodeAssert.ok(e instanceof RangeError);
            NodeAssert.strictEqual(e.message, 'The factor of unit "cm" to "0m" must be greater than 0.');
        }

        try {

            new UnitConverter({
                baseUnit: 'cm',
                units: [
                    { name: 'nm', factor: -1 },
                ],
            });
        }
        catch (e) {

            NodeAssert.ok(e instanceof RangeError);
            NodeAssert.strictEqual(e.message, 'The factor of unit "cm" to "nm" must be greater than 0.');
        }
    });

    NodeTest.it('Should convert distances correctly', () => {

        const converter = new UnitConverter({
            baseUnit: 'cm',
            units: [
                { name: 'dm', factor: 10 },
                { name: 'm', factor: 100 },
                { name: 'km', factor: 100000 },
                { name: 'ft', factor: 30.48 },
                { name: 'in', factor: 2.54 },
            ],
        });

        NodeAssert.strictEqual(converter.convert(1, 'cm', 'cm'), 1);
        NodeAssert.strictEqual(converter.convert(1, 'cm', 'dm'), 0.1);
        NodeAssert.strictEqual(converter.convert(1, 'cm', 'm'), 0.01);
        NodeAssert.strictEqual(converter.convert(1, 'cm', 'km'), 0.00001);
        NodeAssert.strictEqual(converter.convert(1, 'dm', 'cm'), 10);
        NodeAssert.strictEqual(converter.convert(1, 'dm', 'dm'), 1);
        NodeAssert.strictEqual(converter.convert(1, 'dm', 'm'), 0.1);
        NodeAssert.strictEqual(converter.convert(1, 'dm', 'km'), 0.0001);
        NodeAssert.strictEqual(converter.convert(1, 'm', 'cm'), 100);
        NodeAssert.strictEqual(converter.convert(1, 'm', 'dm'), 10);
        NodeAssert.strictEqual(converter.convert(1, 'ft', 'cm'), 30.48);
        NodeAssert.strictEqual(converter.convert(1, 'ft', 'dm'), 3.048);
        NodeAssert.strictEqual(converter.convert(1, 'ft', 'm'), 0.3048);
        NodeAssert.strictEqual(converter.convert(1, 'ft', 'in'), 12);
        NodeAssert.strictEqual(converter.convert(1, 'in', 'ft'), 1 / 12);
    });

    NodeTest.it('Should convert data size correctly', () => {

        const converter = new UnitConverter({
            units: UnitConverter.makeUnitsByFactor([
                'KiB',
                'MiB',
                'GiB',
            ], 1024),
            baseUnit: 'Byte',
        });

        NodeAssert.strictEqual(converter.convert(1, 'KiB', 'Byte'), 1024);
        NodeAssert.strictEqual(converter.convert(1, 'MiB', 'Byte'), 1024 ** 2);
        NodeAssert.strictEqual(converter.convert(1, 'GiB', 'Byte'), 1024 ** 3);
        NodeAssert.strictEqual(converter.convert(1, 'GiB', 'KiB'), 1024 ** 2);
        NodeAssert.strictEqual(converter.convert(1, 'GiB', 'MiB'), 1024);
        NodeAssert.strictEqual(converter.convert(1.2, 'GiB', 'MiB'), 1.2 * 1024);
        NodeAssert.strictEqual(converter.convert(1.2, 'GiB', 'KiB'), 1.2 * 1024 ** 2);
        NodeAssert.strictEqual(converter.convert(1.2, 'GiB', 'GiB'), 1.2);
        NodeAssert.strictEqual(converter.convert(1294, 'MiB', 'GiB'), 1294 / 1024);
        NodeAssert.strictEqual(converter.convert(1, 'Byte', 'KiB'), 1 / 1024);
    });

    NodeTest.it('Use simple string array as unit list should be valid', () => {

        const converter = new UnitConverter({
            units: UnitConverter.makeUnitsByFactor([
                'KiB',
                'MiB',
                'GiB',
            ], 1024),
            baseUnit: 'Byte',
        });

        NodeAssert.strictEqual(converter.convert(1, 'KiB', 'Byte'), 1024);
        NodeAssert.strictEqual(converter.convert(1, 'MiB', 'Byte'), 1024 ** 2);
        NodeAssert.strictEqual(converter.convert(1, 'GiB', 'Byte'), 1024 ** 3);
        NodeAssert.strictEqual(converter.convert(1, 'GiB', 'KiB'), 1024 ** 2);
        NodeAssert.strictEqual(converter.convert(1, 'GiB', 'MiB'), 1024);
        NodeAssert.strictEqual(converter.convert(1.2, 'GiB', 'MiB'), 1.2 * 1024);
        NodeAssert.strictEqual(converter.convert(1.2, 'GiB', 'KiB'), 1.2 * 1024 ** 2);
        NodeAssert.strictEqual(converter.convert(1.2, 'GiB', 'GiB'), 1.2);
        NodeAssert.strictEqual(converter.convert(1294, 'MiB', 'GiB'), 1294 / 1024);
        NodeAssert.strictEqual(converter.convert(1, 'Byte', 'KiB'), 1 / 1024);
    });

    NodeTest.it('Using enum as unit name is valid', () => {

        enum EDataSizeUnit { BYTE, KB, MB, GB }

        const converter = new UnitConverter<EDataSizeUnit>({
            units: UnitConverter.makeUnitsByFactor([
                EDataSizeUnit.KB,
                EDataSizeUnit.MB,
                EDataSizeUnit.GB,
            ], 1024),
            baseUnit: EDataSizeUnit.BYTE,
        });

        NodeAssert.strictEqual(converter.convert(1, EDataSizeUnit.KB, EDataSizeUnit.BYTE), 1024);
        NodeAssert.strictEqual(converter.convert(1, EDataSizeUnit.MB, EDataSizeUnit.BYTE), 1024 ** 2);
        NodeAssert.strictEqual(converter.convert(1, EDataSizeUnit.GB, EDataSizeUnit.BYTE), 1024 ** 3);
        NodeAssert.strictEqual(converter.convert(1, EDataSizeUnit.GB, EDataSizeUnit.KB), 1024 ** 2);
        NodeAssert.strictEqual(converter.convert(1, EDataSizeUnit.GB, EDataSizeUnit.MB), 1024);
        NodeAssert.strictEqual(converter.convert(1.2, EDataSizeUnit.GB, EDataSizeUnit.MB), 1.2 * 1024);
        NodeAssert.strictEqual(converter.convert(1.2, EDataSizeUnit.GB, EDataSizeUnit.KB), 1.2 * 1024 ** 2);
        NodeAssert.strictEqual(converter.convert(1.2, EDataSizeUnit.GB, EDataSizeUnit.GB), 1.2);
        NodeAssert.strictEqual(converter.convert(1294, EDataSizeUnit.MB, EDataSizeUnit.GB), 1294 / 1024);
        NodeAssert.strictEqual(converter.convert(1, EDataSizeUnit.BYTE, EDataSizeUnit.KB), 1 / 1024);
    });
});
