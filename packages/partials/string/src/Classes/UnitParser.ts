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

import { regexpEscape } from '../Functions/RegexpEscape';

/**
 * The options for the units used in the UnitParser.
 */
export interface IUnitInfo {

    /**
     * The name of the unit.
     *
     * The name will not be changed even if `caseInsensitive` is set to `true`.
     */
    name: string;

    /**
     * The aliases of the unit.
     *
     * If the `caseInsensitive` option is set to `true`, the aliases will be converted to lower case.
     */
    aliases?: readonly string[];
}

/**
 * The options for the UnitParser.
 */
export interface IUnitParserOptions {

    /**
     * The format of the string to parse.
     *
     * Use placeholders `{value}` and `{unit}` to specify where the value and unit should be.
     *
     * @example "{value} {unit}"
     */
    format: string;

    /**
     * The list of units to parse.
     *
     * > If a `string` is provided, it will be converted to an object `{ name, aliases: [name] }`.
     * >
     * > So that the name will also be an alias.
     *
     * @example ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"]
     * @example ["cm", "m", "km", "in", "ft", "mi"]
     */
    units: ReadonlyArray<string | IUnitInfo>;

    /**
     * Whether to ignore case when matching the unit.
     *
     * The unit name in the parse result will be kept in the same case as the `unit` property.
     *
     * @default true
     */
    caseInsensitive?: boolean;

    /**
     * How many digits to allow after the decimal point.
     *
     * @default 2
     */
    maxDecimalPlaces?: number;
}

export interface IUnitParserResult {

    /**
     * The value of the unit.
     */
    value: string;

    /**
     * The unit (name) of the value.
     */
    unit: string;
}

/**
 * This class helps to extract a value and a unit from a string, by the given format.
 */
export class UnitParser {

    /**
     * The format of the string to parse.
     */
    public readonly format: string;

    /**
     * The names of the units to parse.
     */
    public readonly units: ReadonlyArray<Readonly<IUnitInfo>>;

    /**
     * Whether to ignore case when matching the unit.
     */
    public readonly caseInsensitive: boolean;

    /**
     * The maximum number of decimal places to allow.
     */
    public readonly maxDecimalPlaces: number;

    private readonly _regExp: RegExp;

    private readonly _unitMap: Record<string, string> = {};

    public constructor(opts: IUnitParserOptions) {

        this.caseInsensitive = opts.caseInsensitive ?? true;
        this.maxDecimalPlaces = opts.maxDecimalPlaces ?? 2;

        if (this.maxDecimalPlaces < 0 || !Number.isSafeInteger(this.maxDecimalPlaces)) {

            throw new RangeError('The maxDecimalPlaces property must be a non-negative integer.');
        }

        this.format = opts.format;

        this.units = this._prepareUnitNames(opts.units);

        this._regExp = this._buildRegExp();
    }

    private _prepareUnitNames(units: IUnitParserOptions['units']): ReadonlyArray<Readonly<IUnitInfo>> {

        if (!units.length) {

            throw new RangeError('The unitNames array must contain at least one element.');
        }

        let ret: Array<Required<IUnitInfo>> = units.map(i => ({
            name: typeof i === 'string' ? i : i.name,
            aliases: typeof i === 'string' ? [i] : [...(i.aliases ?? []), i.name],
        }));

        if (this.caseInsensitive) {

            for (const unit of ret) {

                for (let i = 0; i < unit.aliases.length; i++) {

                    (unit.aliases as string[])[i] = unit.aliases[i].toLowerCase();
                }
            }
        }

        for (const unit of ret) {

            for (const alias of unit.aliases) {

                if (this._unitMap[alias] && this._unitMap[alias] !== unit.name) {

                    throw new RangeError(`The alias "${alias}" is already used by the unit "${this._unitMap[alias]}".`);
                }

                this._unitMap[alias] = unit.name;
            }
        }

        return ret;
    }

    private _buildRegExp(): RegExp {

        let regexp = `^${this.format}$`;
        let tmp: string;

        tmp = regexp.replace(/\{value\}/i, this.maxDecimalPlaces > 1 ?
            `(?<value>\\d+([.]\\d{1,${this.maxDecimalPlaces}})?)` : '(?<value>\\d+)'
        );

        if (tmp === regexp) {

            throw new SyntaxError('The format must contain the {value} placeholder.');
        }

        regexp = tmp;

        tmp = regexp.replace(/\{unit\}/i, `(?<unit>(${Object.keys(this._unitMap).map(i => regexpEscape(i)).join('|')}))`);

        if (tmp === regexp) {

            throw new SyntaxError('The format must contain the {unit} placeholder.');
        }

        regexp = tmp;

        return new RegExp(regexp, this.caseInsensitive ? 'i' : '');
    }

    /**
     * Extract the value and unit from the given string.
     *
     * @param input         The string to parse.
     *
     * @returns An object containing the value and unit, or null if the string does not match the format.
     */
    public parse(input: string): IUnitParserResult | null {

        const match = this._regExp.exec(input);

        if (!match) {

            return null;
        }

        return {
            'value': match.groups!['value'],
            'unit': this._unitMap[this.caseInsensitive ? match.groups!['unit'].toLowerCase() : match.groups!['unit']],
        };
    }
}
