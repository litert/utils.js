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
    includeEvilSpaceChars,
    replaceEvilSpaceChars,
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
    parseKeyValue,
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
import { parseKeyValue       as pkv2        } from '@litert/utils-string/functions/ParseKeyValue';
import {
    parseBooleanValue                 as pbv2,
    DEFAULT_BOOLEAN_VALUE_MAPPINGS    as DBVM2,
} from '@litert/utils-string/functions/ParseBooleanValue';

// ── 3. Bundle namespace ───────────────────────────────────────────────────────
import * as StringNS from '@litert/utils/namespaces/String';

// ── Type-only imports (verifies interface exports are resolvable) ──────────────
import type {
    IUnitParserOptions,
    IUnitInfo,
    IUnitParserResult,
    IEmailValidationOptions,
    IParseKeyValueOptions,
    IParseBooleanValueOptions,
} from '@litert/utils-string';

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

// includeEvilSpaceChars / replaceEvilSpaceChars are aliases for the above
console.log('alias check:', includeEvilSpaceChars(evilStr));          // true
console.log('alias replace:', replaceEvilSpaceChars(evilStr, '...')); // 'Hello...World'

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

// ── parseKeyValue ─────────────────────────────────────────────────────────────
console.log('\n=== parseKeyValue ===');

// IParseKeyValueOptions exercises the exported options type
const kv1: [string, string] | null = parseKeyValue('host=localhost');
console.log('host=localhost:', kv1);                      // ['host', 'localhost']

const kv2: [string, string] | null = parseKeyValue('a=b=c');
console.log('a=b=c:', kv2);                               // ['a', 'b=c']

const kv3: [string, string] | null = parseKeyValue('no-assign');
console.log('no-assign → null:', kv3);                    // null

const kvopts: IParseKeyValueOptions = { assignSign: '=>', trimKey: true, trimValue: false };
console.log('custom sign:', parseKeyValue('key => value', kvopts)); // ['key', ' value']

console.log('sub-path pkv2:', pkv2('x:y', { assignSign: ':' })); // ['x', 'y']
console.log('namespace:', StringNS.parseKeyValue('a=b'));           // ['a', 'b']

// ── parseBooleanValue ─────────────────────────────────────────────────────────
// parseBooleanValue is sub-path only — not in the main entry or bundle namespace
console.log('\n=== parseBooleanValue ===');

// IParseBooleanValueOptions exercises the exported options type
const bvOpts: IParseBooleanValueOptions = { caseSensitive: true, defaultValue: undefined };
console.log('true → true:', pbv2('true', bvOpts));              // true
console.log('false → false:', pbv2('false', bvOpts));           // false
console.log('yes → true:', pbv2('yes', bvOpts));                // true
console.log('no → false:', pbv2('no', bvOpts));                 // false
console.log('NO (case-sens) → undefined:', pbv2('NO', bvOpts)); // undefined
console.log('NO (case-insens) → false:', pbv2('NO'));            // false (default caseSensitive=false)

// DEFAULT_BOOLEAN_VALUE_MAPPINGS is the runtime constant
console.log('DEFAULT_BOOLEAN_VALUE_MAPPINGS.true:', DBVM2['true']);   // true
console.log('DEFAULT_BOOLEAN_VALUE_MAPPINGS.false:', DBVM2['false']); // false
console.log('DEFAULT_BOOLEAN_VALUE_MAPPINGS.allow:', DBVM2['allow']); // true

// ── IUnitParserResult / IEmailValidationOptions type verification ─────────────
console.log('\n=== IUnitParserResult / IEmailValidationOptions ===');

// IUnitParserResult shapes the return value of UnitParser.parse()
const rp = new UnitParser({ format: '{value}{unit}', units: ['px', 'em'] });
const pr: IUnitParserResult | null = rp.parse('16px');
console.log('IUnitParserResult:', pr); // { value: '16', unit: 'px' }

// IEmailValidationOptions — domain allow-list
const emailOpts: IEmailValidationOptions = { domains: ['example.com'] };
console.log('example.com allowed:', isEmailAddress('user@example.com', emailOpts)); // true
console.log('other.com blocked:',   isEmailAddress('user@other.com', emailOpts));   // false
