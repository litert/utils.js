/**
 * TypeScript example — @litert/utils-array
 *
 * Demonstrates importing from:
 *   1. The main package entry
 *   2. Individual sub-path exports
 *   3. The @litert/utils bundle namespace
 *
 * TypeScript-specific: exercises the generic type parameters of `toDict` and
 * uses `IDict` from `@litert/utils-ts-types` to verify cross-package type resolution.
 */

// ── 1. Main entry ─────────────────────────────────────────────────────────────
import { deduplicate, toChunks, toDict } from '@litert/utils-array';

// ── 2. Individual sub-path exports ────────────────────────────────────────────
import { deduplicate as dedup2 }   from '@litert/utils-array/functions/Deduplicate';
import { toChunks   as toChunks2 } from '@litert/utils-array/functions/ToChunks';
import { toDict     as toDict2   } from '@litert/utils-array/functions/ToDict';

// ── 3. Bundle namespace ───────────────────────────────────────────────────────
import * as ArrayNS from '@litert/utils/namespaces/Array';

// ── Type-only imports (verifies type exports are resolvable) ──────────────────
import type { IDict } from '@litert/utils-ts-types';
import type { IDeduplicateFn } from '@litert/utils-array';

(async (): Promise<void> => {

    // ── Local interfaces used to exercise generics ────────────────────────────────
    interface IUser {
        id:   number;
        name: string;
    }

    // ── deduplicate ───────────────────────────────────────────────────────────────
    console.log('\n=== deduplicate ===');

    const nums: number[] = deduplicate([1, 2, 2, 3, 3, 3]);
    console.log(nums); // [1, 2, 3]

    const users: IUser[] = deduplicate(
        [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }, { id: 1, name: 'ALICE' }],
        v => v.id,
    );
    console.log(users); // [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]

    console.log(dedup2(['a', 'b', 'a', 'c']));        // ['a', 'b', 'c']
    console.log(ArrayNS.deduplicate([true, false, true])); // [true, false]

    // IDeduplicateFn is the type of the deduplicate overloaded function
    const dedupFn: IDeduplicateFn = deduplicate;
    console.log(dedupFn([4, 5, 4, 6, 5])); // [4, 5, 6]

    // ── toChunks ──────────────────────────────────────────────────────────────────
    console.log('\n=== toChunks ===');

    const chunks: number[][] = toChunks([1, 2, 3, 4, 5], 2);
    console.log(chunks); // [[1, 2], [3, 4], [5]]

    console.log(toChunks2(['a', 'b', 'c', 'd'], 3));           // [['a', 'b', 'c'], ['d']]
    console.log(ArrayNS.toChunks([10, 20, 30, 40, 50, 60], 2)); // [[10,20],[30,40],[50,60]]

    // ── toDict ────────────────────────────────────────────────────────────────────
    console.log('\n=== toDict ===');

    const someUsers: IUser[] = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Carol' },
    ];

    // Explicit generic + IDict type annotation exercises type checking end-to-end
    const byId: IDict<IUser> = toDict<IUser>(someUsers, 'id');
    console.log(byId); // { '1': { id: 1, ... }, '2': { ... }, '3': { ... } }

    const byName: IDict<IUser> = toDict2<IUser>(someUsers, v => v.name);
    console.log(byName); // { Alice: { ... }, Bob: { ... }, Carol: { ... } }

    const byIdNS: IDict<IUser> = ArrayNS.toDict<IUser>(someUsers, u => u.id);
    console.log(byIdNS);

})().catch(console.error);
