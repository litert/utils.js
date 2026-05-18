/* eslint-disable */
import type * as dTS from './Typings.js';
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import * as ts from 'typescript';
import * as NodePath from 'node:path';

/** Consumes variables so noUnusedLocals does not fire on type-check-only locals. */
function use(..._args: unknown[]): void { /* no-op */ }

const _tcSrcDir = import.meta.dirname;
const _tcConfigPath = NodePath.join(import.meta.dirname, '..', 'tsconfig.json');

function testTypeScriptCompilation(moduleSrc: string): 'ok' | 'syntax_error' | 'unknown' {

    try {

        const virtualFileName = NodePath.join(_tcSrcDir, '__virtual_test__.ts');

        const configFile = ts.readConfigFile(_tcConfigPath, ts.sys.readFile);
        if (configFile.error) { return 'unknown'; }

        const parsedConfig = ts.parseJsonConfigFileContent(
            configFile.config,
            ts.sys,
            NodePath.dirname(_tcConfigPath),
        );

        parsedConfig.options.noEmit = true;
        parsedConfig.options.composite = false;
        parsedConfig.options.incremental = false;

        const defaultHost = ts.createCompilerHost(parsedConfig.options);
        const customHost: ts.CompilerHost = {
            ...defaultHost,
            getSourceFile(fileName, languageVersionOrOptions) {
                if (NodePath.normalize(fileName) === NodePath.normalize(virtualFileName)) {
                    return ts.createSourceFile(fileName, moduleSrc, languageVersionOrOptions);
                }
                return defaultHost.getSourceFile(fileName, languageVersionOrOptions);
            },
            fileExists(fileName) {
                if (NodePath.normalize(fileName) === NodePath.normalize(virtualFileName)) {
                    return true;
                }
                return defaultHost.fileExists(fileName);
            },
            readFile(fileName) {
                if (NodePath.normalize(fileName) === NodePath.normalize(virtualFileName)) {
                    return moduleSrc;
                }
                return defaultHost.readFile(fileName);
            },
        };

        const program = ts.createProgram(
            [...parsedConfig.fileNames, virtualFileName],
            parsedConfig.options,
            customHost,
        );

        const allDiagnostics = ts.getPreEmitDiagnostics(program);

        const virtualFileDiagnostics = [...allDiagnostics].filter(
            (d) => d.file !== undefined
                && NodePath.normalize(d.file.fileName) === NodePath.normalize(virtualFileName),
        );

        if (virtualFileDiagnostics.length > 0) {
            return 'syntax_error';
        }

        return 'ok';
    }
    catch {
        return 'unknown';
    }
}

