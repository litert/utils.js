# Namespace `Async`

Async utilities for timeouts, abortable operations, automatic retry, structured concurrency, and background task management.

## Install

Use this namespace only:

```bash
npm i @litert/utils-async
```

Or install the full bundle:

```bash
npm i @litert/utils
```

And then import from it.

```ts
import * as LibUtils from '@litert/utils';
LibUtils.Async.autoRetry(...);

// or
import { Async as LibAsync } from '@litert/utils';
LibAsync.autoRetry(...);
```

## Exports

### Classes

| Name | Description |
|------|-------------|
| [`AbortTimeoutController`](./classes/AbortTimeoutController.md) | An `AbortController` that automatically fires after a configurable timeout. |
| [`PromiseController<T>`](./classes/PromiseController.md) | Decouples a Promise's `resolve`/`reject` functions from the promise itself. |
| [`FiberController<T>`](./classes/FiberController.md) | Controls an async fiber lifecycle: run, sleep, resume, and abort. |
| [`BackgroundRunner`](./classes/BackgroundRunner.md) | Runs async callbacks in the background without blocking the calling fiber. |

### Functions

| Name | Description |
|------|-------------|
| [`sleep`](./functions/sleep.md) | Delays for the given number of milliseconds, optionally abortable. |
| [`withTimeout`](./functions/withTimeout.md) | Wraps a Promise or async function with a timeout. |
| [`withAbortSignal`](./functions/withAbortSignal.md) | Wraps a Promise or async function with an `AbortSignal`. |
| [`autoRetry`](./functions/autoRetry.md) | Automatically retries a failing async function with configurable backoff. |
| [`createExponentialBackoffDelayGenerator`](./functions/createExponentialBackoffDelayGenerator.md) | Creates an exponential backoff delay generator. |
| [`fullJitter`](./functions/fullJitter.md) | Applies a full-jitter effect to a retry delay. |
| [`equalJitter`](./functions/equalJitter.md) | Applies an equal-jitter effect to a retry delay. |
| [`compositeRetryDelayGenerator`](./functions/compositeRetryDelayGenerator.md) | Composes a delay generator with jitter and a maximum delay cap. |

### Errors

| Name | Description |
|------|-------------|
| [`E_TIMEOUT`](./Errors.md#e_timeout) | Thrown when an async operation exceeds the configured timeout. |
| [`E_ABORTED`](./Errors.md#e_aborted) | Thrown when an async operation is aborted via an `AbortSignal`. |
| [`E_FIBER_EXITED`](./Errors.md#e_fiber_exited) | Thrown when attempting to interact with a fiber that has already exited. |

### Typings

See [Typings.md](./Typings.md) for shared interfaces.

| Name | Description |
|------|-------------|
| [`IPromiseResolver<T>`](./Typings.md#ipromiseresolver) | Function type for a Promise resolver. |
| [`IPromiseRejecter<T>`](./Typings.md#ipromiserejecter) | Function type for a Promise rejecter. |
| [`IRetryDelayGenerator`](./Typings.md#iretrydelaygenerator) | Type for a retry delay generator function. |
| [`IRetryDelayJitterFunction`](./Typings.md#iretrydelayjitterfunction) | Type for a jitter function applied to retry delays. |
| [`IRetryDelayOptions`](./Typings.md#iretrydelayoptions) | Options for `compositeRetryDelayGenerator`. |
