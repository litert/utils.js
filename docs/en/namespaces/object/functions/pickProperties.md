# Function `pickProperties`

Source: [PickProperties.ts](https://github.com/litert/utils.js/blob/master/packages/partials/object/src/Functions/PickProperties.ts)

> **Sub-path import only.** This function is not exported from the main `@litert/utils-object` entry point.

Creates a new object containing only the specified subset of properties from the input object. When `null` is passed, an empty object is returned.

[TOC]

## Import

```ts
import { pickProperties } from '@litert/utils-object/functions/PickProperties';
```

## Signature

```ts
function pickProperties<T extends IObject | null, TKeys extends keyof T>(
    obj: T,
    keys: TKeys[],
): Pick<T, TKeys>;
```

## Parameters

- Parameter `obj: T`

  The source object, or `null`. When `null`, an empty object is returned.

- Parameter `keys: TKeys[]`

  The array of property keys to include in the returned object.

## Return Value

A new `Pick<T, TKeys>` object containing only the specified keys and their values from `obj`.

## Error Handling

- `TypeError` — Thrown when `obj` is not an object (i.e., a non-null primitive value).

## Examples

```ts
import { pickProperties } from '@litert/utils-object/functions/PickProperties';

const user = { name: 'Alice', age: 30, email: 'alice@example.com' };

const summary = pickProperties(user, ['name', 'age']);
// { name: 'Alice', age: 30 }

// null input returns empty object
const empty = pickProperties(null, []);
// {}
```
