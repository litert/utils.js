import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { getConstructor } from './GetConstructor';

NodeTest.describe('Function Object.getConstructor', () => {

    NodeTest.it('Should return the constructor of a object created from a class', () => {

        class A {}
        class B {}

        const a = new A();

        NodeAssert.strictEqual(getConstructor(a), A);
        NodeAssert.strictEqual(getConstructor(a) === B, false);
    });

    NodeTest.it('Should correctly return the constructor even with a property named "constructor"', () => {

        class A {}

        const a = new A();

        Object.assign(a, {
            constructor: 123,
        });

        NodeAssert.strictEqual(getConstructor(a), A);
    });

    NodeTest.it('Should return Object of a object created literally', () => {

        NodeAssert.strictEqual(getConstructor({ a: 'string' }), Object);
    });

    NodeTest.it('Should return Array of an array object', () => {

        NodeAssert.strictEqual(getConstructor([]), Array);
        NodeAssert.strictEqual(getConstructor([1, 2, 3]), Array);
        NodeAssert.strictEqual(getConstructor(new Array(1, 2, 3)), Array);
        NodeAssert.strictEqual(getConstructor(new Array()), Array);
        NodeAssert.strictEqual(getConstructor(new Array(1)), Array);
        NodeAssert.strictEqual(getConstructor(new Array(1, 2)), Array);
    });

    NodeTest.it('Should throw exceptions if non-object is passed in', () => {

        NodeAssert.throws(() => { getConstructor(1); });
        NodeAssert.throws(() => { getConstructor(true); });
        NodeAssert.throws(() => { getConstructor(null); });
        NodeAssert.throws(() => { getConstructor(undefined); });
        NodeAssert.throws(() => { getConstructor('string'); });
        NodeAssert.throws(() => { getConstructor(Symbol('symbol')); });
        NodeAssert.throws(() => { getConstructor(BigInt(1)); });
    });
});
