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

const DEFAULT_OPTS: Required<IParseKeyValueOptions> = {

    assignSign: '=',
    trimKey: true,
    trimValue: true,
};

/**
 * The custom options for the `parseKeyValue` function.
 */
export interface IParseKeyValueOptions {

    /**
     * The string used to separate the key and value in the expression.
     *
     * Change this if your expression uses a different format, such as `key:value` or `key=>value`.
     *
     * @default '='
     */
    assignSign?: string;

    /**
     * Whether to trim the key before returning it.
     *
     * @default true
     */
    trimKey?: boolean;

    /**
     * Whether to trim the value before returning it.
     *
     * @default true
     */
    trimValue?: boolean;
}

/**
 * Parse an expression of key-value pair like `key=value` into a tuple of [key, value].
 *
 * This method is useful for parsing simple configuration strings.
 * Especially if you need to process the case like `a=b=c` to `['a', 'b=c']`.
 *
 * @param expr  The expression string to be parsed.
 * @param opts   Optional settings for parsing the expression.
 * @returns A tuple of [key, value] if the expression is valid, or null if it is not.
 *
 * @example
 * ```ts
 * parseKeyValue('a=b'); // returns ['a', 'b']
 * parseKeyValue('a=b=c'); // returns ['a', 'b=c']
 * parseKeyValue('a = b', { trimKey: true, trimValue: true }); // returns ['a', 'b']
 * parseKeyValue('a = b', { trimKey: false, trimValue: false }); // returns ['a ', ' b']
 * parseKeyValue('a:b', { assignSign: ':' }); // returns ['a', 'b']
 * parseKeyValue('a=>b', { assignSign: '=>' }); // returns ['a', 'b']
 * parseKeyValue('abc'); // returns null
 * ```
 */
export function parseKeyValue(
    expr: string,
    opts?: IParseKeyValueOptions,
): [key: string, value: string] | null {

    const o: Required<IParseKeyValueOptions> = {
        assignSign: opts?.assignSign ?? DEFAULT_OPTS.assignSign,
        trimKey: opts?.trimKey ?? DEFAULT_OPTS.trimKey,
        trimValue: opts?.trimValue ?? DEFAULT_OPTS.trimValue,
    };

    const idx = expr.indexOf(o.assignSign);

    if (idx < 0) {
        return null;
    }

    const key = expr.slice(0, idx);
    const value = expr.slice(idx + o.assignSign.length);

    return [
        o.trimKey ? key.trim() : key,
        o.trimValue ? value.trim() : value,
    ];
}
