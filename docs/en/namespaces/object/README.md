# Namespace `Object`

Object utilities for copying, merging, inspecting, and type-checking JavaScript/TypeScript objects.

## Install

Use this namespace only:

```bash
npm i @litert/utils-object
```

Or install the full bundle:

```bash
npm i @litert/utils
```

And then import from it.

```ts
import * as LibUtils from '@litert/utils';
LibUtils.Object.deepMerge(a, b);

// or
import { Object as LibObject } from '@litert/utils';
LibObject.deepMerge(a, b);
```

## Exports

### Classes

| Name | Description |
|------|-------------|
| [`PropertyPathParser`](./classes/PropertyPathParser.md) | Parses a property path string (e.g. `$.a.b[0]`) into an array of property names and array indices. |

### Functions

| Name | Description |
|------|-------------|
| [`copyProperties`](./functions/copyProperties.md) | Copies specified properties from a source object to a destination object. |
| [`deepMerge`](./functions/deepMerge.md) | Recursively merges two objects into a new object. |
| [`getPropertyByPath`](./functions/getPropertyByPath.md) | Extracts the value at a given property path from an object. |
| [`getConstructor`](./functions/getConstructor.md) | Returns the constructor function of an object. |
| [`getPropertyNames`](./functions/getPropertyNames.md) | Returns all own property names and symbols of an object. |
| [`hasProperties`](./functions/hasProperties.md) | Checks whether all specified properties exist on an object. |
| [`isClassConstructor`](./functions/isClassConstructor.md) | Checks whether a value is a native ES2015 class constructor. |
| [`isSubclassOf`](./functions/isSubclassOf.md) | Checks whether a class is a subclass of another. |
| [`pickProperties`](./functions/pickProperties.md) | Creates a new object with only the specified properties. |
