/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { deepFreeze } from './DeepFreeze.js';

NodeTest.describe('Module Object - Function DeepFreeze', () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    NodeTest.it('B-M-00001: Should deeply freeze an object', () => {

        const obj = deepFreeze({
            a: 1,
            b: {
                c: 2
            },
            d: [3, 4, { e: 5 }, [6, 7]],
            k: null,
        });

        NodeAssert.throws(() => {
            (obj as any).a = 10;
        }, TypeError);

        NodeAssert.throws(() => {
            (obj.b as any).c = 20;
        }, TypeError);

        NodeAssert.throws(() => {
            (obj.d as any)[0] = 30;
        }, TypeError);

        NodeAssert.throws(() => {
            ((obj.d as any)[2] as any).e = 50;
        }, TypeError);

        NodeAssert.throws(() => {
            ((obj.d as any)[3] as any)[0] = 60;
        }, TypeError);
    });

    NodeTest.it('B-M-00002: Should deeply freeze an array', () => {

        const arr = deepFreeze([1, [2, 3], { a: 4 }]);

        NodeAssert.throws(() => {
            (arr as any)[0] = 10;
        }, TypeError);

        NodeAssert.throws(() => {
            ((arr as any)[1] as any)[0] = 20;
        }, TypeError);

        NodeAssert.throws(() => {
            ((arr as any)[2] as any).a = 40;
        }, TypeError);
    });

    NodeTest.it('B-M-00003: Should return the same object reference', () => {

        const obj = { a: 1 };
        const frozenObj = deepFreeze(obj);

        NodeAssert.strictEqual(frozenObj, obj);
    });

    NodeTest.it('B-M-00004: Should handle non-object values gracefully', () => {

        for (const v of [
            42, 'hello', true, null,
            undefined, Symbol('sym'), 3.14, BigInt(100)
        ]) {

            const result = deepFreeze(v as any);

            NodeAssert.strictEqual(result, v);
        }
    });

    NodeTest.it('B-M-00005: Should handle circular references without infinite recursion', () => {

        const obj: any = { a: 1 };
        obj.self = obj;

        const frozenObj = deepFreeze(obj);

        NodeAssert.strictEqual(frozenObj, obj);
        NodeAssert.throws(() => {
            (frozenObj as any).a = 10;
        }, TypeError);
    });

    NodeTest.it('B-M-00006: Should handle circular references in arrays without infinite recursion', () => {

        const arr: any[] = [1];
        arr.push(arr);

        const frozenArr = deepFreeze(arr);

        NodeAssert.strictEqual(frozenArr, arr);
        NodeAssert.throws(() => {
            (frozenArr as any)[0] = 10;
        }, TypeError);
    });

    NodeTest.it('B-M-00007: Should handle objects with symbol keys', () => {

        const symKey = Symbol('symKey');
        const obj = { [symKey]: 42 };
        const frozenObj = deepFreeze(obj);

        NodeAssert.strictEqual(frozenObj[symKey], 42);
        NodeAssert.throws(() => {
            (frozenObj as any)[symKey] = 100;
        }, TypeError);
    });
});
