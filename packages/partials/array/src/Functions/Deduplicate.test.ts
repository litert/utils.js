import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { deduplicate } from './Deduplicate';

NodeTest.describe('Function Deduplicate', () => {

    NodeTest.describe('Basic Types (Default Comparison)', () => {

        NodeTest.it('should deduplicate an array of numbers', () => {

            const input = [1, 2, 3, 2, 1, 4];
            const expected = [1, 2, 3, 4];

            const result = deduplicate(input);

            NodeAssert.deepStrictEqual(result, expected);
        });

        NodeTest.it('should deduplicate an array of strings', () => {

            const input = ['a', 'b', 'c', 'b', 'a', 'd'];
            const expected = ['a', 'b', 'c', 'd'];

            const result = deduplicate(input);

            NodeAssert.deepStrictEqual(result, expected);
        });

        NodeTest.it('should deduplicate an array of mixed basic types', () => {

            const input = [1, 'a', true, 1, 'a', false, null, undefined, null];
            const expected = [1, 'a', true, false, null, undefined];

            const result = deduplicate(input);

            NodeAssert.deepStrictEqual(result, expected);
        });

        NodeTest.it('should handle an empty array', () => {

            const input: number[] = [];
            const expected: number[] = [];

            const result = deduplicate(input);

            NodeAssert.deepStrictEqual(result, expected);
        });

        NodeTest.it('should handle an array with a single element', () => {

            const input = [1];
            const expected = [1];

            const result = deduplicate(input);

            NodeAssert.deepStrictEqual(result, expected);
        });

        NodeTest.it('should handle an array where all elements are duplicates', () => {

            const input = [1, 1, 1, 1];
            const expected = [1];

            const result = deduplicate(input);

            NodeAssert.deepStrictEqual(result, expected);
        });
    });

    NodeTest.describe('Complex Types (Reference Comparison)', () => {

        NodeTest.it('should deduplicate objects by reference by default', () => {

            const obj1 = { id: 1 };
            const obj2 = { id: 2 };
            const input = [obj1, obj2, obj1, obj2];
            const expected = [obj1, obj2];

            // Explicitly passing null to match the overload for complex types if needed,
            // or relying on default behavior if type inference works.
            // The signature for complex types requires makeKey to be null or a function if we want to call it specifically,
            // but the implementation handles optional makeKey.
            // However, looking at the overload:
            // <T extends IAdvancedType>(items: readonly T[], makeKey: null | ((v: T) => any)): T[];
            // If I call deduplicate([obj]) without 2nd arg, it might match the first overload if T is not constrained enough
            // or fail compilation if T extends IAdvancedType is strictly enforced and different from IBasicType.
            // IBasicType usually excludes object.
            // Let's pass null to be safe and explicit as per the doc comment example.

            const result = deduplicate(input, null);

            NodeAssert.deepStrictEqual(result, expected);
        });

        NodeTest.it('should not deduplicate distinct objects with same content by default', () => {

            const input = [{ id: 1 }, { id: 1 }];
            // Since they are different references, they should both be kept.
            const result = deduplicate(input, null);

            NodeAssert.strictEqual(result.length, 2);
            NodeAssert.deepStrictEqual(result, input);
        });
    });

    NodeTest.describe('Complex Types (Custom Key Comparison)', () => {

        NodeTest.it('should deduplicate objects using a key generation function', () => {

            const input = [
                { id: 1, val: 'a' },
                { id: 2, val: 'b' },
                { id: 1, val: 'c' }, // Duplicate id
                { id: 3, val: 'd' }
            ];

            const expected = [
                { id: 1, val: 'a' },
                { id: 2, val: 'b' },
                { id: 3, val: 'd' }
            ];

            const result = deduplicate(input, (item) => item.id);

            NodeAssert.deepStrictEqual(result, expected);
        });

        NodeTest.it('should deduplicate objects using a composite key', () => {

            const input = [
                { x: 1, y: 1 },
                { x: 1, y: 2 },
                { x: 1, y: 1 }, // Duplicate
                { x: 2, y: 1 }
            ];

            const expected = [
                { x: 1, y: 1 },
                { x: 1, y: 2 },
                { x: 2, y: 1 }
            ];

            const result = deduplicate(input, (item) => `${item.x},${item.y}`);

            NodeAssert.deepStrictEqual(result, expected);
        });
    });

    NodeTest.describe('Edge Cases', () => {

        NodeTest.it('should handle makeKey returning undefined', () => {
            // If makeKey returns undefined, all items map to undefined key.
            // Only the first one should be kept.
            const input = [1, 2, 3];
            const result = deduplicate(input, () => undefined);

            NodeAssert.deepStrictEqual(result, [1]);
        });

        NodeTest.it('should handle makeKey returning objects (Map supports object keys)', () => {

            const keyObj = { k: 'key' };
            const input = ['a', 'b', 'c'];
            // If all map to same object ref
            const result = deduplicate(input, () => keyObj);

            NodeAssert.deepStrictEqual(result, ['a']);
        });

        NodeTest.it('should handle makeKey returning distinct objects', () => {

            const input = ['a', 'a', 'b'];
            // Key is new object each time -> distinct keys
            const result = deduplicate(input, (i) => ({ val: i }));

            // Map keys are compared by reference. {val:'a'} !== {val:'a'}.
            // So duplicates in input won't be detected if key function returns new objects.
            // But wait, for 'a', 'a', if I return NEW object each time, they are distinct.
            // So output should be ['a', 'a', 'b'].

            NodeAssert.deepStrictEqual(result.length, 3);
            NodeAssert.deepStrictEqual(result, input);
        });
        
        NodeTest.it('should handle makeKey returning objects with correct reference reuse', () => {
             const keyA = { k: 'a' };
             const keyB = { k: 'b' };
             
             const input = [
                 { id: 1, ref: keyA },
                 { id: 2, ref: keyB },
                 { id: 3, ref: keyA } // Duplicate keyA
             ];
             
             const result = deduplicate(input, i => i.ref);
             
             // Should keep first of keyA and first of keyB
             NodeAssert.deepStrictEqual(result, [input[0], input[1]]);
        });
    });
});

