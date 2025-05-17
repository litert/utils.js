/**
 * Copyright 2025 Angus.Fenying <fenying@litert.org>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * The interface for unit information.
 */
export interface IUnit<T extends string | number> {

    /**
     * The name of the unit.
     */
    name: T;

    /**
     * The factor of the unit, relative to the base unit.
     */
    factor: number;
}

export interface IUnitConverterOptions<T extends string | number> {

    /**
     * The base unit of the converter, which is the reference unit to other units.
     */
    baseUnit: T;

    /**
     * The other units supported by this converter, excluding the base unit.
     *
     * The unit ratios are calculated in order of the array elements, each unit is `factor` times of the previous unit.
     *
     * @example [ { name: "dm", factor: 10 }, { name: "m", factor: 10 } ]
     */
    units: Array<IUnit<T>>;
}

export class UnitConverter<T extends string | number> {

    private readonly _unitConverts: Record<string, number> = {};

    /**
     * This method helps create a sequence of units, multiplied by the same factor.
     *
     * So each unit is `factor` times of the previous unit, while the first unit is `factor` times
     * of the base unit.
     *
     * @param units     The list of unit names (or symbols) to be converted.
     * @param factor    The factor for the conversion.
     *
     * @returns The list of unit objects.
     *
     * @example `makeUnitsByFactor(["kb", "mb", "gb", "tb"], 1024)` where `byte` is the base unit
     */
    public static makeUnitsByFactor<T extends string | number>(
        units: T[],
        factor: number,
    ): Array<IUnit<T>> {

        const ret: Array<IUnit<T>> = [];

        for (let i = 0, f = factor; i < units.length; ++i) {

            ret.push({
                name: units[i],
                factor: f,
            });

            f *= factor;
        }

        return ret;
    }

    public constructor(opts: IUnitConverterOptions<T>) {

        const units = [ { name: opts.baseUnit, factor: 1 }, ...opts.units ];

        for (let i = 0; i < units.length; ++i) {

            const s = units[i];

            for (let j = i; j < units.length; ++j) {

                const d = units[j];

                const s2d = `${s.name}->${d.name}`;
                const d2s = `${d.name}->${s.name}`;

                if (this._unitConverts[s2d] || this._unitConverts[d2s]) {

                    throw new RangeError(`Duplicated unit "${d.name}".`);
                }

                if (s.name === d.name) {

                    this._unitConverts[s2d] = 1;
                    this._unitConverts[d2s] = 1;
                    continue;
                }

                if (d.factor <= 0) {

                    throw new RangeError(`The factor of unit "${s.name}" to "${d.name}" must be greater than 0.`);
                }

                this._unitConverts[d2s] = d.factor * this._unitConverts[`${opts.baseUnit}->${s.name}`];
                this._unitConverts[s2d] = 1 / this._unitConverts[d2s];
            }
        }
    }

    /**
     * Convert a value from one unit to another.
     *
     * @param value     The value to be converted.
     * @param from      The unit that the value currently is in.
     * @param to        The unit that the value should be converted to.
     *
     * @returns The converted value, in the target unit.
     *
     * @example `convert(1.23, "m", "cm") returns 123`.
     */
    public convert(
        value: number,
        from: T,
        to: T,
    ): number {

        if (from === to) {

            return value;
        }

        const key = `${from}->${to}`;

        return value * this._unitConverts[key];
    }
}
