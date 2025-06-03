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
 * Try if the `value` could make `check` return `true`, if not, return the `elseValue`.
 *
 * @param value         The value to check, if checked successfully, it will be returned.
 * @param check         The check function.
 * @param elseValue     The value to return if the check fails.
 */
export function useValueOr<T>(value: T, check: (v: T) => boolean, elseValue: T): T {

    return check(value) ? value : elseValue;
}
