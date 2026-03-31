/**
 * TypeScript example — @litert/utils-object
 *
 * Demonstrates importing from:
 *   1. The main package entry
 *   2. Individual sub-path exports
 *   3. The @litert/utils bundle namespace
 *
 * Note: `pickProperties` is sub-path only — not in the main entry or bundle namespace.
 *
 * TypeScript-specific: uses `IDeepMergeOptions` type annotation, exercises
 * `deepMerge`'s generic return type, and demonstrates `Pick<>` narrows from `pickProperties`.
 */

// ── 1. Main entry ─────────────────────────────────────────────────────────────
import {
    copyProperties,
    deepMerge,
    getConstructor,
    getPropertyNames,
    hasProperties,
    isSubclassOf,
    isClassConstructor,
    PropertyPathParser,
} from '@litert/utils-object';

// pickProperties is only available via sub-path
import { pickProperties } from '@litert/utils-object/functions/PickProperties';

// ── 2. Individual sub-path exports ────────────────────────────────────────────
import { copyProperties     as cp2   } from '@litert/utils-object/functions/CopyProperties';
import { deepMerge          as dm2   } from '@litert/utils-object/functions/DeepMerge';
import { getConstructor     as gc2   } from '@litert/utils-object/functions/GetConstructor';
import { getPropertyNames   as gpn2  } from '@litert/utils-object/functions/GetPropertyNames';
import { hasProperties      as hp2   } from '@litert/utils-object/functions/HasProperties';
import { isSubclassOf       as isco2 } from '@litert/utils-object/functions/IsSubclassOf';
import { pickProperties     as pp2   } from '@litert/utils-object/functions/PickProperties';
import { isClassConstructor as icc2  } from '@litert/utils-object/functions/IsClassConstructor';
import { PropertyPathParser as PPP2  } from '@litert/utils-object/class/PropertyPathParser';
import { getPropertyByPath as epbp2 } from '@litert/utils-object/functions/GetPropertyByPath';

// ── 3. Bundle namespace ───────────────────────────────────────────────────────
import * as ObjectNS from '@litert/utils/namespaces/Object';

// ── Type-only imports ─────────────────────────────────────────────────────────
import type {
    IDeepMergeOptions,
    IMergeObject,
    IMergeArray,
    IGetPropertyByPathOptions,
} from '@litert/utils-object';

