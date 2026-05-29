# Namespace `String`

String utilities for validation, formatting, transformation, and parsing.

## Install

Use this namespace only:

```bash
npm i @litert/utils-string
```

Or install the full bundle:

```bash
npm i @litert/utils
```

And then import from it.

```ts
import * as LibUtils from '@litert/utils';
LibUtils.String.nameCase(str);

// or
import { String as LibString } from '@litert/utils';
LibString.nameCase(str);
```

## Exports

### Classes

| Name | Description |
|------|-------------|
| [`UnitParser`](./classes/UnitParser.md) | Extracts a numeric value and a unit name from a string using a configurable format. |
| [`WildcardCompiler`](./classes/WildcardCompiler.md) | Compiles shell-style wildcard patterns into `RegExp` strings or `RegExp` objects. |

### Functions

| Name | Description |
|------|-------------|
| [`includeEvilWhitespaceChars`](./functions/includeEvilWhitespaceChars.md) | Checks if a string contains invisible "evil" whitespace characters. |
| [`replaceEvilWhitespaceChars`](./functions/replaceEvilWhitespaceChars.md) | Replaces invisible "evil" whitespace characters. |
| ~~[`includeEvilSpaceChars`](./functions/includeEvilSpaceChars.md)~~ | ⚠️ Deprecated alias for `includeEvilWhitespaceChars`. |
| ~~[`replaceEvilSpaceChars`](./functions/replaceEvilSpaceChars.md)~~ | ⚠️ Deprecated alias for `replaceEvilWhitespaceChars`. |
| [`htmlEscape`](./functions/htmlEscape.md) | Escapes HTML special characters in a string. |
| [`isEmailAddress`](./functions/isEmailAddress.md) | Validates an email address string. |
| [`splitIntoLines`](./functions/splitIntoLines.md) | Splits a string by EOL characters into an array of lines. |
| [`toUnixString`](./functions/toUnixString.md) | Converts all line endings to Unix-style (`\n`). |
| [`toWindowsString`](./functions/toWindowsString.md) | Converts all line endings to Windows-style (`\r\n`). |
| [`toMacString`](./functions/toMacString.md) | Converts all line endings to Mac-style (`\r`). |
| [`isUpperSnakeCase`](./functions/isUpperSnakeCase.md) | Checks if a string is in `UPPER_SNAKE_CASE` format. |
| [`isLowerSnakeCase`](./functions/isLowerSnakeCase.md) | Checks if a string is in `lower_snake_case` format. |
| [`isUpperCamelCase`](./functions/isUpperCamelCase.md) | Checks if a string is in `UpperCamelCase` format. |
| [`isPascalCase`](./functions/isPascalCase.md) | Alias for `isUpperCamelCase`. Checks PascalCase format. |
| [`isLowerCamelCase`](./functions/isLowerCamelCase.md) | Checks if a string is in `lowerCamelCase` format. |
| [`random`](./functions/random.md) | Generates a random string of specified length from a charset. |
| [`parseKeyValue`](./functions/parseKeyValue.md) | Parses a key-value expression like `key=value` into a `[key, value]` tuple. |
| [`parseBooleanValue`](./functions/parseBooleanValue.md) | Parses a string into a boolean value using a configurable mapping table. |
| [`regexpEscape`](./functions/regexpEscape.md) | Escapes literal text for safe use inside a `RegExp`; uses `RegExp.escape` when available. |
| [`toChunks`](./functions/toChunks.md) | Splits a string into equal-sized chunks (left to right). |
| [`toChunksBackward`](./functions/toChunksBackward.md) | Splits a string into equal-sized chunks (right to left). |
