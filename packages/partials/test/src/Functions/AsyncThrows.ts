import * as NodeAssert from 'node:assert';
import type * as dTS from '@litert/utils-ts-types';

/**
 * The function asserts that the given async callback throws an error.
 *
 * @param cb        The async callback function to be tested.
 * @param message   Optional. If provided, it can be a string or an error constructor.
 *                  If it's a string, the function checks if the thrown error's message matches it.
 *                  If it's an error constructor, the function checks if the thrown error is an instance of that constructor.
 */
export async function asyncThrows(cb: () => Promise<void>, message?: string | dTS.IConstructor<Error>): Promise<void> {

    try {

        await cb();
    }
    catch (err) {

        if (typeof message === 'function') {

            NodeAssert.ok(err instanceof message, `The error should be an instance of ${message.name}`);
        }
        else if (typeof message === 'string') {

            NodeAssert.strictEqual((err as Error).message, message);
        }
        else if (message !== undefined) {

            NodeAssert.fail('The message should be a string or an error constructor');
        }

        return;
    }

    NodeAssert.fail('An error should have been thrown.');
}
