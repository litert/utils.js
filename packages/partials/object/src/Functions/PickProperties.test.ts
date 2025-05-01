import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { pickProperties } from './PickProperties';

NodeTest.describe('Function Object.pickProperties', () => {

    NodeTest.it('Should get all specific properties', () => {

        NodeAssert.deepStrictEqual(
            pickProperties({ a: 1, b: 2, c: 3 }, ['a', 'c']),
            { a: 1, c: 3 }
        );
    });

    NodeTest.it('Should get an empty object if no properties are asked for', () => {

        NodeAssert.deepStrictEqual(
            pickProperties({}, []),
            {}
        );
    });

    NodeTest.it('Should get an empty object if null is passed in', () => {

        NodeAssert.deepStrictEqual(
            pickProperties(null, []),
            {}
        );
    });

    NodeTest.it('Should get undefined if asking for non-existent properties', () => {

        NodeAssert.deepStrictEqual(
            pickProperties({ a: 1, b: 2, c: 3 }, ['d', 'e'] as any),
            { d: undefined, e: undefined }
        );
    });

    NodeTest.it('Should throw exceptions if non-object is passed in', () => {

        NodeAssert.throws(() => { pickProperties(1 as any, []); });
        NodeAssert.throws(() => { pickProperties('1' as any, []); });
        NodeAssert.throws(() => { pickProperties(true as any, []); });
        NodeAssert.throws(() => { pickProperties(undefined as any, []); });
        NodeAssert.throws(() => { pickProperties(Symbol('1') as any, []); });
        NodeAssert.throws(() => { pickProperties(BigInt(1) as any, []); });
    });
});
