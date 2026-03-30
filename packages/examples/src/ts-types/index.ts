/**
 * TypeScript example — @litert/utils-ts-types
 *
 * This package is type-only at runtime (`export {}` only).
 * The purpose of this example is to verify that every exported type is
 * resolvable and structurally usable in TypeScript code.
 *
 * TypeScript-specific: all meaningful imports here are `import type`, and
 * every type is exercised by constructing at least one typed variable.
 */

// ── 1. Direct package import (type-only) ──────────────────────────────────────
import type {
    IObject,
    IDict,
    IFunction,
    IAsyncFunction,
    IDeepPartial,
    IConstructor,
    IBasicType,
    IAdvancedType,
    IElementOfArray,
    IMaybeAsync,
    IMaybeArray,
    IToPromise,
    IfIsAny,
    IfIsNever,
    IInstanceOf,
} from '@litert/utils-ts-types';

// ── Runtime imports (UtilityError is a real class, not type-only) ─────────────
import { UtilityError } from '@litert/utils-ts-types';

// ── 2. Bundle flat re-export (ts-types is flat in @litert/utils, no namespace)
import type { IObject as IBundleObject, IDict as IBundleDict } from '@litert/utils';
import { UtilityError as BundleUtilityError } from '@litert/utils';

// ── Runtime presence check (side-effect imports) ──────────────────────────────
import '@litert/utils-ts-types';
import '@litert/utils';

(async (): Promise<void> => {

    console.log('@litert/utils-ts-types     import ok (type-only, no runtime exports)');
    console.log('@litert/utils (flat re-export)  import ok');

    // ── IObject ───────────────────────────────────────────────────────────────────
    // Acts as base constraint for any plain object — verified via generic function
    function identity<T extends IObject>(v: T): T { return v; }
    const obj: IBundleObject = identity({ x: 1 });
    console.log('IObject constraint:', typeof obj === 'object'); // true

    // ── IDict ─────────────────────────────────────────────────────────────────────
    const dict: IDict<number>              = { a: 1, b: 2, c: 3 };
    const dictB: IBundleDict<string>       = { key: 'val' };
    const symbolDict: IDict<string, symbol> = { [Symbol('k')]: 'hello' };
    console.log('IDict<number> values all numbers:', Object.values(dict).every(v => typeof v === 'number')); // true
    console.log('IDict bundle re-export:', typeof dictB.key === 'string'); // true
    void symbolDict;

    // ── IFunction / IAsyncFunction ────────────────────────────────────────────────
    const add: IFunction<[number, number], number> = (a, b) => a + b;
    console.log('IFunction call:', add(3, 4)); // 7

    const upper: IAsyncFunction<[string], string> = async s => s.toUpperCase();
    console.log('IAsyncFunction call:', await upper('hello')); // 'HELLO'

    // ── IDeepPartial ──────────────────────────────────────────────────────────────
    interface IConfig extends IObject {
        server: { host: string; port: number };
        debug:  boolean;
    }
    const partial: IDeepPartial<IConfig> = { server: { host: 'localhost' } };
    console.log('IDeepPartial.server.host:', partial.server?.host); // 'localhost'

    // ── IConstructor / IInstanceOf ────────────────────────────────────────────────
    class Service { greet(): string { return 'hello'; } }

    const ctor: IConstructor<Service>   = Service;
    type  TServiceInst = IInstanceOf<typeof ctor>; // resolves to Service
    const inst: TServiceInst = new ctor();
    console.log('IConstructor + IInstanceOf:', inst.greet()); // 'hello'

    // ── IBasicType / IAdvancedType ────────────────────────────────────────────────
    function describeBasic(v: IBasicType): string { return String(v); }
    console.log('IBasicType string:', describeBasic('text'));
    console.log('IBasicType number:', describeBasic(42));
    console.log('IBasicType null:', describeBasic(null));
    console.log('IBasicType undefined:', describeBasic(undefined));

    // IAdvancedType = IObject | any[] | IFunction | IConstructor
    const adv: IAdvancedType = { nested: true };
    console.log('IAdvancedType object:', typeof adv === 'object'); // true

    // ── IElementOfArray ───────────────────────────────────────────────────────────
    type TNumElem = IElementOfArray<number[]>; // resolves to number
    const elem: TNumElem = 42;
    console.log('IElementOfArray:', elem === 42); // true

    // ── IMaybeAsync / IToPromise ──────────────────────────────────────────────────
    async function wrap<T>(v: IMaybeAsync<T>): Promise<T> {
        return v instanceof Promise ? v : Promise.resolve(v);
    }
    const p1: IToPromise<string>          = Promise.resolve('wrapped');
    const p2: IToPromise<Promise<string>> = Promise.resolve('already-promise');
    console.log('IMaybeAsync sync:', await wrap(99));               // 99
    console.log('IMaybeAsync async:', await wrap(Promise.resolve('hi'))); // 'hi'
    console.log('IToPromise:', await p1, '|', await p2);

    // ── IMaybeArray ───────────────────────────────────────────────────────────────
    function normalise<T>(v: IMaybeArray<T>): T[] { return Array.isArray(v) ? v : [v]; }
    console.log('IMaybeArray single:', normalise(42));       // [42]
    console.log('IMaybeArray array:', normalise([1, 2, 3])); // [1, 2, 3]

    // ── IfIsAny / IfIsNever ───────────────────────────────────────────────────────
    // These conditional types resolve at compile-time only — verify they compile
    type TIsAny    = IfIsAny<any,    'yes', 'no'>; // 'yes'
    type TNotAny   = IfIsAny<string, 'yes', 'no'>; // 'no'
    type TIsNever  = IfIsNever<never,  'yes', 'no'>; // 'yes'
    type TNotNever = IfIsNever<string, 'yes', 'no'>; // 'no'

    const isAny: TIsAny    = 'yes';
    const notAny: TNotAny  = 'no';
    const isNev: TIsNever  = 'yes';
    const notNev: TNotNever = 'no';
    console.log('IfIsAny / IfIsNever types compile correctly:', isAny, notAny, isNev, notNev);

    // ── UtilityError ──────────────────────────────────────────────────────────────
    // UtilityError is a real class (runtime value), not type-only
    console.log('\n=== UtilityError ===');

    // Subclass UtilityError to create a typed application error
    class E_NOT_FOUND extends UtilityError<{ id: number }> {
        public constructor(id: number, origin: unknown = null) {
            super('not_found', `Resource ${id} was not found.`, { id }, origin);
        }
    }

    const err = new E_NOT_FOUND(42);
    console.log('name:',    err.name);               // 'not_found'
    console.log('message:', err.message);             // 'Resource 42 was not found.'
    console.log('context:', err.context);             // { id: 42 }
    console.log('origin:',  err.origin);              // null
    console.log('instanceof Error:', err instanceof Error);                  // true
    console.log('instanceof UtilityError:', err instanceof UtilityError);    // true
    console.log('instanceof E_NOT_FOUND:', err instanceof E_NOT_FOUND);      // true

    // Verify BundleUtilityError is the same class (flat re-export from @litert/utils)
    console.log('BundleUtilityError === UtilityError:', BundleUtilityError === UtilityError); // true

    // With wrapped origin error
    const cause = new Error('upstream failure');
    const wrapped = new E_NOT_FOUND(7, cause);
    console.log('origin is cause:', wrapped.origin === cause); // true

    console.log('\n@litert/utils-ts-types: all 15 type exports + UtilityError class verified');

})().catch(console.error);
