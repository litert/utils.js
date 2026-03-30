# Errors — `ts-types`

Source: [Errors.ts](https://github.com/litert/utils.js/blob/master/packages/partials/ts-types/src/Errors.ts)

[TOC]

## Import

```ts
import { UtilityError } from '@litert/utils-ts-types';
```

---

## `UtilityError`

The base error class for all errors thrown by `@litert/utils.js` utilities. Carries a structured `context` object of type `TCtx` for additional diagnostic data, and an optional `origin` value for the underlying cause. All other utility packages extend this class to define their own specific error types.

```ts
class UtilityError<TCtx extends IDict = IDict> extends Error {
    readonly context: TCtx;
    readonly origin: unknown;

    constructor(
        name: string,
        message: string,
        context: TCtx,
        origin?: unknown,
    );
}
```

### Inheritance

```
Error → UtilityError
```

### Constructor

```ts
new UtilityError(name, message, context, origin?)
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | `string` | — | The name of the error. Assigned to `this.name`, overriding the default `Error.name`. |
| `message` | `string` | — | The human-readable error message. Passed to `super()` and accessible via `this.message`. |
| `context` | `TCtx` | — | Structured context object providing additional diagnostic information about the error. |
| `origin` | `unknown` | `null` | The original cause of the error, if any. |

### Properties

| Property | Type | Description |
| --- | --- | --- |
| `name` | `string` | The name of the error, as supplied to the constructor. Overrides the default `Error.name`. |
| `message` | `string` | The human-readable error message. Inherited from `Error`. |
| `context` | `TCtx` | Structured context object providing additional diagnostic information about the error. The shape is defined by the `TCtx` type parameter. |
| `origin` | `unknown` | The original cause of the error, or `null` if none was provided. |

`TCtx` is constrained to [`IDict`](./Typings.md#idict), defined as:

```ts
type IDict<T = any, TKey extends string | number | symbol = string | number | symbol> = Record<TKey, T>;
```

### Usage

```ts
import { UtilityError } from '@litert/utils-ts-types';

// Extending UtilityError to define a package-specific error type
interface IInvalidInputContext {
    paramName: string;
    received: unknown;
}

class InvalidInputError extends UtilityError<IInvalidInputContext> {
    public constructor(paramName: string, received: unknown) {
        super(
            'InvalidInputError',
            `Invalid value for parameter "${paramName}".`,
            { paramName, received },
        );
    }
}

// Catching and inspecting a UtilityError
try {
    throw new InvalidInputError('timeout', -1);
} catch (e) {
    if (e instanceof UtilityError) {
        console.error(`[${e.name}] ${e.message}`);
        console.error('Context:', e.context);
        if (e.origin !== null) {
            console.error('Caused by:', e.origin);
        }
    }
}
```
