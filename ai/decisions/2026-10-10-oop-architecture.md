# Object-oriented architecture

Date: 2026-10-10 · Status: accepted

## Context

The game started as one procedural `script.js` with module-level state. While
splitting it into modules (MY-109), the author asked for the project to follow OOP
and its usual practices throughout, so that every later feature lands in a clear
place.

## Decision

- All JavaScript is organized as ES classes with encapsulated state (`#private`
  fields and methods), one class per file, named exports.
- Layers: model (`game/` — `Board`, `Game`), views (`ui/`), input (`input/`),
  storage (`storage/`), a `GameController` for use cases, and `main.js` as the
  composition root.
- Dependencies are passed through constructors; only `main.js` queries the DOM and
  wires objects.
- Composition over inheritance; no speculative abstractions (base classes, factories,
  DI containers).
- The detailed conventions live in `ai/rules/oop.md`.

## Consequences

- New features are added as methods on the owning class or as a new class in the
  matching layer — not as loose functions or module-level state.
- The `review` skill and the Definition of Done check OOP conventions.
- `@vitejs/plugin-legacy` builds the modern chunk for old targets (Chrome 64,
  Safari 12), so esbuild rewrites `#private` members into `WeakMap` helpers: the
  modern JS went from 1.76 kB to 3.48 kB gzip. Native private fields come back once
  the modern target is raised or the plugin is dropped — decided in MY-112.
