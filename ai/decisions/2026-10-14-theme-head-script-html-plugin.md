# The theme head script is inlined into `<head>` by a plugin on `html-webpack-plugin`

Date: 2026-10-14 · Status: accepted · Supersedes `2026-10-14-theme-head-script-vite-plugin.md`

## Context

The head script was moved into its own file and inlined by a Vite plugin. The build is now Webpack
(`2026-10-14-webpack-instead-of-vite.md`), so only the mechanism changes; the rest of that record stays in force.

## Decision

- **The script is `src/scripts/themeHead.js`**: a plain script with no imports, written as one block. The key `'theme'` and
  the values `'light'` / `'dark'` are **literals on purpose**, the same as `STORAGE_KEYS.THEME` and `THEMES` in `constants.js`;
  `ai/rules/oop.md` says to change them in both places. It is classic inline code because it runs before any module; it only
  reads `localStorage`, inside `try/catch`, falls back to `prefers-color-scheme`, and is the one read that skips `SafeStorage`.
  Not a precedent: any other early read needs its own record. After load `ThemeController` is the authority.
- **`InlineThemeScriptPlugin` in `webpack/plugins/`** taps `afterTemplateExecution` of `html-webpack-plugin`, reads the file,
  minifies it with terser and puts it right after `<head>`, so it is the first element, before `<meta charset>`: the same in
  `yarn dev` and `yarn build`. It fails the build when the template has no `<head>`.
- **In dev an edit of the file reloads the page**: the plugin adds the file to the watched files, `devServer.watchFiles`
  reloads the browser, and `cache: false` on `html-webpack-plugin` makes it run its hooks again (with its cache on it skips
  them when the template did not change).
- Rejected (still): a bundler inside the plugin, and stripping an `import` by hand.

## Consequences

- Renaming the key or a theme value means editing `constants.js` and `themeHead.js`; if the script is forgotten the page
  shows the wrong theme for a frame and `ThemeController` corrects it, never a broken page.
- The inline script blocks parsing and stays tiny. The CSS is a `<link>` in dev too (extracted, not injected by `main.js`), so
  the first dev frame is styled, which `2026-10-10-theme-tokens-and-head-script.md` says it was not.
