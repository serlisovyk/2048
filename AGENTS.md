# Agent Instructions

This file defines how AI coding agents should work in this repository.

This is a compact 2048 browser game built with HTML, modular CSS, vanilla
JavaScript, and Vite. Keep the code clean, practical, accessible, and
proportional to the project size. The project is intentionally framework-free,
so clarity, responsive controls, and production build quality matter more than
large abstractions.

## Rule Files

Read these files before making changes:

- [Architecture Rules](rules/architecture.md)
- [Style Rules](rules/style.md)
- [Scope Rules](rules/scope.md)
- [Assets & Performance Rules](rules/assets-performance.md)
- [Verification Rules](rules/verification.md)

## Working Principles

- Prefer small, focused changes.
- Follow the existing HTML, CSS, and JavaScript structure.
- Do not add new abstractions unless they remove real duplication or clarify a
  boundary.
- Do not rewrite working code just to make it look different.
- Keep UI changes responsive, accessible, and consistent with the current
  visual language.
- If a request conflicts with these rules, follow the user's explicit request
  and mention the tradeoff.

## Project Defaults

- Package manager: `yarn`
- Runtime: Browser + Node.js build tooling
- Build tool: Vite
- Languages: HTML, CSS, and JavaScript ESM
- Styling: modular plain CSS imported from `styles/main.css`
- Metadata: basic description, theme color, and Open Graph title/description
- Compatibility: Vite legacy plugin for non-modern browsers, excluding IE 11
- Formatting: Prettier

## Before Finishing

Run the relevant checks:

```bash
yarn format:check
yarn build
```

If formatting was intentionally changed, run:

```bash
yarn format
```

If a check cannot be run, report that clearly.
