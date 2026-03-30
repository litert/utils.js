# Class `UnitParser`

Source: [UnitParser.ts](https://github.com/litert/utils.js/blob/master/packages/partials/string/src/Classes/UnitParser.ts)

Parses a string that contains a numeric value and a unit name, according to a configurable format pattern and a list of recognized units. Returns the parsed value and the canonical unit name, or `null` if the input does not match.

[TOC]

## Import

```ts
import { UnitParser } from '@litert/utils-string';
```

## Constructor

```ts
new UnitParser(opts: IUnitParserOptions)
```

### Parameters

- Parameter `opts: IUnitParserOptions`

  Configuration object. See [`IUnitParserOptions`](#interface-iunitparseroptions).

### Error Handling

- `RangeError` — Thrown if `opts.units` is empty, or if `opts.maxDecimalPlaces` is negative or non-integer, or if two units share the same alias.
- `SyntaxError` — Thrown if `opts.format` does not contain both `{value}` and `{unit}` placeholders.

## Properties

| Name | Type | Description |
|------|------|-------------|
| `format` | `string` | The format string provided at construction. |
| `units` | `ReadonlyArray<Readonly<IUnitInfo>>` | The normalized list of units. |
| `caseInsensitive` | `boolean` | Whether unit matching is case-insensitive (default `true`). |
| `maxDecimalPlaces` | `number` | Maximum decimal places allowed in the value. |

## Instance Methods

### `parse`

```ts
parse(input: string): IUnitParserResult | null;
```

Attempts to parse `input` according to the configured format and unit list.

#### Parameters

- Parameter `input: string`

  The string to parse.

#### Return Value

An [`IUnitParserResult`](#interface-iunitparserresult) containing the `value` (string) and the canonical `unit` name, or `null` if the string does not match.

## Scoped Types

### Interface `IUnitInfo`

> Source: [UnitParser.ts](https://github.com/litert/utils.js/blob/master/packages/partials/string/src/Classes/UnitParser.ts)

```ts
import type { IUnitInfo } from '@litert/utils-string';
```

Describes a single unit accepted by `UnitParser`.

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | `string` | Yes | The canonical name of the unit. This value is returned in `IUnitParserResult.unit` regardless of how it was matched. |
| `aliases` | `readonly string[]?` | No | Additional strings that should match this unit. When `caseInsensitive` is `true`, aliases are stored in lowercase for matching, but `name` is always returned as-is. |

---

### Interface `IUnitParserOptions`

> Source: [UnitParser.ts](https://github.com/litert/utils.js/blob/master/packages/partials/string/src/Classes/UnitParser.ts)

```ts
import type { IUnitParserOptions } from '@litert/utils-string';
```

Constructor options for `UnitParser`.

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `format` | `string` | Yes | — | The expected string format. Use `{value}` as a placeholder for the numeric part and `{unit}` for the unit part. Both placeholders are required. Example: `'{value}{unit}'` matches `'12.5km'`. |
| `units` | `ReadonlyArray<string \| IUnitInfo>` | Yes | — | The list of recognized units. Each element can be a plain `string` (treated as `{ name: str, aliases: [str] }`) or an `IUnitInfo` object. |
| `caseInsensitive` | `boolean?` | No | `true` | Whether unit matching ignores case. The canonical `name` from `IUnitInfo` is always returned as-is. |
| `maxDecimalPlaces` | `number?` | No | `2` | The maximum number of digits allowed after the decimal point in the `{value}` portion. Must be a non-negative integer. |

---

### Interface `IUnitParserResult`

> Source: [UnitParser.ts](https://github.com/litert/utils.js/blob/master/packages/partials/string/src/Classes/UnitParser.ts)

```ts
import type { IUnitParserResult } from '@litert/utils-string';
```

The return type of [`UnitParser.parse()`](#parse).

| Property | Type | Description |
| --- | --- | --- |
| `value` | `string` | The numeric portion of the parsed string (e.g., `'12.5'`). |
| `unit` | `string` | The canonical unit name matched — the `name` field from `IUnitInfo`, not the matched alias. |

---

## Examples

```ts
import { UnitParser } from '@litert/utils-string';

const parser = new UnitParser({
    format: '{value}{unit}',
    units: [
        { name: 'B',   aliases: ['b', 'byte', 'bytes'] },
        { name: 'KiB', aliases: ['kib', 'k'] },
        { name: 'MiB', aliases: ['mib', 'm'] },
        { name: 'GiB', aliases: ['gib', 'g'] },
    ],
    caseInsensitive: true,
});

parser.parse('1.5GiB');  // { value: '1.5', unit: 'GiB' }
parser.parse('10mib');   // { value: '10',  unit: 'MiB' }
parser.parse('512B');    // { value: '512', unit: 'B'   }
parser.parse('5 TB');    // null (space not in format)
parser.parse('xyz');     // null (no match)
```

### Format with space

```ts
const parser2 = new UnitParser({
    format: '{value} {unit}',
    units: ['cm', 'm', 'km'],
});

parser2.parse('12.5 km'); // { value: '12.5', unit: 'km' }
parser2.parse('12.5km');  // null (format requires a space)
```
