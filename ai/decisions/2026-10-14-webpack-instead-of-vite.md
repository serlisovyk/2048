# Webpack 5 instead of Vite as the build tool

Date: 2026-10-14 · Status: accepted · Supersedes `2026-10-10-no-legacy-plugin.md`,
`2026-10-10-sources-in-src.md` and `2026-10-14-no-browserslist.md`

## Context

The build was Vite 7 (`vite.config.js`, `root: 'src'`, two own plugins). The author uses Vite in most projects and wanted
hands-on experience with another bundler here, where Webpack makes explicit what Vite does by itself. The player sees no
change. Rspack may follow: the config uses loaders and plugins that have Rspack twins.

## Decision

- **Webpack 5** with `webpack-cli` and `webpack-dev-server`; `webpack.config.js` re-exports the config that `webpack/`
  assembles from small parts. `yarn dev` is `webpack serve`, `yarn build` is `webpack --mode production`, `yarn preview`
  serves `dist/` with `sirv-cli`. The build config has no comments, like `src/`: the "why" is below.
- **Sources stay in `src/`**; `public/` is copied unhashed to the root of `dist/`; the output is `dist/index.html` and
  `dist/assets/*.js|css|woff2` with content hashes. The preload in `index.html` and the `@font-face` `url()` name one file.
- **JavaScript: one bundle, modern syntax as written.** No Babel, no legacy chunks, no polyfills, terser, no source maps in
  production. Browsers older than the CSS targets are not supported; bringing them back needs a new dated record.
- **The browser targets are one object, `webpack/targets.js`**: Chrome 107, Edge 107, Firefox 104, Safari 16 (Vite 7's
  default), read by Lightning CSS for nesting, `<=` and `>=` ranges and prefixes. **No `browserslist` field or file**: a
  different target needs a new record. Only the prefixes these targets need stay (`-webkit-user-select` today); the `-moz-`
  ones from Autoprefixer's defaults are gone.
- **`light-dark()` lowering is off** (`UNUSED_CSS_FEATURES`): the theme is `data-theme`, and with it on Lightning CSS adds
  `--lightningcss-*` helper properties next to every `color-scheme`.
- **HTML minification keeps the attribute quotes** (`removeAttributeQuotes: false`): Open Graph readers can be naive.
- **Dev server:** `static: false`, because `public/` reaches it from memory through the copy plugin; the reload on a template
  or head script edit is in `2026-10-14-theme-head-script-html-plugin.md`.
- Rejected: Rspack now; PostCSS and Autoprefixer beside Lightning CSS (two tools for one job); `experiments.outputModule`.

## Consequences

- CSS that cannot be lowered (container queries, `@layer`, `:has()`) is left as written (`ai/rules/style.md`).
- `webpack-dev-server` stays on 5: version 6 needs Node 22.15, `engines` allows 20.19 and 22.13. `yarn dev` without `--port`
  is on 8080, no longer Vite's 5173.
