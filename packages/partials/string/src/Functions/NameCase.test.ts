import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import * as NameCases from './NameCase';

NodeTest.describe('Function String.isUpperSnakeCase', () => {

    NodeTest.it('Should return true for valid Upper Snake Case strings', () => {
        NodeAssert.strictEqual(NameCases.isUpperSnakeCase('UPPER_SNAKE_CASE'), true);
        NodeAssert.strictEqual(NameCases.isUpperSnakeCase('A1_B2_C3'), true);
    });

    NodeTest.it('Should return false for invalid Upper Snake Case strings', () => {
        NodeAssert.strictEqual(NameCases.isUpperSnakeCase('lower_snake_case'), false);
        NodeAssert.strictEqual(NameCases.isUpperSnakeCase('Upper_Snake_Case'), false);
        NodeAssert.strictEqual(NameCases.isUpperSnakeCase('1A_B2'), false);
        NodeAssert.strictEqual(NameCases.isUpperSnakeCase('IsUpperSnakeCase'), false);
        NodeAssert.strictEqual(NameCases.isUpperSnakeCase('isLowerSnakeCase'), false);
        NodeAssert.strictEqual(NameCases.isUpperSnakeCase(''), false);
    });
});

NodeTest.describe('Function String.isLowerSnakeCase', () => {

    NodeTest.it('Should return true for valid Lower Snake Case strings', () => {
        NodeAssert.strictEqual(NameCases.isLowerSnakeCase('lower_snake_case'), true);
        NodeAssert.strictEqual(NameCases.isLowerSnakeCase('a1_b2_c3'), true);
    });

    NodeTest.it('Should return false for invalid Lower Snake Case strings', () => {
        NodeAssert.strictEqual(NameCases.isLowerSnakeCase('UPPER_SNAKE_CASE'), false);
        NodeAssert.strictEqual(NameCases.isLowerSnakeCase('Upper_Snake_Case'), false);
        NodeAssert.strictEqual(NameCases.isLowerSnakeCase('1a_b2'), false);
        NodeAssert.strictEqual(NameCases.isLowerSnakeCase('IsLowerSnakeCase'), false);
        NodeAssert.strictEqual(NameCases.isLowerSnakeCase('isLowerSnakeCase'), false);
        NodeAssert.strictEqual(NameCases.isLowerSnakeCase(''), false);
    });
});

NodeTest.describe('Function String.isLowerCamelCase', () => {

    NodeTest.it('Should return true for valid Lower Camel Case strings', () => {
        NodeAssert.strictEqual(NameCases.isLowerCamelCase('lowerCamelCase'), true);
        NodeAssert.strictEqual(NameCases.isLowerCamelCase('a1b2c3'), true);
    });

    NodeTest.it('Should return false for invalid Lower Camel Case strings', () => {
        NodeAssert.strictEqual(NameCases.isLowerCamelCase('UpperCamelCase'), false);
        NodeAssert.strictEqual(NameCases.isLowerCamelCase('1aB2'), false);
        NodeAssert.strictEqual(NameCases.isLowerCamelCase('IsLowerCamelCase'), false);
        NodeAssert.strictEqual(NameCases.isLowerCamelCase(''), false);
    });
});

NodeTest.describe('Function String.isUpperCamelCase', () => {

    NodeTest.it('Should return true for valid Upper Camel Case strings', () => {
        NodeAssert.strictEqual(NameCases.isUpperCamelCase('UpperCamelCase'), true);
        NodeAssert.strictEqual(NameCases.isUpperCamelCase('A1B2C3'), true);
    });

    NodeTest.it('Should return false for invalid Upper Camel Case strings', () => {
        NodeAssert.strictEqual(NameCases.isUpperCamelCase('lowerCamelCase'), false);
        NodeAssert.strictEqual(NameCases.isUpperCamelCase('1AB2'), false);
        NodeAssert.strictEqual(NameCases.isUpperCamelCase('isUpperCamelCase'), false);
        NodeAssert.strictEqual(NameCases.isUpperCamelCase(''), false);
    });
});
