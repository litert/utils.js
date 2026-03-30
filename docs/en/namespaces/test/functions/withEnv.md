# Function `withEnv`

> **Package:** `@litert/utils-test`
> **Source:** [packages/partials/test/src/Functions/WithEnv.ts](https://github.com/litert/utils.js/blob/master/packages/partials/test/src/Functions/WithEnv.ts)

Temporarily sets environment variables for the duration of a callback, then restores the original values when the callback completes. This function supports both synchronous and asynchronous callbacks.

When the callback returns a `Promise`, environment variables are restored after the promise settles (either fulfills or rejects). When the callback is synchronous, environment variables are restored immediately after the callback returns or throws.

---

## Import

```ts
import { withEnv } from '@litert/utils-test';
```

---

## Signature

```ts
function withEnv<T extends () => any>(
    env: IDict,
    cb: T,
): ReturnType<T>;
```

Where `IDict` is from `@litert/utils-ts-types`:

```ts
type IDict<T = any, TKey extends string | number | symbol = string | number | symbol> = Record<TKey, T>;
```

---

## Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `env` | `IDict` | An object whose keys are environment variable names and whose values are the values to set for the duration of the callback |
| `cb` | `T` | The callback function to execute with the specified environment variables set |

---

## Return Value

Returns `ReturnType<T>` — the exact value that `cb` returns. If `cb` is async, a `Promise` is returned that settles with the same value or rejection as the callback.

---

## Error Handling

Any error thrown by `cb` is re-thrown to the caller after the environment variables have been restored to their original values.

---

## Examples

### Synchronous callback

```ts
import { withEnv } from '@litert/utils-test';

withEnv({ NODE_ENV: 'test', DEBUG: '1' }, () => {
    console.log(process.env.NODE_ENV); // 'test'
    console.log(process.env.DEBUG);    // '1'
});

// process.env.NODE_ENV and process.env.DEBUG are restored to their previous values here
```

### Asynchronous callback

```ts
import { withEnv } from '@litert/utils-test';

const result = await withEnv({ NODE_ENV: 'production' }, async () => {
    await someAsyncOperation();
    return process.env.NODE_ENV;
});

// process.env.NODE_ENV is restored to its previous value here
console.log(result); // 'production'
```
