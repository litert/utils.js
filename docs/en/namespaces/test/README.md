# Namespace `Test`

Package: `@litert/utils-test`

Test helper utilities for the Node.js built-in test runner (`node:test`). Provides functions that automatically advance mocked timers so that timer-dependent async tests complete instantly without real delays, and a helper to temporarily override environment variables.

## Install

Use this namespace only:

```bash
npm i @litert/utils-test
```

Or install the full bundle:

```bash
npm i @litert/utils
```

And then import from it.

```ts
import * as LibUtils from '@litert/utils';
await LibUtils.Test.autoTick(myTimerTask);

// or
import { Test as LibTest } from '@litert/utils';
await LibTest.autoTick(myTimerTask);
```

[TOC]

## Functions

| Function | Description |
| --- | --- |
| [`autoTick`](./functions/autoTick.md) | Advances mocked timers via `runAll()` on every event loop tick until the task settles. |
| [`autoTickMs`](./functions/autoTickMs.md) | Advances the mocked clock by a fixed interval (`tickMs`) per event loop tick until the task settles. |
| [`withEnv`](./functions/withEnv.md) | Temporarily sets environment variables for the duration of a callback and restores them afterward. |
