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

/**
 * Escape a string for use in a regular expression, all below characters will be
 * escaped.
 *
 * > `[.*+?^${}()|[\]/\\]`
 *
 * > Note: the `RegExp.escape` is already supported widely in modern JavaScript
 * > engines, but this method still provides a polyfill for older environments,
 * > so you can use it without concern about compatibility.
 *
 * @param text The string to escape.
 * @returns The escaped string.
 */
export const regexpEscape: (text: string) => string = 'escape' in RegExp ?
    RegExp.escape as (text: string) => string :
    regexpEscapePolyfill;

function regexpEscapePolyfill(text: string): string {

    return text.replace(/[-.*+?^${}()|[\]/\\]/g, '\\$&');
}
