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

/* eslint-disable @typescript-eslint/no-explicit-any */

import type { IDict, IObject, IDeepReadonly } from '@litert/utils-ts-types';

/**
 * This function applies `Object.freeze()` recursively to an object and all of its
 * nested (object or array) properties, making the entire object structure
 * immutable.
 *
 * > WARNING: This function does not clone the object, it directly freezes the
 * > original object and its nested properties.
 *
 * @param obj  The object to be deeply frozen. This object will be modified in-place.
 * @returns The object itself, but completely immutable.
 *
 * @example
 * ```ts
 * const obj = deepFreeze({ a: 1, b: [{ c: 2 }, 123] });
 * obj.a = 10; // Throws TypeError
 * ```
 */
export function deepFreeze<T extends IObject>(obj: T): IDeepReadonly<T> {

    if (typeof obj !== 'object' || obj === null) {

        return obj;
    }

    const ctx: IContext = { processed: new Set(), };

    if (Array.isArray(obj)) {

        deepFreezeArray(obj, ctx);
    }
    else if (typeof obj === 'object' && obj !== null) {

        deepFreezeObject(obj, ctx);
    }

    return obj as IDeepReadonly<T>;
}

interface IContext {

    processed: Set<any>;
}

function deepFreezeObject(obj: IDict, ctx: IContext): void {

    if (ctx.processed.has(obj)) {

        return;
    }

    ctx.processed.add(obj);

    const input: IDict = obj;

    for (const keys of [Object.getOwnPropertyNames(obj), Object.getOwnPropertySymbols(obj)]) {

        for (const key of keys) {

            const value = input[key];

            if (Array.isArray(value)) {

                deepFreezeArray(value, ctx);
            }
            else if (value && typeof value === 'object' && value !== null) {

                deepFreezeObject(value, ctx);
            }
        }
    }

    Object.freeze(obj);
}

function deepFreezeArray(arr: any[], ctx: IContext): void {

    if (ctx.processed.has(arr)) {

        return;
    }

    ctx.processed.add(arr);

    for (const item of arr) {

        if (Array.isArray(item)) {

            deepFreezeArray(item, ctx);
        }
        else if (item && typeof item === 'object' && item !== null) {

            deepFreezeObject(item, ctx);
        }
    }

    Object.freeze(arr);
}
