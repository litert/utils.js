/**
 * TypeScript example — @litert/utils-string
 *
 * Demonstrates importing from:
 *   1. The main package entry
 *   2. Individual sub-path exports
 *   3. The @litert/utils bundle namespace
 *
 * TypeScript-specific: uses `IUnitParserOptions` and `IUnitInfo` type annotations,
 * the `ERandomStringCharset` enum value, and explicit return-type annotations.
 */

// ── 1. Main entry ─────────────────────────────────────────────────────────────
import {
    UnitParser,
    htmlEscape,
    includeEvilWhitespaceChars,
    replaceEvilWhitespaceChars,
    isEmailAddress,
    splitIntoLines,
    toUnixString,
    toWindowsString,
    toMacString,
    isUpperSnakeCase,
    isLowerSnakeCase,
    isLowerCamelCase,
    isUpperCamelCase,
    isPascalCase,
    random,
    ERandomStringCharset,
    DEFAULT_RANDOM_CHARSET,
    regexpEscape,
    toChunks,
    toChunksBackward,
} from '@litert/utils-string';

// ── 2. Individual sub-path exports ────────────────────────────────────────────
import { UnitParser          as UnitParser2 } from '@litert/utils-string/class/UnitParser';
import { htmlEscape          as htmlEscape2 } from '@litert/utils-string/functions/Html';
import { includeEvilWhitespaceChars as iew2,
         replaceEvilWhitespaceChars as rew2 } from '@litert/utils-string/functions/EvilWhitespace';
import { isEmailAddress      as isEmail2   } from '@litert/utils-string/functions/IsEmailAddress';
import { splitIntoLines      as sil2,
         toUnixString        as unix2       } from '@litert/utils-string/functions/Lines';
import { isUpperSnakeCase    as iusc2,
         isLowerCamelCase    as ilcc2       } from '@litert/utils-string/functions/NameCase';
import { random              as random2,
         ERandomStringCharset as ERC2       } from '@litert/utils-string/functions/Random';
import { regexpEscape        as re2         } from '@litert/utils-string/functions/RegexpEscape';
import { toChunks            as tc2,
         toChunksBackward    as tcb2        } from '@litert/utils-string/functions/ToChunks';

// ── 3. Bundle namespace ───────────────────────────────────────────────────────
import * as StringNS from '@litert/utils/namespaces/String';

// ── Type-only imports (verifies interface exports are resolvable) ──────────────
import type { IUnitParserOptions, IUnitInfo } from '@litert/utils-string';

