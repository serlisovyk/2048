# Webpack 5 instead of Vite as the build tool

Date: 2026-10-14 · Status: accepted · Supersedes `2026-10-10-no-legacy-plugin.md`,
`2026-10-10-sources-in-src.md` and `2026-10-14-no-browserslist.md`

## Context

The build was Vite 7 with a `vite.config.js` (`root: 'src'`) and two own plugins. The author uses Vite in most projects
and wanted hands-on experience with another bundler on this one, where Webpack makes explicit what Vite does by itself. The
player sees no change. Rspack may follow later: the config uses loaders and plugins that have Rspack twins.

## Decision

- **Webpack 5** with `webpack-cli` and `webpack-dev-server`, one `webpack.config.js` in the root. `yarn dev` is
  `webpack serve`, `yarn build` is `webpack --mode production`, `yarn preview` serves `dist/` with `sirv-cli`.
- **Sources stay in `src/`**; `public/` is copied unhashed to the root of `dist/`; the output is `dist/index.html` and
  `dist/assets/*.js|css|woff2` with content hashes. The font and the favicon are assets of the build: the preload in
  `index.html` and the `@font-face` `url()` name one hashed file.
- **JavaScript: one bundle, modern syntax as written.** No Babel, no legacy chunks, no polyfills, terser, no source maps in
  production. Browsers older than the CSS targets are not supported; bringing them back needs a new dated record.
- **The browser targets are one object in the config**: Chrome 107, Edge 107, Firefox 104, Safari 16 (Vite 7's default).
  Lightning CSS reads them for nesting, `<=` and `>=` ranges and prefixes. **No `browserslist` field or file**: a different
  target needs a new record. The prefixes are the ones these targets need (`-webkit-user-select` today); the `-moz-` ones
  that Autoprefixer's defaults added are gone because Firefox 104 does not need them.
- `light-dark()` lowering is off: the theme is `data-theme` (`2026-10-10-theme-tokens-and-head-script.md`).
- Rejected: Rspack now; PostCSS and Autoprefixer beside Lightning CSS (two tools for one job); `experiments.outputModule`
  (experimental, dev-server HMR with it is not settled).

## Consequences

- CSS that cannot be lowered (container queries, `@layer`, `:has()`) is left as written; a `<` range in `@media` becomes
  `not (…)` as before (`ai/rules/style.md`).
- `webpack-dev-server` stays on 5: version 6 needs Node 22.15, `engines` allows 20.19 and 22.13. `yarn dev` without `--port`
  is on 8080, no longer Vite's 5173.
