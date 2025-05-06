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

import { quickParseIPv6Address } from './_internal/IPv6';

/**
 * Parse an IPv6 address to an array of segments, in hexadecimal format.
 *
 * @param ip                    The IPv6 address to be normalized.
 * @param padLeadingZeros       Whether to pad leading zeros in each segment, upto 4 digits.
 *
 * @returns                     An array of hexadecimal integers, with exact 8 elements.
 *
 * @throws {TypeError} If the input is an invalid IPv6 address.
 *
 * @example `::     -> 0:0:0:0:0:0:0:0`
 * @example `::1    -> 0:0:0:0:0:0:0:1`
 * @example `a::1   -> a:0:0:0:0:0:0:1`
 * @example `a:b::1 -> a:b:0:0:0:0:0:1`
 */
export function parseIPv6Address(ip: string, padLeadingZeros: boolean): string[] {

    const ret = quickParseIPv6Address(ip);

    if (padLeadingZeros) {

        for (let i = 0; i < ret.length; i++) {

            ret[i] = ret[i].padStart(4, '0');
        }
    }
    else {

        for (let i = 0; i < ret.length; i++) {

            ret[i] = ret[i].replace(/^0+/, '') || '0';
        }
    }

    return ret;
}

/**
 * Parse an IPv6 address to an array of unsigned 16-bit integers.
 *
 * @throws {TypeError} If the input is an invalid IPv6 address.
 *
 * @param ip                    The IPv6 address to be parsed.
 * @returns                     An array of unsigned 16-bit integers, with exact 8 elements.
 */
export function parseIPv6AddressToUInt16Array(ip: string): number[] {

    return quickParseIPv6Address(ip).map((v) => parseInt(v, 16));
}
