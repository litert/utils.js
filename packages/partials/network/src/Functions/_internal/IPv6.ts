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
 * Parse an IPv6 address to an array of segments, in hexadecimal format.
 *
 * All segments (except the IPv4 part) are kept as it is, without any changes.
 */
export function quickParseIPv6Address(ip: string): string[] {

    if (!/^[a-f0-9:.]{2,45}$/i.test(ip)) {

        throw new TypeError(`Invalid IPv6 address: ${ip}`);
    }

    if (ip === '::') {

        return ['0', '0', '0', '0', '0', '0', '0', '0'];
    }

    const parts = ip.split('::');

    if (parts.length > 2) {

        throw new TypeError(`Invalid IPv6 address: ${ip}`);
    }

    const left = (parts[0] || '0').split(':');
    const right = parts[1] !== undefined ? (parts[1] || '0').split(':') : [];
    const maybeIPv4 = right[right.length - 1] ? right.pop()! :
        left[left.length - 1] ? left.pop()! : undefined;

    for (const i of left) {

        if (i.length > 4 || i.length === 0 || i.includes('.')) {

            throw new TypeError(`Invalid IPv6 address: ${ip}`);
        }
    }

    for (const i of right) {

        if (i.length > 4 || i.length === 0 || i.includes('.')) {

            throw new TypeError(`Invalid IPv6 address: ${ip}`);
        }
    }

    if (maybeIPv4) {

        if (maybeIPv4.includes('.')) {

            if (!/^\d{1,3}([.]\d{1,3}){3}$/.test(maybeIPv4)) {
                throw new TypeError(`Invalid IPv6 address: ${ip}`);
            }

            const ipv4Parts = maybeIPv4.split('.').map(i => parseInt(i, 10));

            for (const i of ipv4Parts) {

                if (i < 0 || i > 255) {

                    throw new TypeError(`Invalid IPv6 address: ${ip}`);
                }
            }

            right.push((ipv4Parts[0] * 0x100 + ipv4Parts[1]).toString(16));
            right.push((ipv4Parts[2] * 0x100 + ipv4Parts[3]).toString(16));
        }
        else {

            right.push(maybeIPv4);
        }
    }

    if (left.length + right.length > 8) { // ::1:2:3:4:5:6:7

        throw new TypeError(`Invalid IPv6 address: ${ip}`);
    }

    const missingCount = 8 - (left.length + right.length);

    if (missingCount < 0) { // ::1:2:3:4:5:6:7:8

        throw new TypeError(`Invalid IPv6 address: ${ip}`);
    }

    for (let i = 0; i < left.length; i++) {
        left[i] ||= '0';
    }

    for (let i = 0; i < right.length; i++) {
        right[i] ||= '0';
    }

    for (let i = 0; i < missingCount; i++) {
        left.push('0');
    }

    return left.concat(right);
}
