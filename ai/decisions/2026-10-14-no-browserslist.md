# No `browserslist` — Autoprefixer and the build use their defaults

Date: 2026-10-14 · Status: superseded by `2026-10-14-webpack-instead-of-vite.md`

## Context

`ai/rules/assets-performance.md` asked for CSS autoprefixing "tied to `browserslist`",
but the repo has no `browserslist` field or file. Autoprefixer runs with its defaults
(`postcss.config.js`) and Vite builds for its default `baseline-widely-available` target
(`2026-10-10-no-legacy-plugin.md`).

## Decision

The author decided not to add a `browserslist`. The rule is reworded to match: the
project has no `browserslist` config and none is added.

## Consequences

- Do not add a `browserslist` field or a `.browserslistrc` to change what gets
  prefixed. A different support target needs a new dated record.
