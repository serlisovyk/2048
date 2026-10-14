# The theme head script is its own file, inlined into `<head>` by a Vite plugin

Date: 2026-10-14 · Status: superseded by `2026-10-14-theme-head-script-html-plugin.md` ·
Supersedes the head-script paragraph of `2026-10-10-theme-tokens-and-head-script.md`

## Context

The script that sets `<html data-theme>` before the first paint was inline code in `index.html`: the key was a
literal `'theme'`, with a comment pointing at `STORAGE_KEYS.THEME` and a comment there pointing back. The JS
refactor has no comments in `src/scripts/` or `index.html`, and inline code is outside lint, so the script moves
to a file. Importing the constants into it needs a bundler (esbuild, which Vite uses but the repo does not
declare); the author declined that dependency (2026-10-14).

## Decision

- **The script is `src/scripts/themeHead.js`**, a plain script with no imports, written as one block so its
  variables stay local. The key `'theme'` and the values `'light'` / `'dark'` are **literals on purpose**, the
  same as `STORAGE_KEYS.THEME` and `THEMES` in `constants.js`. The link is a written rule, not comments:
  `ai/rules/oop.md` says to change the key or a theme value in both places.
- **A small plugin in `vite.config.js` (`inline-theme-script`)** reads the file, minifies it with terser (already
  a dev dependency) and injects it as an inline `<script>` at the start of `<head>` through
  `transformIndexHtml`, the same in `yarn dev` and `yarn build`.
- **What stays from the first record:** it is classic inline code because it runs before any module; it reads
  `localStorage` itself inside `try/catch`, only reads, falls back to `prefers-color-scheme`, and is the one read
  that skips `SafeStorage`. Not a precedent: any other early read needs its own record. After load
  `ThemeController` is the authority and resolves the theme by the same rule.
- Rejected: a bundler in the plugin (a new dependency for two strings), a nested Vite build per page load,
  and stripping an `import` by hand (breaks the day the script imports anything else).

## Consequences

- Renaming the key or a theme value means editing `constants.js` and `themeHead.js`; if the script is
  forgotten the page shows the wrong theme for a frame and `ThemeController` corrects it, never a broken page.
- The inline script blocks parsing and stays tiny (a few hundred bytes); it imports nothing.
- Each dev page load minifies the file with terser (milliseconds); an edit to the plugin needs a restart of the
  dev server.
