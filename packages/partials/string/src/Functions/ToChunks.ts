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
 * This function splits a string into chunks of specified size.
 * If the string length is not a multiple of the chunk size,
 * the last chunk will contain the remaining characters.
 *
 * @param text      The string to be split into chunks.
 * @param chunkSize The size of each chunk. Must be a positive integer.
 *
 * @returns An array of strings, each representing a chunk of the original string.
 * @throws RangeError if the chunk size is not a positive integer.
 * @example `toChunks('abcdefghij', 3)` returns `['abc', 'def', 'ghi', 'j']`
 */
export function toChunks(text: string, chunkSize: number): string[] {

    if (chunkSize <= 0 || !Number.isSafeInteger(chunkSize)) {

        throw new RangeError('Chunk size must be a positive integer.');
    }

    const chunks: string[] = new Array<string>(Math.ceil(text.length / chunkSize));
    const length = text.length;

    for (let i = 0, o = 0; i < length; i += chunkSize) {
        chunks[o++] = text.slice(i, i + chunkSize);
    }

    return chunks;
}
