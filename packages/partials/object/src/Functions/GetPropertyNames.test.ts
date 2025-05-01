import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { getPropertyNames } from './GetPropertyNames';

NodeTest.describe('Function Object.getPropertyNames', () => {

    NodeTest.it('Should get all string-named properties', () => {

        const obj = {
            a: 1,
            b: 2,
            c: 3
        };

        NodeAssert.deepStrictEqual(
            getPropertyNames(obj),
            ['a', 'b', 'c']
        );
    });

    NodeTest.it('Should get all symbol-named properties', () => {

        const s1 = Symbol('a');
        const s2 = Symbol('b');
        const s3 = Symbol('c');
        const obj = {
            [s1]: 1,
            [s2]: 2,
            [s3]: 3
        };

        NodeAssert.deepStrictEqual(
            getPropertyNames(obj),
            [s1, s2, s3]
        );
    });

    NodeTest.it('Should get all string-named and symbol-named properties', () => {

        const s1 = Symbol('a');
        const s2 = Symbol('b');
        const s3 = Symbol('c');
        const obj = {
            a: 1,
            b: 2,
            c: 3,
            [s1]: 4,
            [s2]: 5,
            [s3]: 6
        };

        NodeAssert.deepStrictEqual(
            getPropertyNames(obj),
            ['a', 'b', 'c', s1, s2, s3]
        );
    });
});