(async (): Promise<void> => {

    // ── copyProperties ────────────────────────────────────────────────────────────
    console.log('\n=== copyProperties ===');

    interface IPoint3D { x: number; y: number; z: number; }

    const dst: IPoint3D = { x: 0, y: 0, z: 0 };
    copyProperties(dst, { x: 10, y: 20 }, ['x', 'y']);
    console.log(dst); // { x: 10, y: 20, z: 0 }

    cp2(dst, { z: 99 }, ['z']);
    console.log(dst); // { x: 10, y: 20, z: 99 }

    const obj2 = { a: 1, b: 2 };
    ObjectNS.copyProperties(obj2, { a: 100 }, ['a']);
    console.log(obj2); // { a: 100, b: 2 }

    // ── deepMerge ─────────────────────────────────────────────────────────────────
    console.log('\n=== deepMerge ===');

    const base    = { a: 1, b: { c: 2, d: 3 }, e: [1, 2] };
    const overlay = { b: { c: 99 }, e: [3, 4, 5], f: 'new' };
    console.log(deepMerge(base, overlay));
    // { a: 1, b: { c: 99, d: 3 }, e: [3, 4, 5], f: 'new' }

    // Use the imported IDeepMergeOptions type annotation
    const mergeOpts: IDeepMergeOptions = { arrayAsValue: true };
    console.log(dm2({ x: [1, 2] }, { x: [3] }, mergeOpts)); // { x: [3] }

    console.log(ObjectNS.deepMerge({ n: 1 }, { n: 2, m: 3 })); // { n: 2, m: 3 }

    // ── getConstructor ────────────────────────────────────────────────────────────
    console.log('\n=== getConstructor ===');

    class Dog   { bark(): void {} }
    class Poodle extends Dog {}

    console.log(getConstructor(new Poodle()) === Poodle); // true
    console.log(gc2(new Map()) === Map);                  // true
    console.log((ObjectNS.getConstructor([]) as unknown) === Array);   // true

    // ── getPropertyNames ──────────────────────────────────────────────────────────
    console.log('\n=== getPropertyNames ===');

    const sym = Symbol('secret');
    const obj3 = { name: 'Alice', age: 30, [sym]: 'hidden' };

    const names: (string | symbol)[] = getPropertyNames(obj3);
    console.log(names);                           // ['name', 'age', sym]
    console.log(gpn2({ one: 1 }));               // ['one']
    console.log(ObjectNS.getPropertyNames(obj3)); // ['name', 'age', sym]

    // ── hasProperties ─────────────────────────────────────────────────────────────
    console.log('\n=== hasProperties ===');

    const config = { host: 'localhost', port: 3000, debug: false };

    const hasBoth: boolean = hasProperties(config, ['host', 'port']);
    console.log(hasBoth);                                    // true
    console.log(hasProperties(config as Record<string, unknown>, ['host', 'missing'])); // false
    console.log(hp2(config, ['debug']));                     // true
    console.log(ObjectNS.hasProperties({} as Record<string, unknown>, ['anything']));   // false

    // ── isSubclassOf ──────────────────────────────────────────────────────────────
    console.log('\n=== isSubclassOf ===');

    class Animal {}
    class Cat    extends Animal {}
    class Kitten extends Cat {}

    const result: boolean = isSubclassOf(Cat, Animal);
    console.log(result);                           // true
    console.log(isSubclassOf(Kitten, Animal));     // true
    console.log(isSubclassOf(Animal, Cat));        // false
    console.log(isco2(Kitten, Cat));               // true
    console.log(ObjectNS.isSubclassOf(Cat, Cat));  // false

    // ── pickProperties ────────────────────────────────────────────────────────────
    // pickProperties is sub-path only — NOT in the main entry or bundle namespace
    console.log('\n=== pickProperties ===');

    interface IUserRecord { id: number; name: string; email: string; role: string; }

    const user: IUserRecord = { id: 1, name: 'Alice', email: 'alice@example.com', role: 'admin' };

    // TypeScript narrows the return type to Pick<IUserRecord, 'id' | 'name'>
    const partial = pickProperties(user, ['id', 'name'] as const);
    console.log(partial); // { id: 1, name: 'Alice' }

    console.log(pp2(user, ['email', 'role'] as const)); // { email: '...', role: 'admin' }

    // ── isClassConstructor ─────────────────────────────────────────────────────────
    console.log('\n=== isClassConstructor ===');

    console.log(isClassConstructor(Dog));           // true
    console.log(isClassConstructor(function() {})); // false
    console.log(icc2(class {}));                   // true
    console.log(ObjectNS.isClassConstructor(() => {})); // false

    // ── deepMerge types (IMergeObject / IMergeArray) ──────────────────────────────
    console.log('\n=== IMergeObject / IMergeArray types ===');

    // IMergeObject<T1, T2> is the inferred return type of deepMerge
    const baseObj  = { a: 1, b: { c: 2 } };
    const overObj  = { b: { d: 3 }, e: 'x' };
    const merged: IMergeObject<typeof baseObj, typeof overObj> = deepMerge(baseObj, overObj);
    console.log('merged.a:', merged.a);           // 1
    console.log('merged.b.d:', merged.b.d);       // 3
    console.log('merged.e:', merged.e);            // 'x'

    // IMergeArray<T1, T2> is the inferred element type for merged arrays
    type TMergedArr = IMergeArray<{ x: number }[], { y: string }[]>;
    const arrEl: TMergedArr[number] = { x: 1, y: 'hi' };
    console.log('IMergeArray element:', arrEl);

    // ── PropertyPathParser ────────────────────────────────────────────────────────
    console.log('\n=== PropertyPathParser ===');

    const parser = new PropertyPathParser();
    console.log(parser.parse('$'));              // []
    console.log(parser.parse('$.a.b.c'));        // ['a', 'b', 'c']
    console.log(parser.parse('$.a[0].b'));       // ['a', 0, 'b']
    console.log(parser.parse('$.a["x.y"]'));     // ['a', 'x.y']

    const parser2 = new PPP2();
    console.log(parser2.parse('$.items[1]'));    // ['items', 1]

    console.log(new ObjectNS.PropertyPathParser().parse('$.foo')); // ['foo']

    // ── getPropertyByPath ─────────────────────────────────────────────────────
    // getPropertyByPath is sub-path only — NOT in the main entry or bundle namespace
    console.log('\n=== getPropertyByPath ===');

    const deep = { a: { b: [{ c: 42 }, { c: 99 }] } };

    // IGetPropertyByPathOptions exercises the exported options type
    const epOpts: IGetPropertyByPathOptions = { defaultValue: 'missing' };

    console.log(epbp2(deep, '$'));               // the deep object itself
    console.log(epbp2(deep, '$.a.b[0].c'));     // 42
    console.log(epbp2(deep, '$.a.b[1].c'));     // 99
    console.log(epbp2(deep, '$.a.b[2].c', epOpts));    // 'missing'
    console.log(epbp2(deep, '$.a.b[0].z', epOpts));    // 'missing'

    // Also accepts a pre-parsed path array (result of PropertyPathParser.parse)
    const parsed = parser.parse('$.a.b[0].c');
    console.log(epbp2(deep, parsed));           // 42

})().catch(console.error);
