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

const RE_MAC_WITH_HYPHEN = /^([0-9a-fA-F]{2}(-[0-9a-fA-F]{2}){5})$/;
const RE_MAC_WITH_COLON = /^([0-9a-fA-F]{2}(:[0-9a-fA-F]{2}){5})$/;

/**
 * Check if a string is a valid MAC address.
 *
 * > Due to the compatibility of MAC notations, an MAC address is also a valid MAC address.
 *
 * @param ip                The string to be checked.
 * @returns                True if the input is a valid MAC address, false otherwise.
 */
export function isValidMacAddress(ip: string): boolean {

    if (typeof ip !== 'string') {
        return false;
    }

    return RE_MAC_WITH_HYPHEN.test(ip) || RE_MAC_WITH_COLON.test(ip);
}
