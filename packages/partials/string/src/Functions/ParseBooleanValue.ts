/**
 * Copyright 2026 Angus.Fenying <fenying@litert.org>
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

import { IDict } from '@litert/utils-ts-types';

/**
 * The options for parsing a boolean value from a string.
 */
export interface IParseBooleanValueOptions {

    /**
     * A mapping of string values to their corresponding boolean values.
     *
     * @default {
     *  "true": true,
     *  "1": true,
     *  "yes": true,
     *  "on": true,
     *  "y": true,
     *  "enabled": true,
     *  "active": true,
     *  "ok": true,
     *  "false": false,
     *  "0": false,
     *  "no": false,
     *  "off": false,
     *  "n": false,
     *  "disabled": false,
     *  "inactive": false,
     * }
     */
    mappings?: IDict<boolean>;

    /**
     * The default value if none of the key in `mappings` match the input string.
     *
     * @default undefined
     */
    defaultValue?: boolean | undefined;

    /**
     * Whether to perform case-sensitive comparison when parsing the boolean value.
     *
     * If set to `false`, the function will ignore the case of the input string when
     * determining if it matches any of the truly or falsy values.
     * In this case, all keys in `mappings` must be provided in lowercase
     * because the function will convert the input string to lowercase before comparison.
     *
     * @default false
     */
    caseSensitive?: boolean;
}

/**
 * The default mapping of string values for `parseBooleanValue`.
 */
export const DEFAULT_BOOLEAN_VALUE_MAPPINGS: IDict<boolean> = Object.seal({
    'true': true,
    '1': true,
    'yes': true,
    'on': true,
    'y': true,
    'enabled': true,
    'active': true,
    'ok': true,
    'allow': true,
    'allowed': true,
    'false': false,
    '0': false,
    'no': false,
    'off': false,
    'n': false,
    'disabled': false,
    'inactive': false,
    'deny': false,
    'denied': false
});

/**
 * Parse a string value into a boolean. The function will return `true` if the input string matches any of the
 * `trulyValues`, `false` if it matches any of the `falsyValues`, and `undefined` if it doesn't match any of them.
 *
 * @param value The string value to be parsed.
 * @param options The options for parsing the boolean value.
 * @returns The parsed boolean value, or `undefined` if the input string doesn't match any of the `trulyValues` or `falsyValues`.
 *
 * @example
 * ```ts
 * String.parseBooleanValue('true'); // returns true
 * String.parseBooleanValue('false'); // returns false
 * String.parseBooleanValue('yes'); // returns true
 * String.parseBooleanValue('no'); // returns false
 * String.parseBooleanValue('NO', { caseSensitive: true }); // returns undefined
 * String.parseBooleanValue('NO', { caseSensitive: false }); // returns false
 * ```
 */
export function parseBooleanValue(value: string, options: IParseBooleanValueOptions = {}): boolean | undefined {

    const v = options.caseSensitive ? value : value.toLowerCase();

    switch ((options.mappings ?? DEFAULT_BOOLEAN_VALUE_MAPPINGS)[v]) {
        case true:
            return true;
        case false:
            return false;
        case undefined:
        default:
            return options.defaultValue;
    }
}
