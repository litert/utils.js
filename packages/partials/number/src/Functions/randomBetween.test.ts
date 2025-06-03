import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { randomBetween } from './RandomBetween';

NodeTest.describe('Function Number.randomBetween', () => {

    NodeTest.it('Should throw exception if the min is greater than max', () => {

        try {

            randomBetween(10, 5);
        }
        catch (e) {

            NodeAssert.ok(e instanceof RangeError);
            NodeAssert.strictEqual(e.message, 'The minimum value can not be greater than maximum value.');
        }
    });

    NodeTest.it('Should never get value smaller than the min', () => {

        for (let i = 0; i < 1000000; i++) {

            const MIN_VALUE = 10;
            const MAX_BOUND = 20;
            const value = randomBetween(MIN_VALUE, MAX_BOUND);

            NodeAssert.equal(value < MIN_VALUE, false, `Value ${value} could not be smaller than ${MIN_VALUE}.`);
            NodeAssert.equal(value >= MAX_BOUND, false, `Value ${value} could not be larger than or equal to ${MAX_BOUND}.`);
        }
    });
});
