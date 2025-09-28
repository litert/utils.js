import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import * as NodeTimer from 'node:timers/promises';
import { asyncThrows } from './AsyncThrows';

NodeTest.describe('Function asyncThrows', async () => {

    NodeTest.it('should throw errors if option values are invalid', async () => {

        await asyncThrows(async () => {

            await NodeTimer.setTimeout(10);
            throw new Error('Test error');
        });

        await asyncThrows(async () => {

            await NodeTimer.setTimeout(10);
            throw new TypeError('Test type error');
        }, TypeError);

        try {
            await asyncThrows(async () => {

                await NodeTimer.setTimeout(10);
                throw new Error('Test error');
            }, '123');

            NodeAssert.fail('The function should throw correctly');
        }
        catch {

            NodeAssert.ok(true);
        }

        try {
            await asyncThrows(async () => {

                await NodeTimer.setTimeout(10);
                throw new Error('Test error');
            }, TypeError);

            NodeAssert.fail('The function should throw correctly');
        }
        catch {

            NodeAssert.ok(true);
        }

        try {
            await asyncThrows(async () => {

                await NodeTimer.setTimeout(10);
                throw new Error('Test error');
            }, 123 as unknown as string);

            NodeAssert.fail('The function should throw correctly');
        }
        catch {

            NodeAssert.ok(true);
        }

        try {
            await asyncThrows(async () => {

                await NodeTimer.setTimeout(10);
            }, '123');

            NodeAssert.fail('The function should throw correctly');
        }
        catch {

            NodeAssert.ok(true);
        }
    });
});
