# Function `parseBooleanValue`

Source: [ParseBooleanValue.ts](https://github.com/litert/utils.js/blob/master/packages/partials/string/src/Functions/ParseBooleanValue.ts)

Parses a string into a boolean value by looking it up in a configurable mapping table. Returns `true` for truthy strings (e.g. `"yes"`, `"1"`, `"on"`), `false` for falsy strings (e.g. `"no"`, `"0"`, `"off"`), and `undefined` (or a configured `defaultValue`) when the string does not match any mapping entry.

[TOC]

## Import

```ts
import { parseBooleanValue, DEFAULT_BOOLEAN_VALUE_MAPPINGS } from '@litert/utils-string';
```

## Signature

```ts
function parseBooleanValue(
    value: string,
    options?: IParseBooleanValueOptions,
): boolean | undefined;
```

## Parameters

- Parameter `value: string`

  The string to parse.

- Parameter `options: IParseBooleanValueOptions` (Optional)

  Optional settings. See [`IParseBooleanValueOptions`](#interface-iparsebooleanvalueoptions) for the full list of available options.

  | Option | Default |
  |---|---|
| `mappings` | [`DEFAULT_BOOLEAN_VALUE_MAPPINGS`](#constant-default_boolean_value_mappings) |
  | `defaultValue` | `undefined` |
  | `caseSensitive` | `false` |

## Return Value

- Returns `true` when `value` maps to `true` in the `mappings` table.
- Returns `false` when `value` maps to `false` in the `mappings` table.
- Returns `options.defaultValue` (default: `undefined`) when `value` does not match any entry.

## Scoped Types

### Interface `IParseBooleanValueOptions`

> Source: [ParseBooleanValue.ts](https://github.com/litert/utils.js/blob/master/packages/partials/string/src/Functions/ParseBooleanValue.ts)

```ts
import type { IParseBooleanValueOptions } from '@litert/utils-string';
```

Options for the `parseBooleanValue` function.

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `mappings` | `IDict<boolean>` | [`DEFAULT_BOOLEAN_VALUE_MAPPINGS`](#constant-default_boolean_value_mappings) | A mapping of string values to their corresponding boolean values. When provided, replaces the default mapping entirely. All keys must be in lowercase when `caseSensitive` is `false`. |
| `defaultValue` | `boolean \| undefined` | `undefined` | The value returned when the input string does not match any entry in `mappings`. |
| `caseSensitive` | `boolean` | `false` | Whether to perform case-sensitive comparison. When `false`, the input string is lowercased before lookup, so all keys in `mappings` must be provided in lowercase. |

---

## Scoped Constants

### Constant `DEFAULT_BOOLEAN_VALUE_MAPPINGS`

> Source: [ParseBooleanValue.ts](https://github.com/litert/utils.js/blob/master/packages/partials/string/src/Functions/ParseBooleanValue.ts)

```ts
import { DEFAULT_BOOLEAN_VALUE_MAPPINGS } from '@litert/utils-string';
```

The default mapping used by `parseBooleanValue` when no custom `mappings` option is provided. All keys are lowercase; when `caseSensitive` is `false` (the default), the input is lowercased before lookup so these entries match any casing.

```ts
const DEFAULT_BOOLEAN_VALUE_MAPPINGS: IDict<boolean>;
```

| Key | Value |
| --- | --- |
| `"true"` | `true` |
| `"1"` | `true` |
| `"yes"` | `true` |
| `"on"` | `true` |
| `"y"` | `true` |
| `"enabled"` | `true` |
| `"active"` | `true` |
| `"ok"` | `true` |
| `"allow"` | `true` |
| `"allowed"` | `true` |
| `"false"` | `false` |
| `"0"` | `false` |
| `"no"` | `false` |
| `"off"` | `false` |
| `"n"` | `false` |
| `"disabled"` | `false` |
| `"inactive"` | `false` |
| `"deny"` | `false` |
| `"denied"` | `false` |

---

## Examples

```ts
import { parseBooleanValue } from '@litert/utils-string';

parseBooleanValue('true');   // true
parseBooleanValue('false');  // false
parseBooleanValue('yes');    // true
parseBooleanValue('no');     // false
parseBooleanValue('1');      // true
parseBooleanValue('0');      // false

// Unrecognized input returns undefined by default
parseBooleanValue('maybe');  // undefined

// Case sensitivity
parseBooleanValue('NO', { caseSensitive: true });   // undefined (no match)
parseBooleanValue('NO', { caseSensitive: false });  // false     (lowercased before lookup)

// Custom default value
parseBooleanValue('maybe', { defaultValue: false }); // false

// Custom mapping
parseBooleanValue('enabled', { mappings: { enabled: true, disabled: false } }); // true
```
