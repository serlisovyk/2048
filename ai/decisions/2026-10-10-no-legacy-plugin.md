# No `@vitejs/plugin-legacy` — Vite's default browser target

Date: 2026-10-10 · Status: accepted

## Context

The build used `@vitejs/plugin-legacy` (targets `defaults, not IE 11`). After the OOP
split (MY-109) its modern chunk was compiled for Chrome 64 / Safari 12, so esbuild
rewrote `#private` class members into `WeakMap` helpers. Measured in MY-112 (gzip):

| Option                                         | JS for modern browsers | Extra files                              |
| ---------------------------------------------- | ---------------------- | ---------------------------------------- |
| Plugin with its default modern targets         | 3.56 kB                | legacy chunk 2.57 kB + polyfills 12.2 kB |
| Plugin with `modernTargets` raised to Baseline | 2.89 kB                | same legacy chunk + polyfills            |
| No plugin                                      | 2.82 kB                | none                                     |

Raising `modernTargets` buys nothing: the legacy chunk only loads in browsers that
fail the plugin's ES-module detection, while older browsers that pass it (Safari
12–15.3, Chrome 64–92) would still get native private fields and break.

## Decision

- Remove `@vitejs/plugin-legacy`. Vite's default `build.target`
  (`baseline-widely-available`) applies; in practice the game runs from Chrome 93 /
  Safari 15.4 (private class methods, `Object.hasOwn`).
- Minification (terser, `drop_console`), CSS minification, autoprefixing, the
  `minify-html` plugin, and asset hashing are unchanged.

## Consequences

- One JS file, no SystemJS or polyfill chunks, a smaller `index.html`, a simpler
  config, a faster install.
- With the newer CSS target the minifier also emits `-webkit-backdrop-filter`, which
  Safari before 18 needs for the board's blur.
- Browsers older than the target are not supported. Bringing them back needs an
  explicit request and a new dated record.
