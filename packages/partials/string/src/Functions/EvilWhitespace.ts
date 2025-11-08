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

/**
 * The regular expression to match evil whitespace characters.
 */
const EVIL_WHITESPACE_REGEXP = new RegExp(`[${[
    '\\u0000-\\u0008',
    '\\u000B-\\u000C',
    '\\u000E-\\u001F',
    '\\u0080-\\u00A0',
    '\\u2000-\\u200F',
].join('')}]`, 'g');

/**
 * Check if a string contains evil whitespace characters.
 *
 * > These characters are not visible in the string, but they are present in the string.
 * > In many cases, these characters are pretending to be whitespace characters or even hidden themselves,
 * > which make program malfunction.
 *
 * @param str   The string to check
 * @returns     True if evil whitespace characters are found, otherwise false
 */
export function includeEvilWhitespaceChars(str: string): boolean {

    return EVIL_WHITESPACE_REGEXP.test(str);
}

/**
 * @deprecated Use `includeEvilWhitespaceChars` instead.
 */
export const includeEvilSpaceChars = includeEvilWhitespaceChars;

/**
 * Replace all evil whitespace characters in a string with a specified character.
 *
 * > These characters are not visible in the string, but they are present in the string.
 * > In many cases, these characters are pretending to be whitespace characters or even hidden themselves,
 * > which make program malfunction.
 *
 * @param str   The string to process
 * @param to    The character to replace evil whitespace characters with (default is an empty string)
 *
 * @returns     The processed string with evil whitespace characters replaced
 */
export function replaceEvilWhitespaceChars(str: string, to: string = ''): string {

    return str.replace(EVIL_WHITESPACE_REGEXP, to);
}

/**
 * @deprecated Use `replaceEvilWhitespaceChars` instead.
 */
export const replaceEvilSpaceChars = replaceEvilWhitespaceChars;
