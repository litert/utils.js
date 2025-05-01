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
 * The general charset for generating random strings.
 */
export enum ERandomStringCharset {
    UPPER_ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    LOWER_ALPHA = 'abcdefghijklmnopqrstuvwxyz',
    DEC_DIGIT = '0123456789',
    UPPER_HEX_DIGIT = '0123456789ABCDEF',
    LOWER_HEX_DIGIT = '0123456789abcdef',
}

/**
 * The default charset for generating random strings.
 */
export const DEFAULT_RANDOM_CHARSET = [
    ERandomStringCharset.UPPER_ALPHA,
    ERandomStringCharset.LOWER_ALPHA,
    ERandomStringCharset.DEC_DIGIT,
].join('');

/**
 * Generate a random string with the specified length and charset.
 *
 * @param length    Expected length of the random string
 * @param charset   The characters set to use for generating the random string (all characters must be unique)
 *
 * @see {@link ERandomStringCharset}
 * @see {@link DEFAULT_RANDOM_CHARSET}
 *
 * @returns The generated random string
 */
export function random(length: number, charset: string = DEFAULT_RANDOM_CHARSET): string {

    const l: number = charset.length;
    let result: string = '';

    if (length <= 0) {

        return result;
    }

    while (length-- > 0) {

        result += charset[Math.floor(Math.random() * l)];
    }

    return result;
}
