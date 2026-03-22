/**
 * TypeScript example — @litert/utils-number
 *
 * Demonstrates importing from:
 *   1. The main package entry  (UnitConverter is under the `Units` namespace)
 *   2. Individual sub-path exports
 *   3. The @litert/utils bundle namespace
 *
 * TypeScript-specific: uses explicit return-type annotations to verify
 * `randomBetween` returns `number` and `UnitConverter.convert` returns `number`.
 */

// ── 1. Main entry ─────────────────────────────────────────────────────────────
// UnitConverter is re-exported under the `Units` namespace from the entry point
import { Units, randomBetween } from '@litert/utils-number';

// ── 2. Individual sub-path exports ────────────────────────────────────────────
import { UnitConverter        } from '@litert/utils-number/class/UnitConverter';
import { randomBetween as rb2 } from '@litert/utils-number/functions/RandomBetween';

// ── 3. Bundle namespace ───────────────────────────────────────────────────────
import * as NumberNS from '@litert/utils/namespaces/Number';

(async (): Promise<void> => {

    // ── randomBetween ─────────────────────────────────────────────────────────────
    console.log('\n=== randomBetween ===');

    const roll: number = randomBetween(1, 7);
    console.log('d6 roll:', roll, '(1–6)');

    console.log('min===max:', randomBetween(5, 5)); // always 5

    const sub: number = rb2(0, 100);
    console.log('sub-path [0,99]:', sub);

    const ns: number = NumberNS.randomBetween(1, 101);
    console.log('namespace [1,100]:', ns);

    // ── UnitConverter ─────────────────────────────────────────────────────────────
    console.log('\n=== UnitConverter ===');

    // Byte sizes — sub-path import, using makeUnitsByFactor helper
    const bytes = new UnitConverter({
        baseUnit: 'byte',
        units:    UnitConverter.makeUnitsByFactor(['kb', 'mb', 'gb'], 1024),
    });

    const gbInBytes: number = bytes.convert(1, 'gb', 'byte');
    console.log('1 gb in bytes:', gbInBytes);     // 1073741824

    const kbInMb: number = bytes.convert(1024, 'kb', 'mb');
    console.log('1024 kb in mb:', kbInMb);        // 1

    const mbInGb: number = bytes.convert(2048, 'mb', 'gb');
    console.log('2048 mb in gb:', mbInGb);        // 2

    // Time — using Units namespace from the main entry
    // Note: factors are ABSOLUTE (number of base-unit ms per 1 of this unit)
    const time = new Units.UnitConverter({
        baseUnit: 'ms',
        units: [
            { name: 's',   factor: 1_000       }, // 1 s   = 1 000 ms
            { name: 'min', factor: 60_000      }, // 1 min = 60 000 ms
            { name: 'h',   factor: 3_600_000   }, // 1 h   = 3 600 000 ms
        ],
    });
    console.log('1 h in ms:',          time.convert(1,         'h',  'ms'));  // 3600000
    console.log('90 s in min:',        time.convert(90,        's',  'min')); // 1.5
    console.log('3600000 ms in h:',    time.convert(3_600_000, 'ms', 'h'));   // 1

    // Distance — using @litert/utils namespace
    // Note: factors are ABSOLUTE (number of base-unit mm per 1 of this unit)
    const dist = new NumberNS.Units.UnitConverter({
        baseUnit: 'mm',
        units: [
            { name: 'cm', factor: 10        }, // 1 cm = 10 mm
            { name: 'm',  factor: 1_000     }, // 1 m  = 1 000 mm
            { name: 'km', factor: 1_000_000 }, // 1 km = 1 000 000 mm
        ],
    });
    console.log('1 km in mm (namespace):', dist.convert(1, 'km', 'mm')); // 1000000

})().catch(console.error);
