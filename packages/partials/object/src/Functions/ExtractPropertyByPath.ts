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

import type { IDict, IObject } from '@litert/utils-ts-types';
import { PropertyPathParser } from '../Classes/PropertyPathParser.js';

let parser: PropertyPathParser | null = null;

export interface IExtractPropertyByPathOptions {

    /**
     * @default `undefined`
     */
    defaultValue?: unknown;
}

/**
 * Extract a property from an object by a property path.
 *
 * > This function work with `PropertyPathParser` to parse the property path
 * > and extract the property value from the object.
 * > When an array is provided as the `path` parameter, it is assumed to be
 * > the result  of `PropertyPathParser.parse()`, and will be used directly
 * > without parsing.
 * >
 * > NOTE: **This function does not do cloning of the extracted value, and
 * > return the reference of the (object) value in the original object.
 *
 * @param obj           The object to extract the property from.
 * @param path          The property path, e.g. `"$.a.b.c"` or `"$.a[0].b"` or
 *                      an array created by `PropertyPathParser.parse()`
 * @param options       The options for extracting the property.
 *
 * @returns The value of the property at the specified path
 * @throws {Error} When try to extract a non-object property and there are still
 *         segments left in the path
 *
 * @example
 * ```ts
 * const obj = {
 *     a: {
 *         b: [
 *             { c: 42 }
 *         ]
 *     }
 * };
 *
 * console.log(extractPropertyByPath(obj, '$')); // Output: the `obj` itself
 * console.log(extractPropertyByPath(obj, '$.a.b[0].c')); // Output: 42
 * console.log(extractPropertyByPath(obj, '$.a.b[1].c')); // Output: undefined
 * console.log(extractPropertyByPath(obj, '$.a.b[1].c', { defaultValue: 'hello' })); // Output: 'hello'
 * console.log(extractPropertyByPath(obj, '$.a.b[0].d', { defaultValue: 'hello' })); // Output: 'hello'
 * console.log(extractPropertyByPath(obj, '$.a.b[0].c.d', { defaultValue: 'default' })); // Throws an error
 * ```
 */
export function extractPropertyByPath<T extends IObject>(
    obj: T,
    path: string | Array<string | number>,
    options: IExtractPropertyByPathOptions = {},
): unknown {

    parser ??= new PropertyPathParser();

    const pathSegment = Array.isArray(path) ? path : parser.parse(path);

    let ret = obj as IDict;

    for (let i = 0; i < pathSegment.length; ++i) {

        const seg = pathSegment[i];

        if (ret === undefined) {

            return options.defaultValue;
        }

        if (typeof ret !== 'object' || ret === null) {

            throw new Error(`Can not extract property "${seg}" of non-object value at path ${
                pathSegment.slice(0, i).map(s => `["${s}"]`).join('')
            }`);
        }

        ret = ret[seg];
    }

    if (ret === undefined) {

        return options.defaultValue;
    }

    return ret;
}
