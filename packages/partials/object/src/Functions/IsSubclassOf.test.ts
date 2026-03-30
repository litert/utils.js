/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { isSubclassOf } from './IsSubclassOf.js';

NodeTest.describe('Module Object - Function IsSubclassOf', () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    NodeTest.it('B-M-00001: Should return true between parent class and direct subclass', () => {

        class A {}
        class B extends A {}

        NodeAssert.strictEqual(isSubclassOf(B, A), true);
    });

    NodeTest.it('B-M-00002: Should return true between parent class and indirect subclass', () => {

        class A {}
        class B extends A {}
        class C extends B {}

        NodeAssert.strictEqual(isSubclassOf(C, A), true);
        NodeAssert.strictEqual(isSubclassOf(C, B), true);
    });

    // ─── Black-Box: Failure Flow ─────────────────────────

    NodeTest.it('B-F-00001: Should return false between 2 non-relative classes', () => {

        class A {}
        class B {}

        NodeAssert.strictEqual(isSubclassOf(A, B), false);
        NodeAssert.strictEqual(isSubclassOf(B, A), false);
    });

    // ─── Black-Box: Edge Cases ───────────────────────────

    NodeTest.it('B-E-00001: Should return false when the class is compared with itself', () => {

        class A {}
        NodeAssert.strictEqual(isSubclassOf(A, A), false);
    });

    NodeTest.it('B-E-00002: Should return true when a class extends a native class', () => {

        class MyMap extends Map {}
        NodeAssert.strictEqual(isSubclassOf(MyMap, Map), true);
    });

});
