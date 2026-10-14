# The theme head script is its own file, inlined into `<head>` by a Vite plugin

Date: 2026-10-14 · Status: accepted · Supersedes the head-script paragraph of
`2026-10-10-theme-tokens-and-head-script.md`

## Context

The script that sets `<html data-theme>` before the first paint was inline code in `index.html`: the key was a
literal `'theme'`, with a comment pointing at `STORAGE_KEYS.THEME` and a comment there pointing back. The first
theme record declined a Vite plugin for it ("simplicity over a build step for one string"). The JS refactor has
no comments in `src/scripts/` or `index.html`, and inline code is outside lint and imports, so the answer changes.

## Decision

- **The script is `src/scripts/themeHead.js`**, a module that imports `STORAGE_KEYS` and `THEMES` from
  `constants.js`: no key literal, no paired comments, no inline code in `index.html`.
- **A small plugin in `vite.config.js` (`inline-theme-script`)** bundles it with esbuild, minifies it with terser
  and injects it as an inline `<script>` at the start of `<head>` through `transformIndexHtml`, the same in
  `yarn dev` and `yarn build`. `Object.freeze` is marked pure for terser: bundlers keep those calls, and without
  it every constant of `constants.js` would be inlined into the page.
- **What stays from the first record:** it is classic inline code because it runs before any module; it reads
  `localStorage` itself inside `try/catch`, only reads, falls back to `prefers-color-scheme`, and is the one read
  that skips `SafeStorage`. Not a precedent: any other early read needs its own record. After load
  `ThemeController` is the authority and resolves the theme by the same rule.
- **`esbuild` is an explicit dev dependency** (Vite already depends on it; the plugin imports it directly).
- Rejected: a nested Vite build per page load, stripping the `import` by hand (breaks the day the script imports
  anything else), keeping the literal and the paired comments, and a second constants file for the theme only.

## Consequences

- Renaming the key or a theme value in `constants.js` reaches the head script by itself.
- The inline script blocks parsing and must stay tiny: anything it imports ships inline, so it imports only
  what it reads.
- Each dev page load runs esbuild and terser on the file (milliseconds); an edit to the plugin needs a restart
  of the dev server.
