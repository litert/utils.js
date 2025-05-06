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
 * The built-in table of HTML escaping characters.
 */
const builtInEscapingChars: ReadonlyArray<readonly [string, string]> = [
    ['&', '&amp;'],
    ['<', '&lt;'],
    ['>', '&gt;'],
    ['"', '&quot;'],
    ["'", '&#39;'],
];

/**
 * Escape HTML special characters in a string.
 *
 * @param text                The string to be escaped.
 * @param extraReplacement    Extra replacement pairs for custom characters.
 */
export function htmlEscape(text: string, extraReplacement?: ReadonlyArray<readonly [string, string]>): string {

    for (const [src, dst] of builtInEscapingChars) {

        text = text.replaceAll(src, dst);
    }

    if (extraReplacement?.length) {

        for (const [src, dst] of extraReplacement) {

            text = text.replaceAll(src, dst);
        }
    }

    return text;
}
