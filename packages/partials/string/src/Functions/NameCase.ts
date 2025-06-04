/**
 * Copyright 2025 Angus.Fenying <fenying@litert.org>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const REGEX_LOWER_SNAKE_CASE = /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/;
const REGEX_UPPER_SNAKE_CASE = /^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$/;

/**
 * Check if a string is in Upper Snake Case format (e.g. `UPPER_SNAKE_CASE`, `A1_B2_C3`).
 *
 * @param text  The string to check.
 *
 * @returns `true` if the string is in Upper Snake Case format, otherwise `false`.
 *
 * @example `isUpperSnakeCase('UPPER_SNAKE_CASE') -> true`
 * @example `isUpperSnakeCase('lower_snake_case') -> false`
 * @example `isUpperSnakeCase('A1_B2_C3') -> true`
 * @example `isUpperSnakeCase('1A_B2') -> false`
 * @example `isUpperSnakeCase('') -> false`
 */
export function isUpperSnakeCase(text: string): boolean {

    return REGEX_UPPER_SNAKE_CASE.test(text);
}

/**
 * Check if a string is in Lower Snake Case format (e.g. `lower_snake_case`, `a1_b2_c3`).
 *
 * @param text The string to check.
 *
 * @returns `true` if the string is in Lower Snake Case format, otherwise `false`.
 *
 * @example `isLowerSnakeCase('lower_snake_case') -> true`
 * @example `isLowerSnakeCase('UPPER_SNAKE_CASE') -> false`
 * @example `isLowerSnakeCase('a1_b2_c3') -> true`
 * @example `isLowerSnakeCase('1a_b2') -> false`
 * @example `isLowerSnakeCase('') -> false`
 */
export function isLowerSnakeCase(text: string): boolean {

    return REGEX_LOWER_SNAKE_CASE.test(text);
}

const REGEX_LOWER_CAMEL_CASE = /^[a-z][a-zA-Z0-9]*$/;
const REGEX_UPPER_CAMEL_CASE = /^[A-Z][a-zA-Z0-9]*$/;

/**
 * Check if a string is in Lower Camel Case format (e.g. `lowerCamelCase`, `a1b2c3`).
 *
 * @param text The string to check.
 *
 * @returns `true` if the string is in Lower Camel Case format, otherwise `false`.
 *
 * @example `isLowerCamelCase('lowerCamelCase') -> true`
 * @example `isLowerCamelCase('UpperCamelCase') -> false`
 * @example `isLowerCamelCase('a1b2c3') -> true`
 * @example `isLowerCamelCase('1aB2') -> false`
 * @example `isLowerCamelCase('') -> false`
 */
export function isLowerCamelCase(text: string): boolean {

    return REGEX_LOWER_CAMEL_CASE.test(text);
}

/**
 * Check if a string is in Upper Camel Case format (e.g. `UpperCamelCase`, `A1B2C3`).
 *
 * @param text The string to check.
 *
 * @returns `true` if the string is in Upper Camel Case format, otherwise `false`.
 *
 * @example `isUpperCamelCase('UpperCamelCase') -> true`
 * @example `isUpperCamelCase('lowerCamelCase') -> false`
 * @example `isUpperCamelCase('A1B2C3') -> true`
 * @example `isUpperCamelCase('1A2B') -> false`
 * @example `isUpperCamelCase('') -> false`
 *
 * @alias isPascalCase
 * @see {@link isPascalCase}
 */
export function isUpperCamelCase(text: string): boolean {

    return REGEX_UPPER_CAMEL_CASE.test(text);
}

/**
 * Check if a string is in Pascal Case format (same as Upper Camel Case).
 *
 * @param text The string to check.
 *
 * @returns `true` if the string is in Pascal Case format, otherwise `false`.
 *
 * @example `isPascalCase('PascalCase') -> true`
 * @example `isPascalCase('pascalCase') -> false`
 * @example `isPascalCase('Pascal_Case') -> false`
 * @example `isPascalCase('') -> false`
 *
 * @alias isUpperCamelCase
 * @see {@link isUpperCamelCase}
 */
export const isPascalCase = isUpperCamelCase;
