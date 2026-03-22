/**
 * TypeScript example — @litert/utils-network
 *
 * Demonstrates importing from:
 *   1. The main package entry
 *   2. Individual sub-path exports
 *   3. The @litert/utils bundle namespace
 *
 * TypeScript-specific: uses explicit return-type annotations to verify the
 * function signatures match expectations.
 */

// ── 1. Main entry ─────────────────────────────────────────────────────────────
import {
    isValidIPv4Address,
    isValidIPv6Address,
    isValidMacAddress,
    normalizeIPv6Address,
    parseIPv6Address,
    parseIPv6AddressToUInt16Array,
} from '@litert/utils-network';

// ── 2. Individual sub-path exports ────────────────────────────────────────────
import { isValidIPv4Address           as isIPv4_2      } from '@litert/utils-network/functions/IsValidIPv4Address';
import { isValidIPv6Address           as isIPv6_2      } from '@litert/utils-network/functions/IsValidIPv6Address';
import { isValidMacAddress            as isMac_2       } from '@litert/utils-network/functions/IsValidMacAddress';
import { normalizeIPv6Address         as normalize_2   } from '@litert/utils-network/functions/NormalizeIPv6Address';
import { parseIPv6Address             as parse_2,
         parseIPv6AddressToUInt16Array as parseU16_2   } from '@litert/utils-network/functions/ParseIPv6Address';

// ── 3. Bundle namespace ───────────────────────────────────────────────────────
import * as NetworkNS from '@litert/utils/namespaces/Network';

(async (): Promise<void> => {

    // ── isValidIPv4Address ────────────────────────────────────────────────────────
    console.log('\n=== isValidIPv4Address ===');

    const v4a: boolean = isValidIPv4Address('192.168.1.1');
    console.log(v4a);                                        // true
    console.log(isValidIPv4Address('256.0.0.1'));            // false
    console.log(isValidIPv4Address('::1'));                  // false
    console.log(isIPv4_2('10.0.0.1'));                       // true
    console.log(NetworkNS.isValidIPv4Address('0.0.0.0'));    // true

    // ── isValidIPv6Address ────────────────────────────────────────────────────────
    console.log('\n=== isValidIPv6Address ===');

    const v6a: boolean = isValidIPv6Address('::1');
    console.log(v6a);                                               // true
    console.log(isValidIPv6Address('2001:db8::1'));                 // true
    console.log(isValidIPv6Address('fe80::1%eth0'));                // false
    console.log(isIPv6_2('::'));                                    // true
    console.log(NetworkNS.isValidIPv6Address('not-an-ip'));         // false

    // ── isValidMacAddress ─────────────────────────────────────────────────────────
    console.log('\n=== isValidMacAddress ===');

    const macOk: boolean = isValidMacAddress('AA:BB:CC:DD:EE:FF');
    console.log(macOk);                                              // true
    console.log(isValidMacAddress('AA-BB-CC-DD-EE-FF'));             // true
    console.log(isValidMacAddress('AABBCCDDEEFF'));                  // false
    console.log(isMac_2('00:11:22:33:44:55'));                       // true
    console.log(NetworkNS.isValidMacAddress('ZZ:ZZ:ZZ:ZZ:ZZ:ZZ')); // false

    // ── normalizeIPv6Address ──────────────────────────────────────────────────────
    console.log('\n=== normalizeIPv6Address ===');

    const norm1: string = normalizeIPv6Address('::1', false);
    console.log(norm1);                                        // '0:0:0:0:0:0:0:1'
    console.log(normalizeIPv6Address('::1', true));            // '0000:0000:...'
    console.log(normalizeIPv6Address('2001:db8::1', false));   // '2001:db8:0:0:0:0:0:1'
    console.log(normalize_2('a::1', false));                   // 'a:0:0:0:0:0:0:1'
    console.log(NetworkNS.normalizeIPv6Address('::', false));   // '0:0:0:0:0:0:0:0'

    // ── parseIPv6Address ──────────────────────────────────────────────────────────
    console.log('\n=== parseIPv6Address ===');

    const segs: string[] = parseIPv6Address('::1', false);
    console.log(segs);                                           // ['0','0','0','0','0','0','0','1']
    console.log(parseIPv6Address('::1', true));                  // ['0000','0000', ...]
    console.log(parse_2('2001:db8::1', false));                  // ['2001','db8','0','0','0','0','0','1']
    console.log(parse_2('a:b::1', true));                        // ['000a','000b','0000', ...]
    console.log(NetworkNS.parseIPv6Address('::ffff', false));    // ['0','0','0','0','0','0','0','ffff']

    // ── parseIPv6AddressToUInt16Array ─────────────────────────────────────────────
    console.log('\n=== parseIPv6AddressToUInt16Array ===');

    const u16: number[] = parseIPv6AddressToUInt16Array('::1');
    console.log(u16);                                              // [0,0,0,0,0,0,0,1]
    console.log(parseIPv6AddressToUInt16Array('2001:db8::1'));     // [0x2001,0xdb8,0,0,0,0,0,1]
    console.log(parseU16_2('::ffff'));                             // [0,0,0,0,0,0,0,65535]
    console.log(NetworkNS.parseIPv6AddressToUInt16Array('::'));    // [0,0,0,0,0,0,0,0]

})().catch(console.error);
