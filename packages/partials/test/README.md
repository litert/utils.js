# LiteRT/Utils - Test

[![Strict TypeScript Checked](https://badgen.net/badge/TS/Strict "Strict TypeScript Checked")](https://www.typescriptlang.org)
[![npm version](https://img.shields.io/npm/v/@litert/utils-test.svg?colorB=brightgreen)](https://www.npmjs.com/package/@litert/utils-test "Stable Version")
[![License](https://img.shields.io/npm/l/@litert/utils-test.svg?maxAge=2592000?style=plastic)](https://github.com/litert/utils.js/blob/master/LICENSE)
[![node](https://img.shields.io/node/v/@litert/utils-test.svg?colorB=brightgreen)](https://nodejs.org/dist/latest-v8.x/)
[![GitHub issues](https://img.shields.io/github/issues/litert/utils.js.svg)](https://github.com/litert/utils.js/issues)
[![GitHub Releases](https://img.shields.io/github/release/litert/utils.js.svg)](https://github.com/litert/utils.js/releases "Stable Release")

The utility functions/classes/constants about test (using `node:test`) for NodeJS.

[TOC]

## Requirement

- TypeScript v5.0.0 (or newer)
- Node.js v22.0.0 (or newer)

## Installation

```sh
npm i @litert/utils-test --save
```

## Getting Started

Both `autoTick` and `autoTickMs` work with the Node.js built-in timer mocking API
(`ctx.mock.timers`). Before using either function inside a test, you must enable timer
mocking on the test context and ensure `node:timers/promises` is imported in the correct
form.

### Step 1 — Enable timer mocking

At the beginning of your test, call:

```ts
ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });
```

Include every timer API your code-under-test actually uses in the `apis` array
(e.g., `'setInterval'`, `'setImmediate'`, `'Date'`).

### Step 2 — Import `node:timers/promises` correctly

> [!IMPORTANT]
> In some old Node.js versions, the namespace import form (`import * as`) bypasses timer mocking.
> Always use the **default import** form to guarantee that the timers are properly intercepted:
>
> ```ts
> // Correct — timers will be mocked
> import NodeTimer from 'node:timers/promises';
>
> // Incorrect — timers may not be mocked in older Node.js versions
> import * as NodeTimer from 'node:timers/promises';
> ```

## APIs

### Function `autoTick`

Advances all pending mocked timers at once on every event loop tick until the given promise
settles.

Internally, `autoTick` calls `ctx.mock.timers.runAll()` in a loop — once per event loop tick.
Each call to `runAll()` fires **all** currently pending timers, advancing the mock clock to the
time of the last scheduled timer in one step.

**Signature:**

```ts
function autoTick<T>(
    ctx: TestContext,
    asyncTask: Promise<T> | (() => Promise<T>),
): Promise<T>
```

**Parameters:**

| Parameter | Type | Description |
| --- | --- | --- |
| `ctx` | `TestContext` | The test context provided by `node:test`, used to drive the mocked timers. |
| `asyncTask` | `Promise<T> \| (() => Promise<T>)` | The async task to run, passed either as an already-created `Promise` or as a factory function that returns one. |

**Returns:** Resolves with the same value as `asyncTask`, or rejects with the same error.

> [!WARNING]
> `autoTick` always fires every pending timer at its **full scheduled duration** via `runAll()`.
> If a timer is cancelled early by an `AbortController` signal, the mock clock still counts
> the full timer duration — not the elapsed time at the point of cancellation.
> Use `autoTickMs` instead if accurate abort-signal timing matters to your test.

**Example — basic usage:**

```ts
import * as NodeTest from 'node:test';
import NodeTimer from 'node:timers/promises';
import { autoTick } from '@litert/utils-test';

NodeTest.it('resolves correctly with mocked timers', async (ctx) => {
    ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });

    const result = await autoTick(ctx, async () => {
        await NodeTimer.setTimeout(1000);
        await NodeTimer.setTimeout(2000);
        return 'done';
    });

    console.log(result); // 'done'
    // The test completes instantly — no real time elapsed
});
```

**Example — passing a Promise directly:**

```ts
NodeTest.it('accepts a pre-created promise', async (ctx) => {
    ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });

    const task = (async () => {
        await NodeTimer.setTimeout(500);
        return 42;
    })();

    const result = await autoTick(ctx, task);
    console.log(result); // 42
});
```

---

### Function `autoTickMs`

Advances the mocked clock by a fixed number of milliseconds on every event loop tick until
the given promise settles.

Internally, `autoTickMs` calls `ctx.mock.timers.tick(tickMs)` in a loop — once per event loop
tick. Because the clock advances in discrete steps, the mock time elapsed when the promise
settles reflects **only the ticks that actually ran** up to that point, allowing abort-signal
timing to be precise.

**Signature:**

```ts
function autoTickMs<T>(
    ctx: TestContext,
    asyncTask: Promise<T> | (() => Promise<T>),
    options?: IAutoTickMsOptions,
): Promise<T>
```

**Parameters:**

| Parameter | Type | Description |
| --- | --- | --- |
| `ctx` | `TestContext` | The test context provided by `node:test`, used to drive the mocked timers. |
| `asyncTask` | `Promise<T> \| (() => Promise<T>)` | The async task to run, passed either as an already-created `Promise` or as a factory function that returns one. |
| `options` | `IAutoTickMsOptions` | Optional settings that control the ticking behaviour. |

**Returns:** Resolves with the same value as `asyncTask`, or rejects with the same error.

**Options — `IAutoTickMsOptions`:**

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `tickMs` | `number` | `1` | Milliseconds to advance the mock clock per event loop tick. Increase this for tests that involve long total timer durations to reduce the number of iterations and keep the test fast. |

> [!NOTE]
> Because `autoTickMs` checks whether the promise has settled only after each tick, at most one
> extra tick may occur after the promise settles. The final mock clock value might therefore be
> up to `tickMs` milliseconds ahead of the exact settlement point.

**Example — basic usage:**

```ts
import * as NodeTest from 'node:test';
import NodeTimer from 'node:timers/promises';
import { autoTickMs } from '@litert/utils-test';

NodeTest.it('resolves correctly with mocked timers', async (ctx) => {
    ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });

    const result = await autoTickMs(ctx, async () => {
        await NodeTimer.setTimeout(1000);
        await NodeTimer.setTimeout(2000);
        return 'done';
    });

    console.log(result); // 'done'
});
```

**Example — precise abort-signal timing:**

```ts
NodeTest.it('timer aborted at 50ms counts only ~50ms of mock time', async (ctx) => {
    ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });

    const t0 = Date.now();
    const ac = new AbortController();

    try {
        await autoTickMs(ctx, async () => {
            setTimeout(() => ac.abort(new Error('abort')), 50);
            await NodeTimer.setTimeout(1000, null, { signal: ac.signal });
        });
    }
    catch { // AbortError expected
    }

    // The promise settled when the abort fired at 50ms,
    // so the mock clock advanced only ~50ms — not the full 1000ms
    console.log(Date.now() - t0); // ~50
});
```

**Example — large `tickMs` for long-duration timers:**

```ts
NodeTest.it('handles a 24-hour timer without performance issues', async (ctx) => {
    ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });

    // Without tickMs override: tick(1) would run 86,400,000 times
    // With tickMs = 3_600_000: tick(3_600_000) runs only 24 times
    await autoTickMs(
        ctx,
        NodeTimer.setTimeout(3_600_000 * 24),
        { tickMs: 3_600_000 },
    );
});
```

---

### Function `withEnv`

Temporarily sets environment variables for the duration of a callback and restores them afterward.

Works with both synchronous and asynchronous callbacks. If the callback returns a `Promise`, the environment variables are restored once the promise settles (resolves or rejects). Any error thrown by the callback is re-thrown after the environment variables are restored.

**Signature:**

```ts
function withEnv<T extends () => any>(env: IDict, cb: T): ReturnType<T>
```

**Parameters:**

| Parameter | Type | Description |
| --- | --- | --- |
| `env` | `IDict` | An object of environment variable key-value pairs to set for the duration of the callback. |
| `cb` | `T` | The callback function to execute with the temporary environment variables. |

**Returns:** The return value of the callback (including `Promise` if the callback is async).

**Example — synchronous callback:**

```ts
import { withEnv } from '@litert/utils-test';

withEnv({ MY_VAR: 'hello' }, () => {
    console.log(process.env.MY_VAR); // 'hello'
});

console.log(process.env.MY_VAR); // undefined (restored)
```

**Example — asynchronous callback:**

```ts
import { withEnv } from '@litert/utils-test';

await withEnv({ NODE_ENV: 'test' }, async () => {
    await someAsyncOperation();
    console.log(process.env.NODE_ENV); // 'test'
});

console.log(process.env.NODE_ENV); // restored to original
```

---

## Choosing Between `autoTick` and `autoTickMs`

| | `autoTick` | `autoTickMs` |
| --- | --- | --- |
| **Timer advancement** | Fires all pending timers at once (`runAll()`) | Advances by fixed `tickMs` increments (`tick(ms)`) |
| **Speed** | Fastest — constant iterations regardless of total duration | Proportional to total duration ÷ `tickMs` |
| **Abort-signal precision** | Full timer duration always counted | Counts only the ticks up to the abort point |
| **Timer ordering control** | Not possible | Possible with small `tickMs` |
| **Long-duration timers** | No special concern | Use a larger `tickMs` for efficiency |

**Rule of thumb:**

- Use `autoTick` when you want the simplest possible way to advance all timers and don't care
  about abort-signal timing.
- Use `autoTickMs` when you need to test abort/cancellation scenarios, timer ordering, or want
  the mock time to reflect reality as closely as possible.

## Documentation

- [en-US](https://litert.org/projects/utils.js/en/api/namespaces/test/)

## License

This library is published under [Apache-2.0](https://github.com/litert/utils.js/blob/master/LICENSE) license.

## AI Disclaimer

This project may use AI tools to assist in documentation writing and inspiration for unit test cases, but all code is written and reviewed by human developers.
