# All sources in `src/`, built with Vite `root: 'src'`

Date: 2026-10-10 · Status: accepted

## Context

`index.html`, `script.js`, `styles/`, and `favicon.svg` sat in the repo root next to
configs and agent docs. The usual Vite layout keeps `index.html` in the root and only
code in `src/`; the author wanted HTML, styles, and scripts together in `src/`.

## Decision

- `src/` holds `index.html`, `favicon.svg`, `scripts/` (all JavaScript), and
  `styles/` (all CSS).
- `vite.config.js` sets `root: 'src'`, `publicDir: '../public'`, and
  `build.outDir: '../dist'`, so the build output and the Vercel settings stay the
  same (`dist/` in the repo root).
- The favicon stays next to `index.html` and is hashed by Vite. `public/` is created
  only when a file needs a stable URL.

## Consequences

- Config files (`vite.config.js`, `postcss.config.js`, Prettier) stay in the root;
  PostCSS is found upward from `src/`.
- Root-relative assumptions in tooling (lint globs, size-limit paths) point at `src/`
  and `dist/`.
