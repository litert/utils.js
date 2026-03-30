# Class `UnitConverter<T>`

Source: [UnitConverter.ts](https://github.com/litert/utils.js/blob/master/packages/partials/number/src/Classes/UnitConverter.ts)

Converts numeric values between a configurable set of related units. You define a base unit and a series of derived units by specifying conversion factors; the class pre-computes all pairwise conversion ratios at construction time.

[TOC]

## Import

```ts
import { Units } from '@litert/utils-number';
const { UnitConverter } = Units;
```

## Constructor

```ts
new UnitConverter<T extends string | number>(opts: IUnitConverterOptions<T>)
```

### Parameters

- Parameter `opts: IUnitConverterOptions<T>`

  Configuration object specifying the base unit and all derived units with their factors. See [`IUnitConverterOptions`](#interface-iunitconverteroptions).

### Error Handling

- `RangeError` — Thrown if the same unit name appears more than once, or if a unit factor is `<= 0`.

## Static Methods

### `makeUnitsByFactor`

```ts
static makeUnitsByFactor<T extends string | number>(units: T[], factor: number): Array<IUnit<T>>;
```

Helper that builds a list of [`IUnit`](#interface-iunit) objects where each successive unit is `factor` times the previous one (starting from the base unit). Useful for geometric series like byte units (`1024`) or metric prefixes (`10`).

#### Parameters

- Parameter `units: T[]`

  An ordered list of unit names or symbols.

- Parameter `factor: number`

  The constant multiplier between each consecutive unit.

#### Return Value

An array of `IUnit<T>` objects ready to be passed as `opts.units`.

#### Example

```ts
import { Units } from '@litert/utils-number';
const { UnitConverter } = Units;

// Constructs [{ name: 'kb', factor: 1024 }, { name: 'mb', factor: 1048576 }, ...]
const units = UnitConverter.makeUnitsByFactor(['kb', 'mb', 'gb', 'tb'], 1024);
```

## Instance Methods

### `convert`

```ts
convert(value: number, from: T, to: T): number;
```

Converts `value` from the `from` unit to the `to` unit, returning the result.

#### Parameters

- Parameter `value: number`

  The numeric value to convert.

- Parameter `from: T`

  The unit of the source value.

- Parameter `to: T`

  The target unit.

#### Return Value

The converted numeric value.

## Scoped Types

### Interface `IUnit<T>`

> Source: [UnitConverter.ts](https://github.com/litert/utils.js/blob/master/packages/partials/number/src/Classes/UnitConverter.ts)

```ts
import type { Units } from '@litert/utils-number';
// IUnit is accessible as Units.IUnit
```

Describes a single unit with a name and a conversion factor relative to the base unit of a `UnitConverter`.

```ts
interface IUnit<T extends string | number> {
    name: T;
    factor: number;
}
```

| Property | Type | Description |
| --- | --- | --- |
| `name` | `T` | The name or symbol of the unit (e.g., `'km'`, `'gb'`) |
| `factor` | `number` | Conversion factor relative to the base unit — how many base units equal 1 of this unit |

---

### Interface `IUnitConverterOptions<T>`

> Source: [UnitConverter.ts](https://github.com/litert/utils.js/blob/master/packages/partials/number/src/Classes/UnitConverter.ts)

```ts
import type { Units } from '@litert/utils-number';
// IUnitConverterOptions is accessible as Units.IUnitConverterOptions
```

Constructor options for `UnitConverter<T>`.

```ts
interface IUnitConverterOptions<T extends string | number> {
    baseUnit: T;
    units: Array<IUnit<T>>;
}
```

| Property | Type | Description |
| --- | --- | --- |
| `baseUnit` | `T` | The reference unit; all other unit factors are relative to this |
| `units` | `Array<IUnit<T>>` | Derived units, each with an absolute factor relative to `baseUnit`. Use [`UnitConverter.makeUnitsByFactor`](#makeunitsbyfactor) to generate geometric series |

---

## Examples

### Byte units

```ts
import { Units } from '@litert/utils-number';
const { UnitConverter } = Units;

type ByteUnit = 'byte' | 'kb' | 'mb' | 'gb' | 'tb';

const bytes = new UnitConverter<ByteUnit>({
    baseUnit: 'byte',
    units: UnitConverter.makeUnitsByFactor<ByteUnit>(['kb', 'mb', 'gb', 'tb'], 1024),
});

console.log(bytes.convert(1, 'gb', 'mb'));   // 1024
console.log(bytes.convert(1024, 'mb', 'gb')); // 1
console.log(bytes.convert(1, 'tb', 'byte')); // 1099511627776
```

### Length units

```ts
import { Units } from '@litert/utils-number';
const { UnitConverter } = Units;

type LengthUnit = 'cm' | 'dm' | 'm' | 'km';

const length = new UnitConverter<LengthUnit>({
    baseUnit: 'cm',
    units: [
        { name: 'dm', factor: 10 },      // 1 dm = 10 cm
        { name: 'm', factor: 100 },      // 1 m = 100 cm
        { name: 'km', factor: 100000 },  // 1 km = 100000 cm
    ],
});

console.log(length.convert(1, 'm', 'cm'));   // 100
console.log(length.convert(1.5, 'km', 'm')); // 1500
```
