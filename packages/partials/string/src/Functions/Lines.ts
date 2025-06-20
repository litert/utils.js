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
 * Split a string by EOL (end of line) characters.
 *
 * @param str   The string to split
 * @param eol   The EOL regex to use for splitting the string. Default is `RegExp('\r\n|\r|\n')`
 *
 * @returns  An array of strings, each representing a line in the original string
 */
export function splitIntoLines(str: string, eol: string | RegExp = /\r\n|\r|\n/): string[] {

    return str.split(eol);
}

/**
 * Convert all EOL (end of line) characters in a string to Unix-style line endings (`\n`).
 *
 * @param str   The string to convert
 * @returns     The string with Unix-style line endings
 */
export function toUnixString(str: string): string {

    return str.replace(/\r\n|\r/g, '\n');
}

/**
 * Convert all EOL (end of line) characters in a string to Windows-style line endings (`\r\n`).
 *
 * @param str   The string to convert
 * @returns     The string with Windows-style line endings
 */
export function toWindowsString(str: string): string {

    return str.replace(/\r\n|\r|\n/g, '\r\n');
}

/**
 * Convert all EOL (end of line) characters in a string to Mac-style line endings (`\r`).
 *
 * @param str   The string to convert
 * @returns     The string with Mac-style line endings
 */
export function toMacString(str: string): string {

    return str.replace(/\r\n|\n/g, '\r');
}
