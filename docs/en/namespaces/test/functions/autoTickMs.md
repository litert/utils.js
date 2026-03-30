# Function `autoTickMs`

> **Package:** `@litert/utils-test`
> **Source:** [packages/partials/test/src/Functions/AutoTickMs.ts](https://github.com/litert/utils.js/blob/master/packages/partials/test/src/Functions/AutoTickMs.ts)

Automatically advances the mocked clock by a fixed interval (`tickMs` milliseconds, default `1`) on every event loop tick by calling `ctx.mock.timers.tick(tickMs)` until the given `asyncTask` settles. Timer callbacks fire only when the mock clock reaches their scheduled time, providing precise control over which timer fires at which point.

Unlike [`autoTick`](./autoTick.md), this function stops the clock precisely at the abort/settlement point, so elapsed mock time reflects the exact moment the task finished rather than the full timer duration.

> **Note:** At most one extra `tick(tickMs)` call may occur after the promise settles, so the final mock clock value might be at most `tickMs` milliseconds beyond the exact settlement point.

> **Prerequisites:** Timer mocking must be enabled before calling this function:
> ```ts
> ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });
> ```

---

## Import

```ts
import { autoTickMs } from '@litert/utils-test';
```

---

## Signature

```ts
async function autoTickMs<T>(
    ctx: TestContext,
    asyncTask: Promise<T> | (() => Promise<T>),
    options?: IAutoTickMsOptions,
): Promise<T>;
```

---

## Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `ctx` | `TestContext` | The test context from `node:test` |
| `asyncTask` | `Promise<T> \| (() => Promise<T>)` | The async task to run; can be a `Promise` or a factory function |
| `options` | `IAutoTickMsOptions?` | Controls the tick size — see [IAutoTickMsOptions](#interface-iautotickms-options) |

---

## Return Value

A `Promise` that resolves or rejects with the same value as `asyncTask`.

---

## Scoped Types

### Interface `IAutoTickMsOptions`

> Source: [AutoTickMs.ts](https://github.com/litert/utils.js/blob/master/packages/partials/test/src/Functions/AutoTickMs.ts)

```ts
import type { IAutoTickMsOptions } from '@litert/utils-test';
```

Options that control the ticking behavior of the `autoTickMs` function.

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `tickMs` | `number` | No | `1` | Milliseconds to advance the mock clock per event loop tick. Increase this value to reduce iterations for tests covering very long timer durations. For example, set `tickMs` to `3_600_000` for 1-hour increments when testing a 24-hour timer, reducing iterations from 86,400,000 to just 24. |

---

## Examples

```ts
import * as NodeTest from 'node:test';
import NodeTimer from 'node:timers/promises';
import { autoTickMs } from '@litert/utils-test';

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
    catch { /* AbortError expected */ }

    console.log(Date.now() - t0); // ~50
});
```
