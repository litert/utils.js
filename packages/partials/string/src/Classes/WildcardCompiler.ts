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

import { regexpEscape } from '../Functions/RegexpEscape.js';

/**
 * The options for wildcard compiler.
 */
export interface IWildcardCompilerOptions {

    /**
     * Whether to disable the question mark (`?`) as a wildcard character.
     *
     * When set to `true`, the question mark will be treated as a normal
     * character, and only the asterisk (`*`) will be treated as a wildcard
     * character.
     *
     * @default false
     */
    disableQuestionMark?: boolean;
}

const REGEX_ANY = '.*';
const REGEX_ANY_CHAR = '.';

const CHAR_QUESTION_MARK = '?';
const CHAR_ASTERISK = '*';

const REGEX_CHAR_IN_QTY = /^\.\{\d+\}$/;
const INDEX_MISSING = -1;

/**
 * The helper class that create a RegExp object for wildcard matching.
 */
export class WildcardCompiler {

    /**
     * Whether to disable the question mark (`?`) as a wildcard character.
     *
     * When set to `true`, the question mark will be treated as a normal
     * character, and only the asterisk (`*`) will be treated as a wildcard
     * character.
     */
    public readonly disableQuestionMark: boolean;

    public constructor(options?: IWildcardCompilerOptions) {

        this.disableQuestionMark = !!options?.disableQuestionMark;
    }

    /**
     * Compile a RegExp object from a wildcard pattern.
     *
     * @param pattern The wildcard pattern to compile.
     * @returns The RegExp object for the wildcard pattern.
     *
     * @example
     * ```ts
     * const compiler = new WildcardCompiler();
     * const match = compiler.compile('t?st*');
     * console.log(match.test('test')); // true
     * console.log(match.test('tast-111')); // true
     * console.log(match.test('tst')); // false
     * ```
     */
    public compile(pattern: string): RegExp {

        return new RegExp(this.compileToString(pattern));
    }

    /**
     * Compile a RegExp pattern string from a wildcard pattern, the returned
     * string is a valid RegExp pattern string that can be used to create a
     * RegExp object.
     *
     * @param pattern The wildcard pattern to compile.
     * @returns The RegExp pattern string for the wildcard pattern.
     *
     * @example
     * ```ts
     * const compiler = new WildcardCompiler();
     * const pattern = compiler.compileToString('t?st*');
     * console.log(pattern); // ^\x74est.*
     * console.log(new RegExp(pattern).test('test')); // true
     * console.log(new RegExp(pattern).test('tast-111')); // true
     * console.log(new RegExp(pattern).test('tst')); // false
     * ```
     */
    public compileToString(pattern: string): string {

        let chunks: string[] = [];

        for (let offset = 0; offset < pattern.length;) {

            const nextWildcard = this._findNextWildcardIndex(pattern, offset);

            if (nextWildcard === INDEX_MISSING) {
                chunks.push(regexpEscape(pattern.slice(offset)));
                break;
            }

            switch (pattern[nextWildcard]) {

                case CHAR_ASTERISK:

                    chunks.push(regexpEscape(pattern.slice(offset, nextWildcard)));
                    chunks.push(REGEX_ANY);
                    break;

                case CHAR_QUESTION_MARK:

                    chunks.push(regexpEscape(pattern.slice(offset, nextWildcard)));
                    chunks.push(REGEX_ANY_CHAR);
                    break;
            }

            offset = nextWildcard + 1;
        }

        chunks = chunks.filter(i => i.length > 0);

        if (chunks.length === 0) {
            return '^$';
        }

        this._mergeConsecutiveChunks(chunks);

        this._sealPattern(chunks);

        return chunks.join('');
    }

    private _findNextWildcardIndex(pattern: string, offset: number): number {

        const nextAsterisk = pattern.indexOf(CHAR_ASTERISK, offset);
        const nextQuestionMark = this.disableQuestionMark ?
            INDEX_MISSING : pattern.indexOf(CHAR_QUESTION_MARK, offset);

        if (nextAsterisk === INDEX_MISSING) {
            return nextQuestionMark;
        }

        if (nextQuestionMark === INDEX_MISSING) {
            return nextAsterisk;
        }

        return Math.min(nextAsterisk, nextQuestionMark);
    }

    private _sealPattern(chunks: string[]): void {

        if (chunks.length > 0) {

            if (chunks[0] !== REGEX_ANY) {
                chunks[0] = `^${chunks[0]}`;
            }

            if (chunks[chunks.length - 1] !== REGEX_ANY) {
                chunks[chunks.length - 1] = `${chunks[chunks.length - 1]}$`;
            }
        }
    }

    private _mergeConsecutiveChunks(chunks: string[]): void {

        for (let i = 0, qmQty = 1; i < chunks.length - 1; i++) {

            switch (chunks[i + 1]) {

                case REGEX_ANY:

                    if (chunks[i] === REGEX_ANY) {

                        chunks.splice(i + 1, 1);
                        i--;
                    }
                    else {
                        qmQty = 1;
                    }

                    break;

                case REGEX_ANY_CHAR:

                    if (chunks[i] === REGEX_ANY_CHAR || REGEX_CHAR_IN_QTY.test(chunks[i])) {

                        chunks[i] = `${REGEX_ANY_CHAR}{${++qmQty}}`;
                        chunks.splice(i + 1, 1);
                        i--;
                    }

                    // the qmQty should be already reset to 1, so we can just ignore it here

                    break;

                default:

                    qmQty = 1;
            }
        }
    }
}