(async (): Promise<void> => {

    // ── UnitParser ────────────────────────────────────────────────────────────────
    console.log('\n=== UnitParser ===');

    // IUnitParserOptions and IUnitInfo exercise the exported interface types
    const units: Array<string | IUnitInfo> = ['B', { name: 'KB', aliases: ['kb'] }, 'MB', 'GB'];
    const parserOpts: IUnitParserOptions   = { format: '{value}{unit}', units };

    const sizeParser = new UnitParser(parserOpts);
    console.log(sizeParser.parse('512MB'));  // { value: '512', unit: 'MB' }
    console.log(sizeParser.parse('3kb'));    // { value: '3', unit: 'KB' }
    console.log(sizeParser.parse('1.5gb')); // { value: '1.5', unit: 'GB' } (caseInsensitive defaults to true)

    const sp2 = new UnitParser2({
        format: '{value} {unit}',
        units:  ['px', 'em', 'rem', '%'],
        caseInsensitive: false,
    });
    console.log(sp2.parse('12 px')); // { value: '12', unit: 'px' }
    console.log(sp2.parse('12 PX')); // null (case-sensitive)

    const spNS = new StringNS.UnitParser({ format: '{value}{unit}', units: ['kg', 'g', 'mg'] });
    console.log(spNS.parse('250g')); // { value: '250', unit: 'g' }

    // ── htmlEscape ────────────────────────────────────────────────────────────────
    console.log('\n=== htmlEscape ===');

    const escaped: string = htmlEscape('<script>alert("xss")</script>');
    console.log(escaped); // &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;

    console.log(htmlEscape2("it's a & problem")); // it&#39;s a &amp; problem
    console.log(StringNS.htmlEscape('3 > 2 && 1 < 2')); // 3 &gt; 2 &amp;&amp; 1 &lt; 2

    // ── EvilWhitespace ────────────────────────────────────────────────────────────
    console.log('\n=== EvilWhitespace ===');

    const evilStr = 'Hello\u200BWorld'; // zero-width space

    const hasEvil: boolean = includeEvilWhitespaceChars(evilStr);
    console.log('has evil:', hasEvil); // true
    console.log('replaced:', replaceEvilWhitespaceChars(evilStr, '[?]')); // 'Hello[?]World'
    console.log('sub-path check:', iew2(evilStr));   // true
    console.log('sub-path replace:', rew2(evilStr)); // 'HelloWorld'
    console.log('namespace check:', StringNS.includeEvilWhitespaceChars(evilStr));

    // ── isEmailAddress ────────────────────────────────────────────────────────────
    console.log('\n=== isEmailAddress ===');

    const validEmail: boolean = isEmailAddress('user@example.com');
    console.log(validEmail);                      // true
    console.log(isEmailAddress('bad-email'));      // false
    console.log(isEmail2('a@b.c'));               // false (TLD must be ≥2 chars or similar rule)
    console.log(StringNS.isEmailAddress('x@y'));  // false

    // ── lines ─────────────────────────────────────────────────────────────────────
    console.log('\n=== lines ===');

    const mixed = 'line1\r\nline2\nline3\rline4';

    const lines: string[] = splitIntoLines(mixed);
    console.log(lines); // ['line1', 'line2', 'line3', 'line4']

    const toUnix: string    = toUnixString(mixed);
    const toWindows: string = toWindowsString(mixed);
    const toMac: string     = toMacString(mixed);
    // Verify each conversion: no \r\n in unix, no bare \n in windows, no \r\n in mac
    console.log('unix has no \\r\\n:', !toUnix.includes('\r\n'));      // true
    console.log('windows has \\r\\n:', toWindows.includes('\r\n'));   // true
    console.log('mac has no \\n:', !toMac.includes('\n'));              // true

    console.log(sil2('a\r\nb')); // ['a', 'b']
    console.log(unix2('a\r\nb')); // 'a\nb'
    console.log(StringNS.splitIntoLines('x\ny')); // ['x', 'y']

    // ── name case ─────────────────────────────────────────────────────────────────
    console.log('\n=== name case ===');

    const usc: boolean = isUpperSnakeCase('FOO_BAR');
    const lsc: boolean = isLowerSnakeCase('foo_bar');
    const lcc: boolean = isLowerCamelCase('fooBar');
    const ucc: boolean = isUpperCamelCase('FOO_BAR');
    const pc:  boolean = isPascalCase('FooBar');
    console.log('USc:', usc, '| LSc:', lsc, '| LCc:', lcc, '| UCc:', ucc, '| PCc:', pc);
    // true true true false true

    console.log(iusc2('UPPER_SNAKE'));            // true
    console.log(ilcc2('lowerCamel'));             // true
    console.log(StringNS.isUpperSnakeCase('ok')); // false

    // ── random ────────────────────────────────────────────────────────────────────
    console.log('\n=== random ===');

    // ERandomStringCharset enum values are usable as runtime values
    const s1: string = random(8);
    const s2: string = random(6, ERandomStringCharset.UPPER_HEX_DIGIT);
    const s3: string = random(4, DEFAULT_RANDOM_CHARSET);
    console.log('random(8).length === 8:', s1.length === 8);           // true
    console.log('hex(6) matches /^[0-9A-F]{6}$/:', /^[0-9A-F]{6}$/.test(s2)); // true
    console.log('default charset(4).length === 4:', s3.length === 4); // true

    console.log(random2(8, ERC2.LOWER_ALPHA).length === 8); // true
    console.log(StringNS.random(5).length === 5);            // true

    // ── regexpEscape ──────────────────────────────────────────────────────────────
    console.log('\n=== regexpEscape ===');

    const pattern: string = regexpEscape('foo.bar[baz]');
    console.log(new RegExp(pattern).test('foo.bar[baz]')); // true
    console.log(re2('(x|y)').length > 0);                  // true
    console.log(StringNS.regexpEscape('a+b').length > 0);  // true

    // ── toChunks ──────────────────────────────────────────────────────────────────
    console.log('\n=== toChunks (string) ===');

    const strChunks: string[]  = toChunks('Hello, World!', 3);
    const backChunks: string[] = toChunksBackward('Hello, World!', 3);
    console.log(strChunks);  // ['Hel', 'lo,', ' Wo', 'rld', '!']
    console.log(backChunks); // ['H', 'ell', 'o, ', 'Wor', 'ld!']

    console.log(tc2('abcdef', 2));  // ['ab', 'cd', 'ef']
    console.log(tcb2('abcde', 2));  // ['a', 'bc', 'de']
    console.log(StringNS.toChunks('abc', 2)); // ['ab', 'c']

})().catch(console.error);
