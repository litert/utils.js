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

import { IfIsNever, IToPromise } from '@litert/utils-ts-types';

/**
 * The options for the `try-catch[-finally]` expression.
 */
export interface ITryCatchOptions<TOk, TErr, TFinal extends void | Promise<void>> {

    /**
     * The body of the `try` statement.
     *
     * > It can be an asynchronous function or a synchronous function.
     */
    try: () => TOk;

    /**
     * The body of the `catch` statement.
     *
     * > Even if the `catch` is triggered, and even if an exception is thrown in the `catch`,
     * > the `finally` will still be executed.
     *
     * > It can be an asynchronous function or a synchronous function.
     */
    catch: (e: unknown) => TErr;

    /**
     * The body of the `finally` statement.
     *
     * > **To avoid difficult-to-handle situations, ensure that the `finally` statement does not**
     * > **throw an exception.**
     * > (But if the `finally` statement throws an exception, it can still be caught by the outer
     * > `try-catch`.)
     * >
     * > Even if the `catch` is triggered, and even if an exception is thrown in the `catch`, the `finally` will still be executed.
     * >
     * > It must be a synchronous function.
     */
    finally?: () => TFinal;
}

type IfAnyAsync<TA, TB, TYes, TNo> = IfIsNever<TA,
    IfIsNever<TB, TNo, TB extends Promise<any> ? TYes : TNo>,
    IfIsNever<TB, TA extends Promise<any> ? TYes : TNo,
        TA extends Promise<any> ?
            TYes :
            TB extends Promise<any> ?
                TYes :
                TNo
    >
>;

type IfAnyAsyncTriple<TA, TB, TC, TYes, TNo> = IfAnyAsync<TA, TB,
    TYes,
    IfIsNever<TC, TNo, TC extends Promise<any> ? TYes : TNo>
>;

type IfNeverAnyway<T, TYes, TNo> = IfIsNever<T, TYes, T extends Promise<never> ? TYes : TNo>;

export type ITryCatchResult<TOk, TErr, TFinal> = IfNeverAnyway<TOk,
    IfNeverAnyway<TErr,
        // both are never
        IfAnyAsyncTriple<TOk, TErr, TFinal, Promise<never>, never>,
        // TOk is never, TErr is not
        IfAnyAsyncTriple<TOk, TErr, TFinal, IToPromise<TErr>, TErr>
    >,
    // TOk is not never
    IfNeverAnyway<TErr,
        // TOk is not never, TErr is never
        IfAnyAsyncTriple<TOk, TErr, TFinal, IToPromise<TOk>, TOk>,
        // Both are not never
        IfAnyAsyncTriple<TOk, TErr, TFinal, IToPromise<TErr> | IToPromise<TOk>, TOk | TErr>
    >
>;

/**
 * The expression version of the `try-catch[-finally]` statement, with support for asynchronous
 * functions.
 *
 * @param opts  The options for the `try-catch[-finally]` expression.
 */
export function tryCatch<
    TOk,
    TErr = never,
    TFinal extends void | Promise<void> = void
>(opts: ITryCatchOptions<TOk, TErr, TFinal>): ITryCatchResult<TOk, TErr, TFinal> {

    let isFinalCalled = false;

    try {

        const ret = opts.try();

        if (ret instanceof Promise) {

            isFinalCalled = true;

            return (async () => {

                try {

                    return await ret;
                }
                catch (e) {

                    const catchResult = opts.catch(e);

                    if (catchResult instanceof Promise) {

                        return await catchResult;
                    }

                    return catchResult;
                }
                finally {

                    const fRet = opts.finally?.();

                    if (fRet instanceof Promise) {

                        await fRet;
                    }
                }

            })() as any;
        }

        if (opts.finally) {

            isFinalCalled = true;

            const finallyRet = opts.finally();

            if (finallyRet instanceof Promise) {

                return (async () => {

                    await finallyRet;

                    return ret as any;

                })() as any;
            }
        }

        return ret as any;
    }
    catch (e) {

        if (isFinalCalled) {

            throw e;
        }

        try {

            const ret = opts.catch(e);

            if (ret instanceof Promise) {

                isFinalCalled = true;

                return (async () => {

                    try {

                        return await (ret as Promise<any>);
                    }
                    finally {

                        const fRet = opts.finally?.();

                        if (fRet instanceof Promise) {

                            await fRet;
                        }
                    }

                })() as any;
            }

            if (opts.finally) {

                isFinalCalled = true;

                const finallyRet = opts.finally();

                if (finallyRet instanceof Promise) {

                    return (async () => {

                        await finallyRet;

                        return ret as any;
                    })() as any;
                }
            }

            return ret as any;
        }
        catch (e) {

            if (opts.finally && !isFinalCalled) {

                isFinalCalled = true;

                const finallyRet = opts.finally();

                if (finallyRet instanceof Promise) {

                    return (async () => {

                        await finallyRet;

                        throw e;
                    })() as any;
                }
            }

            throw e;
        }
    }
}
