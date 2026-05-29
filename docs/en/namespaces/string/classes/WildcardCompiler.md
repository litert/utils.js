# Class `WildcardCompiler`

Source: [WildcardCompiler.ts](https://github.com/litert/utils.js/blob/master/packages/partials/string/src/Classes/WildcardCompiler.ts)

Compiles shell-style wildcard patterns into `RegExp` pattern strings or `RegExp`
objects. Use it when you want `*` and `?` wildcard matching without hand-writing
regular expressions.

[TOC]

## Import

```ts
import { WildcardCompiler } from '@litert/utils-string';
```

## Constructor

```ts
new WildcardCompiler(options?: IWildcardCompilerOptions)
```

### Parameters

- Parameter `options?: IWildcardCompilerOptions`

  Optional compiler settings. See
  [`IWildcardCompilerOptions`](#interface-iwildcardcompileroptions).

## Properties

| Name | Type | Description |
|------|------|-------------|
| `disableQuestionMark` | `boolean` | When `true`, `?` is treated as a literal character instead of a single-character wildcard. |

## Instance Methods

### `compile`

```ts
compile(pattern: string): RegExp;
```

Compiles `pattern` into a `RegExp` instance.

#### Parameters

- Parameter `pattern: string`

  A wildcard pattern where `*` matches zero or more characters, and `?` matches
  one character unless `disableQuestionMark` is enabled.

#### Return Value

A `RegExp` instance created from
[`compileToString()`](#compiletostring). The result is anchored at the start and
end unless the wildcard pattern begins or ends with `*`.

### `compileToString`

```ts
compileToString(pattern: string): string;
```

Compiles `pattern` into a `RegExp` pattern string.

#### Parameters

- Parameter `pattern: string`

  A wildcard pattern to convert.

#### Return Value

A `RegExp` pattern string that can be passed to `new RegExp(...)`. Literal text
is escaped with [`regexpEscape`](../functions/regexpEscape.md), consecutive `*`
wildcards collapse into one `.*`, and consecutive `?` wildcards collapse into a
quantified `.{n}` segment.

## Scoped Types

### Interface `IWildcardCompilerOptions`

> Source: [WildcardCompiler.ts](https://github.com/litert/utils.js/blob/master/packages/partials/string/src/Classes/WildcardCompiler.ts)

```ts
import type { IWildcardCompilerOptions } from '@litert/utils-string';
```

Configuration options for `WildcardCompiler`.

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `disableQuestionMark` | `boolean?` | No | `false` | Treats `?` as a literal question mark instead of a single-character wildcard. |

## Examples

### Match a filename pattern

```ts
import { WildcardCompiler } from '@litert/utils-string';

const compiler = new WildcardCompiler();
const matcher = compiler.compile('src/*.test.?s');

matcher.test('src/string.test.ts');  // true
matcher.test('src/string.test.js');  // true
matcher.test('src/string.test.mts'); // false
```

### Treat `?` as a literal character

```ts
const compiler = new WildcardCompiler({ disableQuestionMark: true });
const matcher = compiler.compile('config?.json');

matcher.test('config?.json'); // true
matcher.test('config1.json'); // false
```

### Reuse the compiled pattern string

```ts
const compiler = new WildcardCompiler();
const pattern = compiler.compileToString('*report-2026?.txt');

new RegExp(pattern).test('monthly-report-2026a.txt'); // true
new RegExp(pattern).test('report-2026.txt');          // false
```
