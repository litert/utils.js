/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import * as NameCases from './NameCase.js';

NodeTest.describe('Module String - Function NameCase', () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    NodeTest.it('B-M-00001: Should return true for valid Upper Snake Case strings', () => {
        NodeAssert.strictEqual(NameCases.isUpperSnakeCase('UPPER_SNAKE_CASE'), true);
        NodeAssert.strictEqual(NameCases.isUpperSnakeCase('A1_B2_C3'), true);
        NodeAssert.strictEqual(NameCases.isUpperSnakeCase('A'), true);
    });

    NodeTest.it('B-M-00002: Should return true for valid Lower Snake Case strings', () => {
        NodeAssert.strictEqual(NameCases.isLowerSnakeCase('lower_snake_case'), true);
        NodeAssert.strictEqual(NameCases.isLowerSnakeCase('a1_b2_c3'), true);
        NodeAssert.strictEqual(NameCases.isLowerSnakeCase('a'), true);
    });

    NodeTest.it('B-M-00003: Should return true for valid Lower Camel Case strings', () => {
        NodeAssert.strictEqual(NameCases.isLowerCamelCase('lowerCamelCase'), true);
        NodeAssert.strictEqual(NameCases.isLowerCamelCase('a1b2c3'), true);
        NodeAssert.strictEqual(NameCases.isLowerCamelCase('a'), true);
    });

    NodeTest.it('B-M-00004: Should return true for valid Upper Camel Case strings', () => {
        NodeAssert.strictEqual(NameCases.isUpperCamelCase('UpperCamelCase'), true);
        NodeAssert.strictEqual(NameCases.isUpperCamelCase('A1B2C3'), true);
        NodeAssert.strictEqual(NameCases.isUpperCamelCase('A'), true);
    });

    NodeTest.it('B-M-00005: Should be the same function reference as isUpperCamelCase', () => {

        NodeAssert.strictEqual(NameCases.isPascalCase, NameCases.isUpperCamelCase);
    });

    NodeTest.it('B-M-00006: Should return true for valid Pascal Case strings', () => {

        NodeAssert.strictEqual(NameCases.isPascalCase('PascalCase'), true);
        NodeAssert.strictEqual(NameCases.isPascalCase('A'), true);
        NodeAssert.strictEqual(NameCases.isPascalCase('A1B2C3'), true);
    });

    // ─── Black-Box: Failure Flow ─────────────────────────

    NodeTest.it('B-F-00001: Should return false for invalid Upper Snake Case strings', () => {
        NodeAssert.strictEqual(NameCases.isUpperSnakeCase('lower_snake_case'), false);
        NodeAssert.strictEqual(NameCases.isUpperSnakeCase('Upper_Snake_Case'), false);
        NodeAssert.strictEqual(NameCases.isUpperSnakeCase('1A_B2'), false);
        NodeAssert.strictEqual(NameCases.isUpperSnakeCase('IsUpperSnakeCase'), false);
        NodeAssert.strictEqual(NameCases.isUpperSnakeCase('isLowerSnakeCase'), false);
        NodeAssert.strictEqual(NameCases.isUpperSnakeCase(''), false);
        NodeAssert.strictEqual(NameCases.isUpperSnakeCase('_A'), false);
    });

    NodeTest.it('B-F-00002: Should return false for invalid Lower Snake Case strings', () => {
        NodeAssert.strictEqual(NameCases.isLowerSnakeCase('UPPER_SNAKE_CASE'), false);
        NodeAssert.strictEqual(NameCases.isLowerSnakeCase('Upper_Snake_Case'), false);
        NodeAssert.strictEqual(NameCases.isLowerSnakeCase('1a_b2'), false);
        NodeAssert.strictEqual(NameCases.isLowerSnakeCase('IsLowerSnakeCase'), false);
        NodeAssert.strictEqual(NameCases.isLowerSnakeCase('isLowerSnakeCase'), false);
        NodeAssert.strictEqual(NameCases.isLowerSnakeCase(''), false);
        NodeAssert.strictEqual(NameCases.isLowerSnakeCase('_a'), false);
    });

    NodeTest.it('B-F-00003: Should return false for invalid Lower Camel Case strings', () => {
        NodeAssert.strictEqual(NameCases.isLowerCamelCase('UpperCamelCase'), false);
        NodeAssert.strictEqual(NameCases.isLowerCamelCase('1aB2'), false);
        NodeAssert.strictEqual(NameCases.isLowerCamelCase('IsLowerCamelCase'), false);
        NodeAssert.strictEqual(NameCases.isLowerCamelCase(''), false);
        NodeAssert.strictEqual(NameCases.isLowerCamelCase('lower_camel'), false);
    });

    NodeTest.it('B-F-00004: Should return false for invalid Upper Camel Case strings', () => {
        NodeAssert.strictEqual(NameCases.isUpperCamelCase('lowerCamelCase'), false);
        NodeAssert.strictEqual(NameCases.isUpperCamelCase('1AB2'), false);
        NodeAssert.strictEqual(NameCases.isUpperCamelCase('isUpperCamelCase'), false);
        NodeAssert.strictEqual(NameCases.isUpperCamelCase(''), false);
        NodeAssert.strictEqual(NameCases.isUpperCamelCase('Upper_Camel'), false);
    });

    NodeTest.it('B-F-00005: Should return false for invalid Pascal Case strings', () => {

        NodeAssert.strictEqual(NameCases.isPascalCase('pascalCase'), false);
        NodeAssert.strictEqual(NameCases.isPascalCase('Pascal_Case'), false);
        NodeAssert.strictEqual(NameCases.isPascalCase('1PascalCase'), false);
        NodeAssert.strictEqual(NameCases.isPascalCase(''), false);
    });
});
