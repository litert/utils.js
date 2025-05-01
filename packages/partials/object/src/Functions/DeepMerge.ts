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

/* eslint-disable @typescript-eslint/no-explicit-any */

import type { IDict, IObject } from '@litert/utils-ts-types';
import { getPropertyNames } from './GetPropertyNames';

export type IMergeArray<T1 extends any[], T2 extends any[]> = T1[0] extends IObject ?
    T2[0] extends IObject ?
        Array<IMergeObject<T1[0], T2[0]>> :
        T2 :
    T2;

export type IMergeObject<T1 extends IObject, T2 extends IObject> = {
    [K in (keyof T1 | keyof T2)]: K extends keyof T2 ?
        K extends keyof T1 ?
            T1[K] extends any[] ?
                T2[K] extends any[] ?
                    IMergeArray<T1[K], T2[K]> :
                    T2[K] :
                T1[K] extends IObject ?
                    T2[K] extends IObject ?
                        IMergeObject<T1[K], T2[K]> :
                        T2[K] :
                    T2[K] :
            T2[K] :
        K extends keyof T1 ?
            T1[K] :
            never
};

function isObject(obj: unknown): obj is IObject {

    return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
}

function deepMergeArray(a1: any[], a2: any[], opts: IDeepMergeOptions): any[] {

    const l = Math.max(a1.length, a2.length);
    const ret = new Array(l);

    for (let i = 0; i < l; i++) {

        if (isObject(a1[i]) && isObject(a2[i])) {

            ret[i] = deepMerge(a1[i], a2[i], opts);
        }
        else if (Array.isArray(a1[i]) && Array.isArray(a2[i])) {

            ret[i] = deepMergeArray(a1[i], a2[i], opts);
        }
        else {

            ret[i] = a2[i] === undefined ? a1[i] : a2[i];
        }
    }

    return ret;
}

export interface IDeepMergeOptions {

    /**
     * Whether to treat arrays as values.
     *
     * @default false
     */
    'arrayAsValue'?: boolean;

    /**
     * Whether to treat null as an empty object.
     *
     * This option helps to avoid overwriting an object with null.
     *
     * @default false
     */
    'nullAsEmptyObject'?: boolean;
}

/**
 * Merge two objects recursively. Use the values in the second object when conflicts occur.
 *
 * @param obj1    The first object to merge
 * @param obj2    The second object to merge
 * @param opts    The options for the merge operation
 *
 * @returns    The new merged object, without modifying the original two objects.
 */
export function deepMerge<T1 extends IObject, T2 extends IObject>(
    obj1: T1,
    obj2: T2,
    opts: IDeepMergeOptions = {},
): IMergeObject<T1, T2> {

    const ret = {} as IDict;

    for (const k of getPropertyNames(obj1)) {

        ret[k] = (obj1 as any)[k];
    }

    for (const k of getPropertyNames(obj2)) {

        if ((ret[k] === null || obj2[k] === null) && opts.nullAsEmptyObject) {

            ret[k] = {};
            obj2[k] = {} as any;
        }

        if (isObject(ret[k]) && isObject(obj2[k])) {

            ret[k] = deepMerge(ret[k], obj2[k], opts);
        }
        else if (Array.isArray(ret[k]) && Array.isArray(obj2[k]) && !opts.arrayAsValue) {

            ret[k] = deepMergeArray(ret[k], obj2[k], opts);
        }
        else {

            ret[k] = obj2[k];
        }
    }

    return ret as any;
}
