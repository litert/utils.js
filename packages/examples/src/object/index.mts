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
} from '@litert/utils-object';

// pickProperties is only available via sub-path
import { pickProperties } from '@litert/utils-object/functions/PickProperties';

// ── 2. Individual sub-path exports ────────────────────────────────────────────
import { copyProperties    as cp2   } from '@litert/utils-object/functions/CopyProperties';
import { deepMerge         as dm2   } from '@litert/utils-object/functions/DeepMerge';
import { getConstructor    as gc2   } from '@litert/utils-object/functions/GetConstructor';
import { getPropertyNames  as gpn2  } from '@litert/utils-object/functions/GetPropertyNames';
import { hasProperties     as hp2   } from '@litert/utils-object/functions/HasProperties';
import { isSubclassOf      as isco2 } from '@litert/utils-object/functions/IsSubclassOf';
import { pickProperties    as pp2   } from '@litert/utils-object/functions/PickProperties';

// ── 3. Bundle namespace ───────────────────────────────────────────────────────
import * as ObjectNS from '@litert/utils/namespaces/Object';

// ── Type-only imports ─────────────────────────────────────────────────────────
import type { IDeepMergeOptions } from '@litert/utils-object';

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
