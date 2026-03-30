# Namespace `Array`

Package: `@litert/utils-array`

Array utility functions for JavaScript/TypeScript. Provides deduplication, array-to-dictionary transformation, and fixed-size chunking for any array type.

## Install

Use this namespace only:

```bash
npm i @litert/utils-array
```

Or install the full bundle:

```bash
npm i @litert/utils
```

And then import from it.

```ts
import * as LibUtils from '@litert/utils';
LibUtils.Array.deduplicate(arr);

// or
import { Array as LibArray } from '@litert/utils';
LibArray.deduplicate(arr);
```

[TOC]

## Functions

| Function | Description |
| --- | --- |
| [`deduplicate`](./functions/deduplicate.md) | Deduplicates an array and returns a new array without duplicates. |
| [`toChunks`](./functions/toChunks.md) | Splits an array into fixed-size chunks. |
| [`toDict`](./functions/toDict.md) | Transforms an object array into a keyed dictionary. |
