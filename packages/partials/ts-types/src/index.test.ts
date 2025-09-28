import type * as dTS from './index';

// Type IFunction

declare const fn1: dTS.IFunction<[number, string], boolean>;
declare const fnAny: dTS.IFunction;

fnAny(123, 'abc', 'fff');
fn1(123, 'abc');

// Type IAsyncFunction

declare const asyncFn1: dTS.IAsyncFunction<[number, string], boolean>;
declare const asyncFnAny: dTS.IAsyncFunction;

asyncFnAny(123, 'abc', 'fff').then((res) => {
    const r: unknown = res;
    return r;
});

asyncFn1(123, 'abc').then((res) => {
    const r: boolean = res;
    return r;
});

// Type IElementOfArray

declare const arr1: number[];
declare const arr2: string[];
declare const arr3: Array<{ a: number; b: string }>;

const e1: dTS.IElementOfArray<typeof arr1> = 123;
const e2: dTS.IElementOfArray<typeof arr2> = 'abc';
const e3: dTS.IElementOfArray<typeof arr3> = { a: 123, b: 'abc' };

console.log(e1, e2, e3);

// Type IMaybeArray

declare let ma1: dTS.IMaybeArray<number>;
declare let ma2: dTS.IMaybeArray<string>;
declare let ma3: dTS.IMaybeArray<{ a: number; b: string }>;

ma1 = 123;
ma1 = [123, 456];

ma2 = 'abc';
ma2 = ['abc', 'def'];

ma3 = { a: 123, b: 'abc' };
ma3 = [{ a: 123, b: 'abc' }, { a: 456, b: 'def' }];

console.log(ma1, ma2, ma3);

// Type IJsonSafeValue

declare let jsv1: dTS.IJsonSafeValue;
declare let jsv2: dTS.IJsonSafeValue;

jsv1 = 'abc';
jsv1 = 123;
jsv1 = true;
jsv1 = null;
jsv1 = ['abc', 123, false, null];
jsv1 = { a: 'abc', b: 123, c: false, d: null, e: ['abc', 123, false, null], f: { a: 'abc' } };

jsv2 = ['abc', 123, true, null, ['abc', 123, false, null], { a: 'abc' }];
jsv2 = { a: 'abc', b: 123, c: true, d: null, e: ['abc', 123, false, null], f: { a: 'abc' } };

console.log(jsv1, jsv2);

// Type IConstructor

class A {}

const c1: dTS.IConstructor = A;
const c2: dTS.IConstructor<A> = A;

const a1: unknown = new c1();
const a2: A = new c2();

console.log(a1, a2);
