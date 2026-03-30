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

import { UtilityError, type IDict } from '@litert/utils-ts-types';

/**
 * The default error thrown when the rate limit is exceeded.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export class E_RATE_LIMITED extends UtilityError {

    public constructor(ctx: IDict = {}, origin: unknown = null) {
        super('rate_limited', 'The rate limit has been exceeded.', ctx, origin);
    }
}

/**
 * The error thrown when a breaker is open.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export class E_BREAKER_OPENED extends UtilityError {

    public constructor(ctx: IDict = {}, origin: unknown = null) {
        super('breaker_opened', 'The breaker is open.', ctx, origin);
    }
}
