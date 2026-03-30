# Function `extractPropertyByPath`

Source: [ExtractPropertyByPath.ts](https://github.com/litert/utils.js/blob/master/packages/partials/object/src/Functions/ExtractPropertyByPath.ts)

Extracts the value at a given property path from an object. The path may be a dot/bracket notation string (e.g. `$.a.b[0].c`) or a pre-parsed array of keys as returned by [`PropertyPathParser.parse()`](../classes/PropertyPathParser.md#parse).

When the path does not reach a value (i.e., an intermediate key is `undefined`), the function returns `defaultValue` instead of throwing. However, if the traversal tries to descend into a non-object value that still has path segments remaining, an `Error` is thrown.

[TOC]

## Import

```ts
import { extractPropertyByPath } from '@litert/utils-object';
```

## Signature

```ts
function extractPropertyByPath<T extends IObject>(
    obj: T,
    path: string | Array<string | number>,
    options?: IExtractPropertyByPathOptions,
): unknown;
```

## Parameters

- Parameter `obj: T`

  The object to extract the property from.

- Parameter `path: string | Array<string | number>`

  The property path to traverse. Accepts two forms:
  - A string in dot/bracket notation starting with `$`, e.g. `$.a.b[0].c`. The string is parsed using an internal [`PropertyPathParser`](../classes/PropertyPathParser.md) instance.
  - A pre-parsed array of keys (strings for object properties, numbers for array indices), as returned by [`PropertyPathParser.parse()`](../classes/PropertyPathParser.md#parse). When an array is supplied, parsing is skipped.

- Parameter `options: IExtractPropertyByPathOptions` (Optional)

  Optional extraction settings. See [`IExtractPropertyByPathOptions`](#interface-iextractpropertybypathoptions).

## Return Value

Returns the value found at the specified path. If any segment along the path resolves to `undefined`, the value specified by `options.defaultValue` is returned instead (defaults to `undefined`).

## Error Handling

- `Error` — Thrown when a non-`undefined`, non-object value is encountered before all path segments have been consumed (i.e., attempting to descend into a primitive or `null` with remaining keys).

## Scoped Types

### Interface `IExtractPropertyByPathOptions`

> Source: [ExtractPropertyByPath.ts](https://github.com/litert/utils.js/blob/master/packages/partials/object/src/Functions/ExtractPropertyByPath.ts)

```ts
import type { IExtractPropertyByPathOptions } from '@litert/utils-object';
```

Options for the `extractPropertyByPath` function.

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `defaultValue` | `unknown` | `undefined` | The value returned when the path does not resolve to a defined value (i.e., an intermediate or final key is `undefined`). Has no effect when traversal fails with an error (non-object intermediate value with remaining segments). |

---

## Examples

```ts
import { extractPropertyByPath } from '@litert/utils-object';

const obj = {
    a: {
        b: [
            { c: 42 }
        ]
    }
};

// Basic extraction
extractPropertyByPath(obj, '$');              // the `obj` itself
extractPropertyByPath(obj, '$.a.b[0].c');    // 42

// Missing path returns undefined (or defaultValue)
extractPropertyByPath(obj, '$.a.b[1].c');                              // undefined
extractPropertyByPath(obj, '$.a.b[1].c', { defaultValue: 'hello' });  // 'hello'
extractPropertyByPath(obj, '$.a.b[0].d', { defaultValue: 'hello' });  // 'hello'

// Non-object traversal throws
extractPropertyByPath(obj, '$.a.b[0].c.d', { defaultValue: 'default' }); // throws Error

// Using a pre-parsed path array (skips re-parsing)
import { PropertyPathParser } from '@litert/utils-object';

const parser = new PropertyPathParser();
const parsedPath = parser.parse('$.a.b[0].c');
extractPropertyByPath(obj, parsedPath); // 42
```
