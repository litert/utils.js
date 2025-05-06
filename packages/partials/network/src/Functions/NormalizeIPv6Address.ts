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

import { parseIPv6Address } from './ParseIPv6Address';

/**
 * Transform an IPv6 address to a normalized format, with exact 8 segments.
 *
 * @param ip                    The IPv6 address to be normalized.
 * @param padLeadingZeros       Whether to pad leading zeros in each segment, upto 4 digits.
 *
 * @returns                  The normalized IPv6 address.
 *
 * @throws {TypeError} If the input is an invalid IPv6 address.
 *
 * @example `::     -> 0:0:0:0:0:0:0:0`
 * @example `::1    -> 0:0:0:0:0:0:0:1`
 * @example `a::1   -> a:0:0:0:0:0:0:1`
 * @example `a:b::1 -> a:b:0:0:0:0:0:1`
 */
export function normalizeIPv6Address(ip: string, padLeadingZeros: boolean): string {

    return parseIPv6Address(ip, padLeadingZeros).join(':');
}
