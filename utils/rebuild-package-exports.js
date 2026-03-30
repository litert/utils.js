#!/usr/bin/env node
/**
 * Rebuilds the `exports` field in every package.json under packages/, and
 * generates Namespace re-export .ts files for the bundle package.
 *
 * Usage:
 *   node utils/rebuild-package-exports.js
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT        = path.resolve(__dirname, '..');
const PARTIALS_DIR = path.join(ROOT, 'packages', 'partials');
const BUNDLE_DIR   = path.join(ROOT, 'packages', 'bundle');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const LICENSE_HEADER = `\
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
 */`;

/**
 * Build a single export entry with ESM + TypeScript types conditions.
 * Both `import` and `require` point to the same ESM files.
 *
 * @param {string} jsPath   Relative path to the .js file (e.g. './lib/index.js')
 * @param {string} dtsPath  Relative path to the .d.ts file
 */
function makeEntry(jsPath, dtsPath) {
    return {
        default: {
            types:   dtsPath,
            default: jsPath,
        },
    };
}

/**
 * Scan `dir` for public .ts source files and return their base names (no ext).
 * Excludes test files (*.test.ts) and anything starting with '_' (internals).
 * Non-.ts entries (sub-directories, etc.) are automatically skipped.
 *
 * @param {string} dir
 * @returns {string[]}
 */
function scanTsBasenames(dir) {
    if (!fs.existsSync(dir)) return [];

    return fs.readdirSync(dir)
        .filter(f => f.endsWith('.ts') && !f.endsWith('.test.ts') && !f.startsWith('_'))
        .map(f => path.basename(f, '.ts'));
}

/**
 * Write `exports` into a package.json, preserving all other fields.
 *
 * @param {string} pkgDir
 * @param {object} exportsMap
 */
function updatePackageJson(pkgDir, exportsMap) {
    const pkgPath = path.join(pkgDir, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

    pkg.exports = exportsMap;

    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');
    console.log(`  Updated  ${path.relative(ROOT, pkgPath)}`);
}

// ---------------------------------------------------------------------------
// Partial packages
// ---------------------------------------------------------------------------

/**
 * Build the exports map for a partial package by scanning its src/ directory.
 *
 * Generated keys:
 *   "."                  -> ./lib/index.js
 *   "./class/<Name>"     -> ./lib/Classes/<Name>.js
 *   "./functions/<Name>" -> ./lib/Functions/<Name>.js
 *
 * @param {string} pkgDir
 * @returns {object}
 */
function buildPartialExports(pkgDir) {
    const srcDir = path.join(pkgDir, 'src');
    const exports = {
        '.': makeEntry('./lib/index.js', './lib/index.d.ts'),
    };

    for (const name of scanTsBasenames(path.join(srcDir, 'Classes'))) {
        exports[`./class/${name}`] = makeEntry(
            `./lib/Classes/${name}.js`,
            `./lib/Classes/${name}.d.ts`,
        );
    }

    for (const name of scanTsBasenames(path.join(srcDir, 'Functions'))) {
        exports[`./functions/${name}`] = makeEntry(
            `./lib/Functions/${name}.js`,
            `./lib/Functions/${name}.d.ts`,
        );
    }

    return exports;
}

// ---------------------------------------------------------------------------
// Bundle package
// ---------------------------------------------------------------------------

/**
 * Parse bundle/src/index.ts and return every `export * as Name from 'pkg'`
 * line as { namespace, pkg }.
 *
 * @returns {{ namespace: string, pkg: string }[]}
 */
function parseBundleNamespaces() {
    const indexPath = path.join(BUNDLE_DIR, 'src', 'index.ts');
    const content   = fs.readFileSync(indexPath, 'utf8');
    const result    = [];
    const re        = /^export \* as (\w+) from ['"]([^'"]+)['"]/gm;

    let m;
    while ((m = re.exec(content)) !== null) {
        result.push({ namespace: m[1], pkg: m[2] });
    }

    return result;
}

/**
 * Create (or overwrite) bundle/src/Namespaces/<Namespace>.ts, which simply
 * re-exports everything from the backing partial package.
 *
 * @param {string} namespace  PascalCase namespace name, e.g. "Array"
 * @param {string} pkg        NPM package name, e.g. "@litert/utils-array"
 */
function writeNamespaceFile(namespace, pkg) {
    const nsDir   = path.join(BUNDLE_DIR, 'src', 'Namespaces');
    fs.mkdirSync(nsDir, { recursive: true });

    const filePath = path.join(nsDir, `${namespace}.ts`);
    const content  = `${LICENSE_HEADER}\n\nexport * from '${pkg}';\n`;

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  Created  ${path.relative(ROOT, filePath)}`);
}

/**
 * Build the exports map for the bundle package.
 *
 * Generated keys:
 *   "."                       -> ./lib/index.js
 *   "./namespaces/<Namespace>" -> ./lib/Namespaces/<Namespace>.js
 *
 * @param {{ namespace: string }[]} namespaces
 * @returns {object}
 */
function buildBundleExports(namespaces) {
    const exports = {
        '.': makeEntry('./lib/index.js', './lib/index.d.ts'),
    };

    for (const { namespace } of namespaces) {
        exports[`./namespaces/${namespace}`] = makeEntry(
            `./lib/Namespaces/${namespace}.js`,
            `./lib/Namespaces/${namespace}.d.ts`,
        );
    }

    return exports;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

console.log('Rebuilding package exports...\n');

// ── Partial packages ────────────────────────────────────────────────────────
console.log('Partial packages:');

for (const entry of fs.readdirSync(PARTIALS_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    const pkgDir     = path.join(PARTIALS_DIR, entry.name);
    const pkgJsonPath = path.join(pkgDir, 'package.json');

    if (!fs.existsSync(pkgJsonPath)) continue;

    console.log(`\n  [${entry.name}]`);
    updatePackageJson(pkgDir, buildPartialExports(pkgDir));
}

// ── Bundle package ──────────────────────────────────────────────────────────
console.log('\nBundle package:\n');
console.log('  [bundle]');

const namespaces = parseBundleNamespaces();

for (const { namespace, pkg } of namespaces) {
    writeNamespaceFile(namespace, pkg);
}

updatePackageJson(BUNDLE_DIR, buildBundleExports(namespaces));

console.log('\nDone.');
