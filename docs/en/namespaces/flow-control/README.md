# Namespace `flow-control`

Package: `@litert/utils-flow-control`

Flow-control utility functions for JavaScript/TypeScript. Provides an expression-style `try-catch-finally` helper and a conditional value selector, both supporting synchronous and asynchronous functions.

## Install

Use this package only:

```bash
npm i @litert/utils-flow-control
```

Or install the full bundle:

```bash
npm i @litert/utils
```

And then import from it.

```ts
import * as LibUtils from '@litert/utils';
LibUtils.tryCatch(...);

// or
import { tryCatch } from '@litert/utils';
tryCatch(...);
```

[TOC]

## Functions

| Function | Description |
| --- | --- |
| [`tryCatch`](./functions/tryCatch.md) | Expression-style `try-catch[-finally]` that supports both sync and async code. |
| [`useValueOr`](./functions/useValueOr.md) | Returns a value if it passes a check, or falls back to a default value. |
