# LiteRT/Utils-String

[![Strict TypeScript Checked](https://badgen.net/badge/TS/Strict "Strict TypeScript Checked")](https://www.typescriptlang.org)
[![npm version](https://img.shields.io/npm/v/@litert/utils-string.svg?colorB=brightgreen)](https://www.npmjs.com/package/@litert/utils-string "Stable Version")
[![License](https://img.shields.io/npm/l/@litert/utils-string.svg?maxAge=2592000?style=plastic)](https://github.com/litert/utils/blob/master/LICENSE)
[![node](https://img.shields.io/node/v/@litert/utils-string.svg?colorB=brightgreen)](https://nodejs.org/dist/latest-v8.x/)
[![GitHub issues](https://img.shields.io/github/issues/litert/utils.js.svg)](https://github.com/litert/utils.js/issues)
[![GitHub Releases](https://img.shields.io/github/release/litert/utils.js.svg)](https://github.com/litert/utils.js/releases "Stable Release")

The string utility functions/classes/constants for JavaScript/TypeScript.

## Requirement

- TypeScript v5.0.0 (or newer)
- Node.js v18.0.0 (or newer)

## Installation

```sh
npm i @litert/utils-string --save
```
## Features

### Classes

- `class UnitParser`

    A helper class for extracting the value and the unit from a string, by the given format.

### Functions

- `function includeEvilSpaceChars(str: string): boolean;`

    Check if the string contains some evil space characters, including:

    - Unicode `\u0000-\u0008`
    - Unicode `\u000B-\u000C`
    - Unicode `\u000E-\u001F`
    - Unicode `\u0080-\u00A0`
    - Unicode `\u2000-\u200F`

- `function replaceEvilSpaceChars(str: string, to: string = ''): string;`

    Replace the evil space characters in the string.

- `function htmlEscape(text: string, extraReplacement?: Array<[from: string, to: string]>): string;`

    Escape the HTML special characters in the string.

    The built-in replacements are:

    - `&` to `&amp;`
    - `<` to `&lt;`
    - `>` to `&gt;`
    - `"` to `&quot;`
    - `'` to `&#39;`

    Some extra replacements can be passed in the `extraReplacement` parameter.

- `function splitIntoLines(text: string, eol: string | RegExp = /\r\n|\r|\n/): string[];`

    Split the string into lines.

    The default EOL is `/\r\n|\r|\n/`, but you can pass in a custom EOL string or a regular expression.

- `function toUnixString(text: string): string;`

    Convert the string to a Unix-style string, using `\n` as the EOL.

- `function toWindowsString(text: string): string;`

    Convert the string to a Windows-style (DOS-style) string, using `\r\n` as the EOL.

- `function toMacString(text: string): string;`

    Convert the string to a MacOS-style string, using `\r` as the EOL.

- `function random(length: number, charset: string = DEFAULT_RANDOM_CHARSET): string;`

    Generate a random string with the specified length and charset.

    The default charset is `0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`.

- `function regexpEscape(str: string): string;`

    Escape a string for use in a regular expression, all below characters will be escaped.

    `[.*+?^${}()|[\]/\\]`

### Constants

- `const DEFAULT_RANDOM_CHARSET: string;`

    The default charset for the `random` function.

- `enum ERandomStringCharset`

    The enum for the charset of the `random` function.

    - `UPPER_ALPHA`: `ABCDEFGHIJKLMNOPQRSTUVWXYZ`
    - `LOWER_ALPHA`: `abcdefghijklmnopqrstuvwxyz`
    - `DEC_DIGIT`: `0123456789`
    - `UPPER_HEX_DIGIT`: `0123456789ABCDEF`
    - `LOWER_HEX_DIGIT`: `0123456789abcdef`

    > You can combine the charset by concatenating them as a string, e.g. `ERandomStringCharset.UPPER_ALPHA + ERandomStringCharset.LOWER_ALPHA`.

## License

This library is published under [Apache-2.0](./LICENSE) license.
