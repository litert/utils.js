# Function `parseKeyValue`

Source: [ParseKeyValue.ts](https://github.com/litert/utils.js/blob/master/packages/partials/string/src/Functions/ParseKeyValue.ts)

Parses a key-value expression such as `key=value` into a labeled tuple `[key, value]`.

This function is useful for parsing simple configuration strings. It splits only at the **first** occurrence of the assign sign, so an expression like `a=b=c` correctly yields `['a', 'b=c']` instead of being split at every `=`.

[TOC]

## Import

```ts
import { parseKeyValue } from '@litert/utils-string';
```

## Signature

```ts
function parseKeyValue(
    expr: string,
    opts?: IParseKeyValueOptions,
): [key: string, value: string] | null;
```

## Parameters

- Parameter `expr: string`

  The expression string to parse. Must contain the assign sign (e.g., `key=value`) for a non-`null` result to be returned.

- Parameter `opts: IParseKeyValueOptions` (Optional)

  Optional settings to customize parsing behavior. See [`IParseKeyValueOptions`](#interface-iparsekeyvalueoptions) for the full list of available options.

  | Option | Default |
  |---|---|
  | `assignSign` | `'='` |
  | `trimKey` | `true` |
  | `trimValue` | `true` |

## Return Value

Returns a labeled tuple `[key: string, value: string]` containing the parsed key and value when the assign sign is found in `expr`.

Returns `null` when `expr` does not contain the assign sign at all.

## Scoped Types

### Interface `IParseKeyValueOptions`

> Source: [ParseKeyValue.ts](https://github.com/litert/utils.js/blob/master/packages/partials/string/src/Functions/ParseKeyValue.ts)

```ts
import type { IParseKeyValueOptions } from '@litert/utils-string';
```

Options for the `parseKeyValue` function.

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `assignSign` | `string` | `'='` | The string used to separate the key and value. Change this for formats like `key:value` or `key=>value`. |
| `trimKey` | `boolean` | `true` | Whether to trim whitespace from the key before returning it. |
| `trimValue` | `boolean` | `true` | Whether to trim whitespace from the value before returning it. |

---

## Examples

```ts
import { parseKeyValue } from '@litert/utils-string';

parseKeyValue('a=b');   // ['a', 'b']
parseKeyValue('a=b=c'); // ['a', 'b=c']

parseKeyValue('a = b', { trimKey: true, trimValue: true });   // ['a', 'b']
parseKeyValue('a = b', { trimKey: false, trimValue: false }); // ['a ', ' b']

parseKeyValue('a:b', { assignSign: ':' });   // ['a', 'b']
parseKeyValue('a=>b', { assignSign: '=>' }); // ['a', 'b']

parseKeyValue('abc'); // null
```
