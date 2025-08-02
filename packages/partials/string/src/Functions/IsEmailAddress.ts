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

// eslint-disable-next-line max-len
const EMAIL_REGEXP = /^[-a-z0-9_+][-a-z0-9+_.]{0,62}@[a-z0-9][-a-z0-9]{0,62}(\.[a-z0-9][-a-z0-9]{0,62})*\.[a-z]{2,26}$/i;

const MAX_EMAIL_LENGTH = 255;
const MIN_EMAIL_LENGTH = 6; // 1 char before '@' + 1 char after '@' + 4 chars for domain

/**
 * The extra options for email validation.
 */
export interface IEmailValidationOptions {

    /**
     * The expected maximum length of the email address.
     *
     * Useful when some systems have a hard limit on the length of email
     * addresses.
     *
     * If this value is larger than `MAX_EMAIL_LENGTH`, it will be ignored and
     * `MAX_EMAIL_LENGTH` will be used instead.
     *
     * @default MAX_EMAIL_LENGTH
     */
    maxLength?: number;

    /**
     * The allowed list of domains.
     *
     * If omitted or an empty array is provided, all domains are allowed.
     *
     * > NOTICE: The email address are compared in lower-case, but only
     * > lower-case domains are supported. The domains containing upper-case
     * > characters will not match.
     *
     * @default []
     */
    domains?: string[];
}

/**
 * Test if a string is a valid email address.
 *
 * @param email  The string to test.
 * @param opts   The extra options for email validation.
 *
 * @returns `true` if the string is a valid email address, `false` otherwise.
 */
export function isEmailAddress(email: string, opts?: IEmailValidationOptions): boolean {

    const formatOk = email.length >= MIN_EMAIL_LENGTH &&
        email.length <= Math.min(opts?.maxLength ?? MAX_EMAIL_LENGTH, MAX_EMAIL_LENGTH) &&
        !email.includes('..') &&
        !email.includes('.@') &&
        EMAIL_REGEXP.test(email);

    if (!formatOk) {

        return false;
    }

    if (opts?.domains?.length) {

        return opts.domains.includes(email.split('@')[1].toLowerCase());
    }

    return true;
}
