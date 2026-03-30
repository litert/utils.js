# Class `BackgroundRunner`

Source: [BackgroundRunner.ts](https://github.com/litert/utils.js/blob/master/packages/partials/async/src/Classes/BackgroundRunner.ts)

Runs async callbacks "fire-and-forget" style in the background. The calling fiber does not `await` the callback's Promise, so it continues running without blocking.

Any errors thrown or rejections from background callbacks are automatically caught and emitted as `'error'` events. This prevents unhandled promise rejections.

[TOC]

## Import

```ts
import { BackgroundRunner, DEFAULT_BG_RUNNER_WAIT_FN } from '@litert/utils-async';
```

## Constructor

```ts
new BackgroundRunner(opts?: IBackgroundRunnerOptions)
```

### Parameters

- Parameter `opts?: IBackgroundRunnerOptions` (default: `{}`) — See [`IBackgroundRunnerOptions`](#interface-ibackgroundrunneroptions).

## Events

| Event | Arguments | Description |
|-------|-----------|-------------|
| `'error'` | `(error: unknown)` | Emitted when a background callback throws or rejects. |

## Methods

### `run`

```ts
run(callback: () => Promise<void>): void;
```

Starts `callback` immediately in the background. The callback's Promise is not awaited. If the callback throws synchronously or rejects, the error is emitted as an `'error'` event.

### `runLater`

```ts
runLater(callback: () => Promise<void>, wait?: () => Promise<void>): void;
```

Schedules `callback` to run after the `wait` function resolves. By default, `wait` is [`DEFAULT_BG_RUNNER_WAIT_FN`](#constant-default_bg_runner_wait_fn) (`sleep(0)` — next event loop tick).

#### Parameters

- `callback` — The async callback to run in the background.
- `wait?` — Override the wait function for this specific invocation.

## Scoped Types

### Interface `IBackgroundRunnerOptions`

> Source: [BackgroundRunner.ts](https://github.com/litert/utils.js/blob/master/packages/partials/async/src/Classes/BackgroundRunner.ts)

```ts
import type { IBackgroundRunnerOptions } from '@litert/utils-async';
```

Constructor options for `BackgroundRunner`.

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `waitFn` | `() => Promise<void>` | [`DEFAULT_BG_RUNNER_WAIT_FN`](#constant-default_bg_runner_wait_fn) | The wait function called by `runLater` before executing callbacks. |

---

### Interface `IBackgroundRunnerEvents`

> Source: [BackgroundRunner.ts](https://github.com/litert/utils.js/blob/master/packages/partials/async/src/Classes/BackgroundRunner.ts)

```ts
import type { IBackgroundRunnerEvents } from '@litert/utils-async';
```

Events emitted by `BackgroundRunner`.

| Event | Payload | Description |
| --- | --- | --- |
| `'error'` | `error: unknown` | Emitted when a background callback throws an unhandled error or rejects. |

---

## Scoped Constants

### Constant `DEFAULT_BG_RUNNER_WAIT_FN`

> Source: [BackgroundRunner.ts](https://github.com/litert/utils.js/blob/master/packages/partials/async/src/Classes/BackgroundRunner.ts)

```ts
import { DEFAULT_BG_RUNNER_WAIT_FN } from '@litert/utils-async';
```

The default wait function used by `BackgroundRunner.runLater` and as the default for `IBackgroundRunnerOptions.waitFn`. Calls `sleep(0)`, which yields control to the event loop on the next tick.

```ts
const DEFAULT_BG_RUNNER_WAIT_FN: () => Promise<void>;
```

---

## Examples

```ts
import { BackgroundRunner } from '@litert/utils-async';

const runner = new BackgroundRunner();

runner.on('error', (err) => {
    console.error('Background task failed:', err);
});

// Fire-and-forget: don't wait for the result
runner.run(async () => {
    await sendAnalyticsEvent({ type: 'pageview' });
});

// Deferred: run on next tick
runner.runLater(async () => {
    await cleanUpTempFiles();
});
```
