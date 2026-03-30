# Function `toDict`

> **Package:** `@litert/utils-array`
> **Source:** [packages/partials/array/src/Functions/ToDict.ts](https://github.com/litert/utils.js/blob/master/packages/partials/array/src/Functions/ToDict.ts)

Transforms an array of objects into a dictionary (plain object / map), keyed by a specified property or a key-extraction function. Each element becomes a value in the resulting dictionary, accessible by its computed key.

---

## Import

```ts
import { toDict } from '@litert/utils-array';
```

---

## Signature

```ts
function toDict<T extends IObject>(
    input: readonly T[],
    key: (keyof T) | ((v: T) => string | number | symbol)
): IDict<T>;
```

---

## Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `input` | `readonly T[]` | The array of objects to transform |
| `key` | `keyof T \| ((v: T) => string \| number \| symbol)` | A property name or a function that returns the key for each element |

---

## Return Value

A plain object (`IDict<T>`) where each key maps to the corresponding element. If multiple elements produce the same key, the last one wins.

---

## Examples

```ts
import { toDict } from '@litert/utils-array';

const users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
];

// Using a property name
const byId = toDict(users, 'id');
console.log(byId[1]); // { id: 1, name: 'Alice' }

// Using a function
const byName = toDict(users, u => u.name.toLowerCase());
console.log(byName['alice']); // { id: 1, name: 'Alice' }
```
