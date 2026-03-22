/**
 * TypeScript example — @litert/utils-flow-control
 *
 * Demonstrates importing from:
 *   1. The main package entry
 *   2. Individual sub-path exports
 *   3. The @litert/utils bundle (flow-control is re-exported flat, no namespace)
 *
 * TypeScript-specific: uses explicit generic type parameters on `tryCatch` and
 * type-annotated return variables to exercise type inference.
 */

// ── 1. Main entry ─────────────────────────────────────────────────────────────
import { tryCatch, useValueOr } from '@litert/utils-flow-control';

// ── 2. Individual sub-path exports ────────────────────────────────────────────
import { tryCatch   as tryCatch2   } from '@litert/utils-flow-control/functions/TryCatch';
import { useValueOr as useValueOr2 } from '@litert/utils-flow-control/functions/UseValueOr';

// ── 3. Bundle flat re-export (no namespace — flow-control is flat in the bundle)
import { tryCatch as tryCatch3, useValueOr as useValueOr3 } from '@litert/utils';

// ── tryCatch ──────────────────────────────────────────────────────────────────
console.log('\n=== tryCatch ===');

// Sync — success; explicit generic constrains both branches to the same type
const r1: { ok: boolean } = tryCatch({
    try:   () => JSON.parse('{"ok":true}') as { ok: boolean },
    catch: (): { ok: boolean } => ({ ok: false }),
});
console.log('parse ok:', r1); // { ok: true }

// Sync — throws, catch returns fallback
const r2: null = tryCatch({
    try:   () => JSON.parse('not json') as null,
    catch: (): null => null,
});
console.log('parse fail fallback:', r2); // null

// Sync with finally
const r3 = tryCatch({
    try:     (): number => 42,
    catch:   (): number => -1,
    finally: (): void => { console.log('finally ran'); },
});
console.log('with finally:', r3); // 42

// Async — try succeeds
const r4: string = await tryCatch2({
    try:   async (): Promise<string> => 'async ok',
    catch: async (): Promise<string> => 'async fail',
});
console.log('async tryCatch:', r4); // 'async ok'

// Async — try throws
const r5: string = await tryCatch3({
    try:   async (): Promise<never> => { throw new Error('boom'); },
    catch: (e: unknown): string => `caught: ${(e as Error).message}`,
});
console.log('async catch:', r5); // 'caught: boom'

// ── useValueOr ────────────────────────────────────────────────────────────────
console.log('\n=== useValueOr ===');

const port: number = useValueOr(8080, (v: number) => v > 0 && v < 65536, 3000);
console.log('valid port:', port); // 8080

const badPort: number = useValueOr(-1, (v: number) => v > 0 && v < 65536, 3000);
console.log('fallback port:', badPort); // 3000

console.log(useValueOr2('hello', (s: string) => s.length > 0, 'default')); // 'hello'
console.log(useValueOr3('', (s: string) => s.length > 0, 'default'));      // 'default'
