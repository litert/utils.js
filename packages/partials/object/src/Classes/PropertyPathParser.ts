/**
 * Copyright 2026 Angus.Fenying <fenying@litert.org>
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

enum EState {
    READING_SEGMENT_START,
    READING_IDENTIFIER,
    READING_DIGITS,
    READING_ESCAPED_CHAR,
    READING_BRACKET_START,
    READING_BRACKET_END,
}

enum EIntBase {
    BIN = 2,
    OCT = 8,
    DEC = 10,
    HEX = 16,
}

const DIGITS_IN_BASE: Record<EIntBase, Record<string, boolean>> = {
    [EIntBase.BIN]: { '0': true, '1': true, },
    [EIntBase.OCT]: {
        '0': true, '1': true, '2': true, '3': true,
        '4': true, '5': true, '6': true, '7': true,
    },
    [EIntBase.DEC]: {
        '0': true, '1': true, '2': true, '3': true, '4': true,
        '5': true, '6': true, '7': true, '8': true, '9': true,
    },
    [EIntBase.HEX]: {
        '0': true, '1': true, '2': true, '3': true, '4': true,
        '5': true, '6': true, '7': true, '8': true, '9': true,
        'a': true, 'b': true, 'c': true, 'd': true, 'e': true, 'f': true,
        'A': true, 'B': true, 'C': true, 'D': true, 'E': true, 'F': true,
    },
};

interface IContext {

    input: string;

    cursor: number;

    state: EState;

    stateStack: EState[];

    identifier: string;

    result: Array<string | number>;

    quoteMark?: '"' | '\'' | null;

    integerBase?: 16 | 10 | 8 | 2;
}

interface IStateProcessor {

    onChar(ctx: IContext): void;

    onEnding(ctx: IContext): void;
}

class ParserForEscapedChar implements IStateProcessor {

    public onChar(ctx: IContext): void {
        ctx.identifier += ctx.input[ctx.cursor];
        ctx.state = ctx.stateStack.pop()!;
    }

    public onEnding(ctx: IContext): void {

        throw new SyntaxError(`Unexpected end of property path: ${ctx.input}`);
    }
}

function savePropName(ctx: IContext): void {

    ctx.result.push(ctx.identifier);
    ctx.identifier = '';
}

class ParserForSegmentStart implements IStateProcessor {

    public onChar(ctx: IContext): void {

        const char = ctx.input[ctx.cursor];

        switch (char) {
            case '.':
                ctx.state = EState.READING_IDENTIFIER;
                break;
            case '[':
                ctx.state = EState.READING_BRACKET_START;
                break;
            default:
                throw new SyntaxError(`Invalid property path: ${ctx.input}`);
        }
    }

    public onEnding(): void { return; }
}

class ParserForIdentifier implements IStateProcessor {

    public onChar(ctx: IContext): void {

        const char = ctx.input[ctx.cursor];

        switch (char) {
            case '.':
                savePropName(ctx);
                break;
            case '\\':
                ctx.stateStack.push(ctx.state);
                ctx.state = EState.READING_ESCAPED_CHAR;
                break;
            case '[':
                // In '$.a["aaa[]"]` case, treat the `[` as part of the property name, not as the start of a bracket.]
                if (ctx.stateStack.length) {
                    ctx.identifier += char;
                    break;
                }
                savePropName(ctx);
                ctx.state = EState.READING_BRACKET_START;
                break;
            case ctx.quoteMark:
                if (ctx.stateStack.length) {
                    savePropName(ctx);
                    ctx.state = ctx.stateStack.pop()!;
                    break;
                }
                // should never reaches actually.
                ctx.identifier += char;
                break;
            default:
                ctx.identifier += char;
                break;
        }
    }

    public onEnding(ctx: IContext): void {

        if (ctx.stateStack.length) {
            throw new SyntaxError(`Unexpected end of property path: ${ctx.input}`);
        }

        savePropName(ctx);
    }
}

class ParserForBracketStart implements IStateProcessor {

    public onChar(ctx: IContext): void {
        const char = ctx.input[ctx.cursor];
        switch (char) {
            case '"':
            case '\'':
                ctx.quoteMark = char;
                /**
                 * Jump to READING_BRACKET_END state to read the property name in quotes,
                 * instead of going back to READING_BRACKET_START state,
                 * after the property name in quotes is read.
                 */
                ctx.stateStack.push(EState.READING_BRACKET_END);
                ctx.state = EState.READING_IDENTIFIER;
                break;
            case '0': case '1': case '2': case '3': case '4':
            case '5': case '6': case '7': case '8': case '9':
                ctx.identifier += char;
                /**
                 * Jump to READING_IDENTIFIER state to read the index value in bracket,
                 * instead of going back to READING_BRACKET_START state,
                 * after the index value in bracket is read.
                 */
                ctx.stateStack.push(EState.READING_SEGMENT_START);
                ctx.state = EState.READING_DIGITS;
                ctx.integerBase = 10;
                break;
            default:
                throw new SyntaxError(`Unexpected character in property path: ${char}`);
        }
    }

    public onEnding(ctx: IContext): void {

        throw new SyntaxError(`Unexpected end of property path: ${ctx.input}`);
    }
}

class ParserForDigits implements IStateProcessor {

