#!/usr/bin/env node
/**
 * Generates docs/website/typedoc-sidebar.json for VitePress.
 *
 * Scans docs/en/namespaces/ and builds a sidebar with one group per namespace.
 * Each namespace may contain these top-level sections only:
 *   Overview  -> README.md
 *   Typings   -> Typings.md
 *   Errors    -> Errors.md
 *   Functions -> functions/ subdirectory (one .md per function)
 *   Classes   -> classes/ subdirectory (one .md per class)
 *
 * Usage:
 *   node utils/generate-sidebar.js
 */

'use strict';

const fs    = require('node:fs');
const path  = require('node:path');

const ROOT       = path.resolve(__dirname, '..');
const NAMESPACES = path.join(ROOT, 'docs', 'en', 'namespaces');
const OUTPUT     = path.join(ROOT, 'docs', 'website', 'typedoc-sidebar.json');

function namespaceTitle(name) {
    return name
        .split('-')
        .map(part => part === 'ts' ? 'TS' : part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function buildLink(nsDir, relPath) {
    const withoutExt = relPath.replace(/\.md$/, '');
    const base = `/en/api/namespaces/${nsDir}/`;
    if (withoutExt === 'README') return base;
    return base + withoutExt;
}

function collectSubDirItems(nsDir, subDir, absSubDir) {
    if (!fs.existsSync(absSubDir)) return [];
    return fs
        .readdirSync(absSubDir, { withFileTypes: true })
        .filter(e => e.isFile() && e.name.endsWith('.md'))
        .map(e => ({
            text: e.name.replace(/\.md$/, ''),
            link: buildLink(nsDir, `${subDir}/${e.name}`),
        }))
        .sort((a, b) => a.text.localeCompare(b.text));
}

function buildNamespaceItems(nsDir, absDir) {
    const items = [];

    if (fs.existsSync(path.join(absDir, 'README.md'))) {
        items.push({ text: 'Overview', link: buildLink(nsDir, 'README.md') });
    }

    if (fs.existsSync(path.join(absDir, 'Typings.md'))) {
        items.push({ text: 'Typings', link: buildLink(nsDir, 'Typings.md') });
    }

    if (fs.existsSync(path.join(absDir, 'Errors.md'))) {
        items.push({ text: 'Errors', link: buildLink(nsDir, 'Errors.md') });
    }

    const fnItems = collectSubDirItems(nsDir, 'functions', path.join(absDir, 'functions'));
    if (fnItems.length > 0) {
        items.push({ text: 'Functions', collapsed: true, items: fnItems });
    }

    const clsItems = collectSubDirItems(nsDir, 'classes', path.join(absDir, 'classes'));
    if (clsItems.length > 0) {
        items.push({ text: 'Classes', collapsed: true, items: clsItems });
    }

    return items;
}

function buildSidebar() {
    const nsDirs = fs
        .readdirSync(NAMESPACES, { withFileTypes: true })
        .filter(e => e.isDirectory())
        .sort((a, b) => a.name.localeCompare(b.name));

    return nsDirs.map(({ name }) => ({
        text: namespaceTitle(name),
        collapsed: true,
        items: buildNamespaceItems(name, path.join(NAMESPACES, name)),
    }));
}

const sidebar = buildSidebar();
fs.writeFileSync(OUTPUT, JSON.stringify(sidebar, null, 2) + '\n', 'utf8');
console.log(`Sidebar written to ${path.relative(ROOT, OUTPUT)} (${sidebar.length} namespaces)`);
