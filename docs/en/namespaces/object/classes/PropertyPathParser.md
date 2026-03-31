# Class `PropertyPathParser`

Source: [PropertyPathParser.ts](https://github.com/litert/utils.js/blob/master/packages/partials/object/src/Classes/PropertyPathParser.ts)

A helper class that parses a property path string (e.g. `$.a.b[0]`) into an ordered array of property name segments and array indices. Supports dot notation, bracket notation with integer indices (decimal, hex, octal, and binary), and bracket notation with quoted string keys — including keys that contain dots or other special characters.

[TOC]

---

## Import

```ts
import { PropertyPathParser } from '@litert/utils-object';
```

Or via the bundle namespace:

```ts
import * as LitertUtils from '@litert/utils';
// then access via LitertUtils.Object.PropertyPathParser
```

---

## Constructor

```ts
new PropertyPathParser()
```

Creates a new `PropertyPathParser` instance. No configuration is required; the same instance can be reused across multiple `parse()` calls.

---

## Methods

### `parse`

Parses a property path string into an ordered array of property name segments and array indices.

The path must begin with `$`, which represents the root object. Each subsequent segment is separated by either dot notation (`.name`) or bracket notation (`[index]` / `["key"]` / `['key']`). Integer indices are returned as `number` values; all other keys are returned as `string` values.

#### Signature

```ts
public parse(path: string): Array<string | number>;
```

#### Parameters

- Parameter `path: string`

  The property path string to parse. Must start with `$`.

#### Return Value

Returns an `Array<string | number>` where each element is one path segment:

- `string` elements represent named property keys.
- `number` (integer) elements represent array indices.
- Returns an empty array (`[]`) when `path` is exactly `$` (the root path).

#### Error Handling

- `SyntaxError` — Thrown when the path does not start with `$`.
- `SyntaxError` — Thrown when the path contains an unexpected character at any position (e.g. an invalid bracket expression or an unrecognized digit in a numeric literal).
- `SyntaxError` — Thrown when the path ends unexpectedly (e.g. an unclosed bracket or an incomplete escape sequence).

#### Examples

**Dot notation — chained property names:**

```ts
import { PropertyPathParser } from '@litert/utils-object';

const parser = new PropertyPathParser();

parser.parse('$.a.b.c');
// Returns: ['a', 'b', 'c']
```

**Root path — returns an empty array:**

```ts
parser.parse('$');
// Returns: []
```

**Bracket notation — integer index (decimal):**

```ts
parser.parse('$.a[0]');
// Returns: ['a', 0]
```

**Bracket notation — mixed segments:**

```ts
parser.parse('$.a[1].s');
// Returns: ['a', 1, 's']
```

**Bracket notation — quoted string key (allows special characters such as dots):**

```ts
parser.parse('$.a["s.c"]');
// Returns: ['a', 's.c']

parser.parse("$.a['s.c']");
// Returns: ['a', 's.c']
```

**Bracket notation — alternative integer bases:**

```ts
parser.parse('$.a[0xFF]');   // hexadecimal → 255
// Returns: ['a', 255]

parser.parse('$.a[0o7]');    // octal → 7
// Returns: ['a', 7]

parser.parse('$.a[0b101]');  // binary → 5
// Returns: ['a', 5]
```

**Numeric literals with separators (`_` or `,`):**

```ts
parser.parse('$.a[1_000]');
// Returns: ['a', 1000]

parser.parse('$.a[1,000]');
// Returns: ['a', 1000]
```

**escaped characters inside bracket string keys:**

```ts
parser.parse('$.a["key\\"escaped"]');
// Returns: ['a', 'key"escaped']
```

**Error — path does not start with `$`:**

```ts
parser.parse('a.b.c');
// Throws: SyntaxError: Invalid property path: a.b.c
```

**Error — malformed path:**

```ts
parser.parse('$.a[');
// Throws: SyntaxError: Unexpected end of property path: $.a[
```
