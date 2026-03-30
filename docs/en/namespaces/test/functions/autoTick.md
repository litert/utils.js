# Function `autoTick`

> **Package:** `@litert/utils-test`
> **Source:** [packages/partials/test/src/Functions/AutoTick.ts](https://github.com/litert/utils.js/blob/master/packages/partials/test/src/Functions/AutoTick.ts)

Automatically advances all mocked timers on every event loop tick by calling `ctx.mock.timers.runAll()` until the given `asyncTask` promise settles. This allows tests that depend on `setTimeout` or similar APIs to complete instantly with mocked time.

On each event loop tick, `runAll()` fires every currently pending timer at its full scheduled duration. The loop continues until `asyncTask` resolves or rejects.

> **Note:** Because `runAll()` fires each timer at its full scheduled duration, the mocked clock counts the entire timer duration even if the timer is cancelled early. Use [`autoTickMs`](./autoTickMs.md) when you need precise clock advancement that reflects actual abort points.

> **Prerequisites:** Timer mocking must be enabled before calling this function:
> ```ts
> ctx.mock.timers.enable({ apis: ['setTimeout', 'Date'] });
> ```

---

## Import

```ts
import { autoTick } from '@litert/utils-test';
```

---

## Signature

```ts
async function autoTick<T>(
    ctx: TestContext,
    asyncTask: Promise<T> | (() => Promise<T>),
): Promise<T>;
```

---

## Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `ctx` | `TestContext` | The test context from `node:test`, used to call `ctx.mock.timers.runAll()` |
| `asyncTask` | `Promise<T> \| (() => Promise<T>)` | The async task to run; can be a `Promise` or a factory function |

---

## Return Value

A `Promise` that resolves or rejects with the same value as `asyncTask`.

---

## Examples

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

    console.log(result); // 'done' — completes instantly
});
```
