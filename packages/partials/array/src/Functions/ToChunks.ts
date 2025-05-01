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
 * Split an array into chunks, each chunk containing no more than a specified number of elements, in order.
 *
 * @param arr           The array to be split
 * @param chunkSize     The maximum number of elements in each chunk
 *
 * @returns     The array of chunks, where the last chunk may contain fewer elements if the input array length is insufficient.
 */
export function toChunks<T>(arr: readonly T[], chunkSize: number): T[][] {

    if (!Number.isSafeInteger(chunkSize) || chunkSize < 1) {

        throw new RangeError('The chunk size must be a positive integer.');
    }

    const ret: T[][] = new Array(Math.ceil(arr.length / chunkSize));

    for (let i = 0; i < ret.length; i++) {

        ret[i] = arr.slice(i * chunkSize, (i + 1) * chunkSize);
    }

    return ret;
}
