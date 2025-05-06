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
 * Check if a string is a valid IPv6 address.
 *
 * > Due to the compatibility of IPv6 notations, an IPv4 address is also a valid IPv6 address.
 *
 * @param ip                The string to be checked.
 * @returns                True if the input is a valid IPv6 address, false otherwise.
 */
export function isValidIPv6Address(ip: string): boolean {

    try {

        quickParseIPv6Address(ip);
    }
    catch {

        return false;
    }

    return true;
}
