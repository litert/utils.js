# Function `htmlEscape`

Source: [Html.ts](https://github.com/litert/utils.js/blob/master/packages/partials/string/src/Functions/Html.ts)

Escapes HTML special characters in a string, replacing them with their HTML entity equivalents. Optionally, additional custom character replacements can be applied after the built-in escaping.

Built-in replacements: `&` → `&amp;`, `<` → `&lt;`, `>` → `&gt;`, `"` → `&quot;`, `'` → `&#39;`.

[TOC]

## Import

```ts
import { htmlEscape } from '@litert/utils-string';
```

## Signature

```ts
function htmlEscape(
    text: string,
    extraReplacement?: ReadonlyArray<readonly [string, string]>,
): string;
```

## Parameters

- Parameter `text: string`

  The input string to escape.

- Parameter `extraReplacement?: ReadonlyArray<readonly [string, string]>`

  Optional list of additional `[from, to]` replacement pairs applied after the built-in escaping. Each pair replaces all occurrences of the `from` string with the `to` string.

## Return Value

The escaped string.

## Examples

```ts
import { htmlEscape } from '@litert/utils-string';

htmlEscape('<script>alert("XSS")</script>');
// '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'

htmlEscape("It's a <b>test</b>");
// 'It&#39;s a &lt;b&gt;test&lt;/b&gt;'

// Custom extra replacements
htmlEscape('Hello World', [[' ', '&nbsp;']]);
// 'Hello&nbsp;World'
```