    public onChar(ctx: IContext): void {

        const char = ctx.input[ctx.cursor];

        switch (char) {
            case ']':
                switch (ctx.integerBase) {
                    default:
                    case EIntBase.DEC:
                        ctx.result.push(parseInt(ctx.identifier, 10));
                        break;
                    case EIntBase.HEX:
                        ctx.result.push(parseInt(ctx.identifier.slice(2), 16));
                        break;
                    case EIntBase.OCT:
                        ctx.result.push(parseInt(ctx.identifier.slice(2), 8));
                        break;
                    case EIntBase.BIN:
                        ctx.result.push(parseInt(ctx.identifier.slice(2), 2));
                        break;
                }
                ctx.identifier = '';
                ctx.state = ctx.stateStack.pop()!;
                break;
            case 'o': case 'O':
                if (ctx.identifier === '0') {
                    ctx.identifier += char;
                    ctx.integerBase = EIntBase.OCT;
                }
                else {
                    throw new SyntaxError(`Unexpected character in property path: ${char} (position: ${ctx.cursor})`);
                }
                break;
            case 'x': case 'X':
                if (ctx.identifier === '0') {
                    ctx.identifier += char;
                    ctx.integerBase = EIntBase.HEX;
                }
                else {
                    throw new SyntaxError(`Unexpected character in property path: ${char} (position: ${ctx.cursor})`);
                }
                break;
            case 'b': case 'B':
                if (ctx.identifier === '0') {
                    ctx.identifier += char;
                    ctx.integerBase = EIntBase.BIN;
                    break;
                }
                else if (DIGITS_IN_BASE[ctx.integerBase!][char]) {
                    ctx.identifier += char;
                    break;
                }
                throw new SyntaxError(`Unexpected character in property path: ${char} (position: ${ctx.cursor})`);
            case '0': case '1': case '2': case '3': case '4':
            case '5': case '6': case '7': case '8': case '9':
            case 'a': case 'b': case 'c': case 'd': case 'e': case 'f':
            case 'A': case 'B': case 'C': case 'D': case 'E': case 'F':
                if (!DIGITS_IN_BASE[ctx.integerBase!][char]) {
                    throw new SyntaxError(`Unexpected character in property path: ${char} (position: ${ctx.cursor})`);
                }
                ctx.identifier += char;
                break;
            case '_':
            case ',':
                if (
                    DIGITS_IN_BASE[ctx.integerBase!][ctx.input[ctx.cursor + 1]] &&
                    DIGITS_IN_BASE[ctx.integerBase!][ctx.input[ctx.cursor - 1]]
                ) {
                    break;
                }
                throw new SyntaxError(`Unexpected character in property path: ${char} (position: ${ctx.cursor})`);
            default:
                throw new SyntaxError(`Unexpected character in property path: ${char} (position: ${ctx.cursor})`);
        }
    }

    public onEnding(ctx: IContext): void {

        throw new SyntaxError(`Unexpected end of property path: ${ctx.input}`);
    }
}

class ParserForBracketEnd implements IStateProcessor {

    public onChar(ctx: IContext): void {
        const char = ctx.input[ctx.cursor];
        ctx.quoteMark = null;
        switch (char) {
            case ']':
                ctx.state = EState.READING_SEGMENT_START;
                break;
            default:
                throw new SyntaxError(`Unexpected character in property path: ${char} (position: ${ctx.cursor})`);
        }
    }

    public onEnding(ctx: IContext): void {

        throw new SyntaxError(`Unexpected end of property path: ${ctx.input}`);
    }
}

/**
 * A helper class to parse the property path string into an array of property names.
 *
 * @example
 * ```ts
 * const parser = new PropertyPathParser();
 * parser.parse('$.a.b.c'); // returns ['a', 'b', 'c']
 * parser.parse('$.a["s.c"]'); // returns ['a', 's.c']
 * parser.parse('$'); // returns []
 * parser.parse('$.a[0]'); // returns ['a', 0]
 * parser.parse('$.a[1].s'); // returns ['a', 1, 's']
 * parser.parse('$.a.x.c'); // returns ['a', 'x', 'c']
 * ```
 */
export class PropertyPathParser {

    private readonly _processors: Record<EState, IStateProcessor> = {
        [EState.READING_SEGMENT_START]: new ParserForSegmentStart(),
        [EState.READING_IDENTIFIER]: new ParserForIdentifier(),
        [EState.READING_ESCAPED_CHAR]: new ParserForEscapedChar(),
        [EState.READING_BRACKET_START]: new ParserForBracketStart(),
        [EState.READING_DIGITS]: new ParserForDigits(),
        [EState.READING_BRACKET_END]: new ParserForBracketEnd(),
    };

    /**
     * Parse the property path string into an array of property names.
     * @param path The property path string.
     * @returns An array of property names or array indices. (Integers for array indices, strings for property names)
     */
    public parse(path: string): Array<string | number> {

        if (path === '$') {
            return [];
        }

        if (!path.startsWith('$')) {
            throw new SyntaxError(`Invalid property path: ${path}`);
        }

        const ctx: IContext = {
            'input': path,
            'cursor': 1,
            'state': EState.READING_SEGMENT_START,
            'stateStack': [],
            'identifier': '',
            'result': [],
        };

        for (; ctx.cursor < ctx.input.length; ctx.cursor++) {

            this._processors[ctx.state].onChar(ctx);
        }

        /**
         * Process the EOF case for the current state.
         */
        this._processors[ctx.state].onEnding(ctx);

        return ctx.result;
    }
}
