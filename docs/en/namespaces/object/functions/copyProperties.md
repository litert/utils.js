# Function `copyProperties`

Source: [CopyProperties.ts](https://github.com/litert/utils.js/blob/master/packages/partials/object/src/Functions/CopyProperties.ts)

Copies one or more named properties from a source object into a destination object. Properties whose value is `undefined` in the source are skipped.

This function is primarily a TypeScript ergonomics helper: it allows copying properties between two objects of the same type without running into TypeScript's strict property-assignment errors when both the destination and source are typed as `T`.

[TOC]

## Import

```ts
import { copyProperties } from '@litert/utils-object';
```

## Signature

```ts
function copyProperties<T extends IObject>(
    dst: T,
    src: Partial<T>,
    properties: Array<keyof T>,
): void;
```

## Parameters

- Parameter `dst: T`

  The destination object to copy properties into. Modified in place.

- Parameter `src: Partial<T>`

  The source object to read properties from. Only properties listed in `properties` with a non-`undefined` value are copied.

- Parameter `properties: Array<keyof T>`

  An array of property keys to copy.

## Return Value

`void`. The destination object is mutated directly.

## Examples

```ts
import { copyProperties } from '@litert/utils-object';

interface IConfig {
    host: string;
    port: number;
    timeout: number;
}

const config: IConfig = { host: 'localhost', port: 8080, timeout: 5000 };
const patch: Partial<IConfig> = { port: 9090, timeout: undefined };

copyProperties(config, patch, ['port', 'timeout']);
// config.port === 9090    (copied)
// config.timeout === 5000 (skipped — undefined in patch)
```
