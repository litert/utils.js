# Class: `BatchBuffer<T>`

> **Package:** `@litert/concurrent`
> **Import path:** `@litert/concurrent`
> **Source:** [packages/partials/concurrent/src/Classes/BatchBuffer.ts](https://github.com/litert/utils.js/blob/master/packages/partials/concurrent/src/Classes/BatchBuffer.ts)

Accumulates items pushed one-by-one (or as arrays) and delivers them in batches
to a callback. The flush is triggered either when the buffer reaches `maxSize` or
when the debounce timer fires (whichever comes first).

Internally backed by a [`DebounceController`](./DebounceController.md), so
the same `delayMs` / `maxDelayMs` semantics apply.

---

## Constructor

```ts
new BatchBuffer<T>(opts: IBatchBufferOptions<T>)
```

See [`IBatchBufferOptions<T>`](#interface-ibatchbufferoptions).

---

## Methods

### `push(item)`

```ts
push(item: T | T[]): void
```

Adds one item or an array of items to the buffer.

- If the buffer size reaches or exceeds `maxSize` after the push, the callback is
  invoked immediately with all buffered items, bypassing the debounce timer.
- If an empty array is passed, it is ignored.

| Parameter | Type | Description |
| --- | --- | --- |
| `item` | `T \| T[]` | The item(s) to buffer |

---

## Scoped Types

### Interface `IBatchBufferOptions<T>`

> Source: [BatchBuffer.ts](https://github.com/litert/utils.js/blob/master/packages/partials/concurrent/src/Classes/BatchBuffer.ts)

```ts
import type { IBatchBufferOptions } from '@litert/concurrent';
```

```ts
interface IBatchBufferOptions<T> extends Pick<IDebounceOptions, 'delayMs' | 'maxDelayMs'> {
    maxSize: number;
    callback: (items: T[]) => void;
}
```

| Property | Type | Description |
| --- | --- | --- |
| `delayMs` | `number` | Flush delay in milliseconds (from last `push()`) |
| `maxDelayMs` | `number?` | Max flush delay from the first `push()` after an empty buffer |
| `maxSize` | `number` | Flush immediately when buffer reaches this count |
| `callback` | `(items: T[]) => void` | Receives the flushed batch |

---

## Example

```ts
import { BatchBuffer } from '@litert/concurrent';

const buffer = new BatchBuffer<number>({
    delayMs: 1000,
    maxSize: 5,
    callback: (items) => {
        console.log('Processing batch:', items);
    },
});

buffer.push(1);
buffer.push(2);
buffer.push([3, 4, 5]); // Buffer full → callback called immediately with [1,2,3,4,5]

buffer.push(6);
// After 1 second of inactivity → callback called with [6]
```
