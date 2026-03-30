/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { EventEmitter } from 'node:events';
import { Readable } from 'node:stream';
import { isClassConstructor } from './IsClassConstructor.js';

NodeTest.describe('Module Object - Function IsClassConstructor', () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    NodeTest.it('B-M-00001: Should return true for a class constructor', () => {

        NodeAssert.strictEqual(isClassConstructor(class A {}), true);
        NodeAssert.strictEqual(isClassConstructor(Map), true);
        NodeAssert.strictEqual(isClassConstructor(WeakMap), true);
        NodeAssert.strictEqual(isClassConstructor(class {}), true);
        NodeAssert.strictEqual(isClassConstructor(class extends EventEmitter {}), true);
    });

    // ─── Black-Box: Failure Flow ─────────────────────────

    NodeTest.it('B-F-00001: Should return false for a non-class constructor', () => {

        NodeAssert.strictEqual(isClassConstructor(function A() {}), false);
        NodeAssert.strictEqual(isClassConstructor(console), false);
        NodeAssert.strictEqual(isClassConstructor(console.log), false);
        NodeAssert.strictEqual(isClassConstructor(encodeURI), false);
        NodeAssert.strictEqual(isClassConstructor(async function A() {}), false);
        NodeAssert.strictEqual(isClassConstructor(() => {}), false);
        NodeAssert.strictEqual(isClassConstructor({}), false);
        NodeAssert.strictEqual(isClassConstructor(null), false);
        NodeAssert.strictEqual(isClassConstructor(0), false);
        NodeAssert.strictEqual(isClassConstructor(''), false);
        NodeAssert.strictEqual(isClassConstructor(Symbol('123')), false);
        NodeAssert.strictEqual(isClassConstructor(BigInt('123')), false);
        NodeAssert.strictEqual(isClassConstructor(undefined), false);
        NodeAssert.strictEqual(isClassConstructor(new class {}), false);
        NodeAssert.strictEqual(isClassConstructor(EventEmitter), false);
        NodeAssert.strictEqual(isClassConstructor(Readable), false);
    });

    // ─── Black-Box: Edge Cases ───────────────────────────

    NodeTest.it('B-E-00001: Should return false for a generator function', () => {

        NodeAssert.strictEqual(isClassConstructor(function* gen() {}), false);
    });

    NodeTest.it('B-E-00002: Should return false for an async generator function', () => {

        NodeAssert.strictEqual(isClassConstructor(async function* gen() {}), false);
    });

    NodeTest.it('B-E-00003: Should return false for a bound class constructor', () => {

        // bind() strips the prototype descriptor, so the non-writable prototype check fails.
        class A {}
        NodeAssert.strictEqual(isClassConstructor(A.bind(null)), false);
    });
});