NodeTest.describe('Module ts-types - Typings', () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    NodeTest.it('B-M-00001: Should accept a plain object literal', () => {

        const plain: dTS.IObject = {};
        const withProps: dTS.IObject = { key: 'value', n: 42 };
        use(plain, withProps);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00002: Should accept a class instance', () => {

        class Sample { x = 1; }
        const inst: dTS.IObject = new Sample();
        use(inst);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00003: Should not accept null', () => {

        // @ts-expect-error null is not assignable to IObject
        const bad: dTS.IObject = null;
        use(bad);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00004: Should not accept undefined', () => {

        // @ts-expect-error undefined is not assignable to IObject
        const bad: dTS.IObject = undefined;
        use(bad);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00005: Default IDict accepts any key/value combination', () => {

        const d: dTS.IDict = { a: 1, b: 'hello', c: true };
        use(d);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00006: IDict<string> constrains all values to string', () => {

        const d: dTS.IDict<string> = { a: 'x', b: 'y' };
        use(d);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00007: IDict<string, string> constrains both keys and values to string', () => {

        const d: dTS.IDict<string, string> = { key: 'value' };
        use(d);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00008: IDict<string> should not accept a non-string value', () => {

        // @ts-expect-error number is not assignable to string
        const bad: dTS.IDict<string> = { a: 42 };
        use(bad);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00009: Default IFunction accepts any argument count and types', () => {

        const fn: dTS.IFunction = (..._args: unknown[]) => 'anything';
        fn(1, 'a', true);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00010: Typed IFunction enforces parameter and return types', () => {

        const fn: dTS.IFunction<[number, string], boolean> = (n, s) => n > s.length;
        const result: boolean = fn(1, 'hi');
        use(result);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00011: Should not accept wrong return type when assigning the call result', () => {

        const fn: dTS.IFunction<[number], boolean> = (n) => n > 0;
        // @ts-expect-error string is not assignable to boolean
        const bad: string = fn(1);
        use(bad);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00012: Default IAsyncFunction accepts any arguments and returns Promise<unknown>', () => {

        const fn: dTS.IAsyncFunction = async (..._args: unknown[]) => 'result';
        fn(1, 'extra').then((res) => {
            const r: unknown = res;
            use(r);
        });
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00013: Typed IAsyncFunction enforces the resolved type inside .then', () => {

        const fn: dTS.IAsyncFunction<[number], string> = async (n) => String(n);
        fn(42).then((res) => {
            const r: string = res;
            use(r);
        });
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00014: Should not accept wrong type when reading the resolved value', () => {

        const fn: dTS.IAsyncFunction<[number], string> = async (n) => String(n);
        fn(1).then((res) => {
            // @ts-expect-error number is not assignable to string
            const bad: number = res;
            use(bad);
        });
        NodeAssert.ok(true);
    });

    interface IDeep {
        label: string;
        nested: {
            count: number;
            flag: boolean;
        };
    }

    NodeTest.it('B-M-00015: Should make all top-level properties optional', () => {

        const empty: dTS.IDeepPartial<IDeep> = {};
        const partial: dTS.IDeepPartial<IDeep> = { label: 'hello' };
        use(empty, partial);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00016: Should allow partially-specified nested objects (recursive branch)', () => {

        const onlyCount: dTS.IDeepPartial<IDeep> = { nested: { count: 5 } };
        const emptyNested: dTS.IDeepPartial<IDeep> = { nested: {} };
        use(onlyCount, emptyNested);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00017: Should accept a fully-specified value (primitive branch)', () => {

        const full: dTS.IDeepPartial<IDeep> = { label: 'x', nested: { count: 1, flag: true } };
        use(full);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00018: Should not accept a wrong type for a primitive property', () => {

        // @ts-expect-error number is not assignable to string
        const bad: dTS.IDeepPartial<IDeep> = { label: 42 };
        use(bad);
        NodeAssert.ok(true);
    });

    class MyClass {
        public readonly value = 42;
    }

    NodeTest.it('B-M-00019: Default IConstructor accepts any class', () => {

        const ctor: dTS.IConstructor = MyClass;
        const inst: unknown = new ctor();
        use(inst);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00020: Typed IConstructor<T> produces correctly typed instances', () => {

        const ctor: dTS.IConstructor<MyClass> = MyClass;
        const inst: MyClass = new ctor();
        NodeAssert.strictEqual(inst.value, 42);
    });

    NodeTest.it('B-M-00021: Should not accept a plain object as a constructor', () => {

        // @ts-expect-error plain object is not a construct signature
        const bad: dTS.IConstructor = { create: () => ({}) };
        use(bad);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00022: Should accept a string value', () => {

        const v: dTS.IBasicType = 'hello';
        use(v);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00023: Should accept a number value', () => {

        const v: dTS.IBasicType = 42;
        use(v);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00024: Should accept a boolean value', () => {

        const v: dTS.IBasicType = true;
        use(v);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00025: Should accept null', () => {

        const v: dTS.IBasicType = null;
        use(v);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00026: Should accept undefined', () => {

        const v: dTS.IBasicType = undefined;
        use(v);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00027: Should accept a bigint value', () => {

        const v: dTS.IBasicType = 9007199254740993n;
        use(v);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00028: Should accept a symbol value', () => {

        const v: dTS.IBasicType = Symbol('test');
        use(v);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00029: Should not accept a plain object', () => {

        // @ts-expect-error object literal is not assignable to IBasicType
        const bad: dTS.IBasicType = {};
        use(bad);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00030: Should not accept an array', () => {

        // @ts-expect-error array is not assignable to IBasicType
        const bad: dTS.IBasicType = [1, 2, 3];
        use(bad);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00031: Should accept a plain object (IObject member)', () => {

        const v: dTS.IAdvancedType = { key: 'value' };
        use(v);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00032: Should accept an array (any[] member)', () => {

        const v: dTS.IAdvancedType = [1, 2, 3];
        use(v);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00033: Should accept a function (IFunction member)', () => {

        const v: dTS.IAdvancedType = () => 42;
        use(v);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00034: Should accept a class constructor (IConstructor member)', () => {

        class Bar {}
        const v: dTS.IAdvancedType = Bar;
        use(v);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00035: Should not accept null', () => {

        // @ts-expect-error null is not assignable to IAdvancedType
        const bad: dTS.IAdvancedType = null;
        use(bad);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00036: Should not accept undefined', () => {

        // @ts-expect-error undefined is not assignable to IAdvancedType
        const bad: dTS.IAdvancedType = undefined;
        use(bad);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00037: Should extract number from number[]', () => {

        const elem: dTS.IElementOfArray<number[]> = 123;
        use(elem);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00038: Should extract string from string[]', () => {

        const elem: dTS.IElementOfArray<string[]> = 'abc';
        use(elem);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00039: Should extract the object shape from an object array', () => {

        const elem: dTS.IElementOfArray<Array<{ a: number; b: string }>> = { a: 1, b: 'x' };
        use(elem);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00040: Should yield never for a never[] array (unreachable element type)', () => {

        // @ts-expect-error any value is not assignable to never
        const bad: dTS.IElementOfArray<never[]> = 0;
        use(bad);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00041: Should not accept an element of the wrong type', () => {

        // @ts-expect-error string is not assignable to number
        const bad: dTS.IElementOfArray<number[]> = 'not a number';
        use(bad);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00042: Should accept a direct synchronous value', () => {

        const v: dTS.IMaybeAsync<string> = 'hello';
        use(v);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00043: Should accept a Promise resolving to the type', () => {

        const v: dTS.IMaybeAsync<string> = Promise.resolve('hello');
        use(v);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00044: Should not accept a value of the wrong type', () => {

        // @ts-expect-error number is not assignable to IMaybeAsync<string>
        const bad: dTS.IMaybeAsync<string> = 42;
        use(bad);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00045: Should accept a single value', () => {

        const v: dTS.IMaybeArray<number> = 123;
        use(v);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00046: Should accept an array of values', () => {

        const v: dTS.IMaybeArray<number> = [1, 2, 3];
        use(v);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00047: Should accept an array with mixed-origin object type', () => {

        const obj = { a: 1, b: 'x' };
        const v: dTS.IMaybeArray<{ a: number; b: string }> = [obj, { a: 2, b: 'y' }];
        use(v);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00048: Should not accept a value of the wrong element type', () => {

        // @ts-expect-error string is not assignable to IMaybeArray<number>
        const bad: dTS.IMaybeArray<number> = 'hello';
        use(bad);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00049: Should wrap a non-Promise type in Promise', () => {

        const v: dTS.IToPromise<string> = Promise.resolve('hello');
        use(v);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00050: Should pass an already-Promise type through unchanged (no double-wrapping)', () => {

        const v: dTS.IToPromise<Promise<string>> = Promise.resolve('world');
        use(v);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00051: Should not accept a Promise with the wrong inner type', () => {

        // @ts-expect-error Promise<number> is not assignable to Promise<string>
        const bad: dTS.IToPromise<Promise<string>> = Promise.resolve(42);
        use(bad);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00052: Should not accept a bare non-Promise value', () => {

        // @ts-expect-error string is not assignable to Promise<string>
        const bad: dTS.IToPromise<string> = 'not a promise';
        use(bad);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00053: Should resolve to TYes when T is any', () => {

        const yes: dTS.IfIsAny<any, 'yes', 'no'> = 'yes';
        // @ts-expect-error 'no' is not assignable to 'yes'
        const no: dTS.IfIsAny<any, 'yes', 'no'> = 'no';
        use(yes, no);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00054: Should resolve to TNo when T is a concrete type', () => {

        const no: dTS.IfIsAny<string, 'yes', 'no'> = 'no';
        // @ts-expect-error 'yes' is not assignable to 'no'
        const yes: dTS.IfIsAny<string, 'yes', 'no'> = 'yes';
        use(no, yes);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00055: Should resolve to TNo when T is unknown', () => {

        const no: dTS.IfIsAny<unknown, 'yes', 'no'> = 'no';
        // @ts-expect-error 'yes' is not assignable to 'no'
        const yes: dTS.IfIsAny<unknown, 'yes', 'no'> = 'yes';
        use(no, yes);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00056: Should resolve to TNo when T is never', () => {

        const no: dTS.IfIsAny<never, 'yes', 'no'> = 'no';
        // @ts-expect-error 'yes' is not assignable to 'no'
        const yes: dTS.IfIsAny<never, 'yes', 'no'> = 'yes';
        use(no, yes);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00057: Should resolve to TYes when T is never', () => {

        const yes: dTS.IfIsNever<never, 'yes', 'no'> = 'yes';
        // @ts-expect-error 'no' is not assignable to 'yes'
        const no: dTS.IfIsNever<never, 'yes', 'no'> = 'no';
        use(yes, no);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00058: Should resolve to TNo when T is a concrete type', () => {

        const no: dTS.IfIsNever<string, 'yes', 'no'> = 'no';
        // @ts-expect-error 'yes' is not assignable to 'no'
        const yes: dTS.IfIsNever<string, 'yes', 'no'> = 'yes';
        use(no, yes);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00059: Should resolve to TNo when T is unknown', () => {

        const no: dTS.IfIsNever<unknown, 'yes', 'no'> = 'no';
        // @ts-expect-error 'yes' is not assignable to 'no'
        const yes: dTS.IfIsNever<unknown, 'yes', 'no'> = 'yes';
        use(no, yes);
        NodeAssert.ok(true);
    });

    class Bar {
        public readonly value = 99;
    }

    NodeTest.it('B-M-00060: Should extract the instance type from an IConstructor type', () => {

        type BarCtor = dTS.IConstructor<Bar>;
        const inst: dTS.IInstanceOf<BarCtor> = new Bar();
        NodeAssert.strictEqual(inst.value, 99);
    });

    NodeTest.it('B-M-00061: Should yield never for a non-constructor type', () => {

        // @ts-expect-error any value is not assignable to never
        const bad: dTS.IInstanceOf<string> = 'anything';
        use(bad);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00062: Should not accept a value of the wrong instance type', () => {

        type BarCtor = dTS.IConstructor<Bar>;
        // @ts-expect-error string is not assignable to Bar
        const wrong: dTS.IInstanceOf<BarCtor> = 'not a Bar';
        use(wrong);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00063: IDeepReadonly should process simple object well', () => {

        const obj: dTS.IDeepReadonly<{
            a: string;
            b?: {
                c: string;
                d?: number;
                e: [number, { f: string; g: string[] }, 'ffff'];
            };
        }> = {
            a: 'hello',
            b: {
                c: 'world',
                d: 42,
                e: [1, { f: 'nested', g: ['a', 'b'] }, 'ffff'],
            }
        };

        use(obj);
        use(obj.a);
        use(obj.b);
        use(obj.b?.c);
        use(obj.b?.d);
        use(obj.b?.e[1].g[0]);
        NodeAssert.ok(true);
    });

    NodeTest.it('B-M-00064: IDeepReadonly should allow reading properties without compile error', () => {

        NodeAssert.strictEqual(testTypeScriptCompilation([
            "import type * as dTS from './Typings.js';",
            "const obj: dTS.IDeepReadonly<{ a: string; b: { c: string } }> = { a: 'hello', b: { c: 'world' } };",
            "void obj.a;",
            "void obj.b.c;",
        ].join('\n')), 'ok');

        NodeAssert.strictEqual(testTypeScriptCompilation([
            "import type * as dTS from './Typings.js';",
            "const arr: dTS.IDeepReadonly<Array<{ a: string; b: number }>> = [",
            "    { a: 'hello', b: 42 },",
            "    { a: 'world', b: 99 },",
            "];",
            "void arr[0].a;",
        ].join('\n')), 'ok');
    });

    NodeTest.it('B-M-00065: IDeepReadonly should prevent nested object property assignment', () => {

        NodeAssert.strictEqual(testTypeScriptCompilation([
            "import type * as dTS from './Typings.js';",
            "const obj: dTS.IDeepReadonly<{ b: { c: string } }> = { b: { c: 'world' } };",
            "obj.b.c = 'changed';",
        ].join('\n')), 'syntax_error');

        NodeAssert.strictEqual(testTypeScriptCompilation([
            "import type * as dTS from './Typings.js';",
            "const obj: dTS.IDeepReadonly<{",
            "    a: string;",
            "    b?: {",
            "        c: string;",
            "        d?: number;",
            "        e: [number, { f: string; g: string[] }, 'ffff'];",
            "    };",
            "}> = {",
            "    a: 'hello',",
            "    b: {",
            "        c: 'world',",
            "        d: 42,",
            "        e: [1, { f: 'nested', g: ['a', 'b'] }, 'ffff'],",
            "    }",
            "};",
            "obj.b?.e[1].g[0] = 'changed';",
        ].join('\n')), 'syntax_error');

        NodeAssert.strictEqual(testTypeScriptCompilation([
            "import type * as dTS from './Typings.js';",
            "const arr: dTS.IDeepReadonly<Array<{ a: string; b: number }>> = [",
            "    { a: 'hello', b: 42 },",
            "    { a: 'world', b: 99 },",
            "];",
            "arr[0].a = 'changed';",
        ].join('\n')), 'syntax_error');

        NodeAssert.strictEqual(testTypeScriptCompilation([
            "import type * as dTS from './Typings.js';",
            "const arr: dTS.IDeepReadonly<Array<{ a: string; b: number }>> = [",
            "    { a: 'hello', b: 42 },",
            "    { a: 'world', b: 99 },",
            "];",
            "arr.push({ a: 'changed', b: 0 });",
        ].join('\n')), 'syntax_error');
    });

    NodeTest.it('B-M-00066: IDeepReadonly should prevent direct top-level property assignment', () => {

        const result = testTypeScriptCompilation([
            "import type * as dTS from './Typings.js';",
            "const obj: dTS.IDeepReadonly<{ a: string }> = { a: 'hello' };",
            "obj.a = 'world';",
        ].join('\n'));

        NodeAssert.strictEqual(result, 'syntax_error');
    });
});
