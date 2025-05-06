import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { isSubclassOf } from './IsSubclassOf';

NodeTest.describe('Function Object.isSubclassOf', () => {

    NodeTest.it('Should return true between parent class and direct subclass', () => {

        class A {}
        class B extends A {}

        NodeAssert.strictEqual(isSubclassOf(B, A), true);
    });

    NodeTest.it('Should return true between parent class and indirect subclass', () => {

        class A {}
        class B extends A {}
        class C extends B {}

        NodeAssert.strictEqual(isSubclassOf(C, A), true);
        NodeAssert.strictEqual(isSubclassOf(C, B), true);
    });

    NodeTest.it('Should return false between 2 non-relative classes', () => {

        class A {}
        class B {}

        NodeAssert.strictEqual(isSubclassOf(A, B), false);
        NodeAssert.strictEqual(isSubclassOf(B, A), false);
    });

});
