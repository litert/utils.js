/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { UnitConverter } from './UnitConverter.js';

NodeTest.describe('Module Number - Class UnitConverter', () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    NodeTest.it('B-M-00001: Should convert distances correctly', () => {

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

    NodeTest.it('B-M-00002: Should convert data sizes correctly using makeUnitsByFactor', () => {

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

    NodeTest.it('B-M-00003: Should return a single unit with factor equal to the given factor', () => {

        NodeAssert.deepStrictEqual(
            UnitConverter.makeUnitsByFactor(['KiB'], 1024),
            [{ name: 'KiB', factor: 1024 }],
        );
    });

    NodeTest.it('B-M-00004: Should produce cumulative factors for multiple units', () => {

        NodeAssert.deepStrictEqual(
            UnitConverter.makeUnitsByFactor(['KiB', 'MiB', 'GiB'], 1024),
            [
                { name: 'KiB', factor: 1024 },
                { name: 'MiB', factor: 1024 ** 2 },
                { name: 'GiB', factor: 1024 ** 3 },
            ],
        );
    });

    NodeTest.it('B-M-00005: Using enum as unit name is valid', () => {

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

    // ─── Black-Box: Failure Flow ─────────────────────────

    NodeTest.it('B-F-00001: Should throw RangeError if the base unit is duplicated in units list', () => {

        NodeAssert.throws(
            () => new UnitConverter({
                baseUnit: 'cm',
                units: [
                    { name: 'cm', factor: 1 },
                ],
            }),
            { name: 'RangeError', message: 'Duplicated unit "cm".' },
        );
    });

    NodeTest.it('B-F-00002: Should throw RangeError if a non-base unit is duplicated in units list', () => {

        NodeAssert.throws(
            () => new UnitConverter({
                baseUnit: 'cm',
                units: [
                    { name: 'km', factor: 1 },
                    { name: 'km', factor: 1 },
                ],
            }),
            { name: 'RangeError', message: 'Duplicated unit "km".' },
        );
    });

    NodeTest.it('B-F-00003: Should throw RangeError if a unit has a factor of zero', () => {

        NodeAssert.throws(
            () => new UnitConverter({
                baseUnit: 'cm',
                units: [
                    { name: '0m', factor: 0 },
                ],
            }),
            { name: 'RangeError', message: 'The factor of unit "cm" to "0m" must be greater than 0.' },
        );
    });

    NodeTest.it('B-F-00004: Should throw RangeError if a unit has a negative factor', () => {

        NodeAssert.throws(
            () => new UnitConverter({
                baseUnit: 'cm',
                units: [
                    { name: 'nm', factor: -1 },
                ],
            }),
            { name: 'RangeError', message: 'The factor of unit "cm" to "nm" must be greater than 0.' },
        );
    });

    // ─── Black-Box: Edge Cases ───────────────────────────

    NodeTest.it('B-E-00001: Should return an empty array for an empty unit list', () => {

        NodeAssert.deepStrictEqual(UnitConverter.makeUnitsByFactor([], 1024), []);
    });

    NodeTest.it('B-E-00002: Should convert zero to zero for any unit pair', () => {

        const converter = new UnitConverter({
            units: UnitConverter.makeUnitsByFactor(['KiB', 'MiB', 'GiB'], 1024),
            baseUnit: 'Byte',
        });

        NodeAssert.strictEqual(converter.convert(0, 'KiB', 'Byte'), 0);
        NodeAssert.strictEqual(converter.convert(0, 'GiB', 'KiB'), 0);
        NodeAssert.strictEqual(converter.convert(0, 'Byte', 'GiB'), 0);
    });

    NodeTest.it('B-E-00003: Should convert negative values correctly', () => {

        const converter = new UnitConverter({
            units: UnitConverter.makeUnitsByFactor(['KiB', 'MiB', 'GiB'], 1024),
            baseUnit: 'Byte',
        });

        NodeAssert.strictEqual(converter.convert(-1, 'KiB', 'Byte'), -1024);
        NodeAssert.strictEqual(converter.convert(-1, 'MiB', 'KiB'), -1024);
        NodeAssert.strictEqual(converter.convert(-1, 'GiB', 'MiB'), -1024);
    });
});
