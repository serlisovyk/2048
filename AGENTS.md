# Agent Instructions

This is the canonical instruction file for **every** AI agent working in this repo.
`CLAUDE.md` and any other tool-specific entrypoint point here — keep shared knowledge
in `ai/`, not duplicated per tool.

## Project

A compact 2048 browser game built with HTML, modular plain CSS, vanilla JavaScript
(ESM), and Webpack. No UI framework, no TypeScript, no automated tests. Keep the code
clean, practical, accessible, and proportional to the project size.

- Live demo: <https://2048-xi-three.vercel.app/> (Vercel)
- Tasks: Linear, project **2048** (team `MY`, issues `MY-<n>`)

## Read First

- `ai/map.md` — where files and classes live, the storage keys, what the project
  deliberately does **not** have. Read it before exploring the code from scratch.
- The rules of the area you touch, in `ai/rules/`: `oop.md` and `architecture.md` for
  scripts, `style.md` for HTML, CSS and JavaScript, `assets-performance.md` for assets and
  metadata, `scope.md` for what not to add without an explicit request.
- `ai/rules/definition-of-done.md` — the gate before a change is handed over;
  `ai/rules/docs.md` — one fact one home, size limits, no history in docs.
- `README.md` — setup, scripts, features.
- `ai/superpowers/` is the archive of past plans and specs: read only the plan or spec of
  the feature you change.

## Decisions

`ai/decisions/` records durable decisions and **why** they were made. Start from its
`README.md` index and read the records of what you touch, before proposing to change or
"restore" anything — rules say what to do now, decisions say why. Reversing one means a
new dated record, not editing the old one.

Propose a new record, without being asked, when a decision meets the criteria in that
`README.md`.

## Workflow

`ai/workflow.md` is the end-to-end flow for a Linear task: orient → plan (+ spec when
behavior changes) → implement → docs → verify → Definition of Done → self-review →
report → author approval → local merge into `main`.

The parts that never bend:

- Never commit task work directly on `main` — use a `my-<n>-<slug>` branch.
- Write a **plan** for anything non-trivial, and a **spec** when observable behavior
  changes, under `ai/superpowers/` — one commit, before any code.
- Nothing is merged and no issue is marked `Done` without the author's explicit
  approval.
- Merges happen locally into `main`, then `main` is pushed. No pull requests, and never
  a force-push of `main`.
- Never bypass the pre-commit hook (`--no-verify`).
- No automated tests — do not add them unless explicitly asked.

Prompts to start agent sessions live in `ai/prompts/` (index in
`ai/prompts/README.md`): `orchestrator.md` runs several tasks from one session,
`task.md` runs a single task. Linear issues follow `ai/linear-task-template.md`.

## Skills

Skill playbooks live in `ai/skills/` (tool-agnostic Markdown, index in
`ai/skills/README.md`):

- `feature` — which class in which layer owns a game feature's state, rendering,
  input, and storage.
- `review` — self-review for regressions, scope creep, and docs drift.
- `og-image` — remaking the link preview image and the favicon.

If a change materially reshapes a pattern, update the matching skill in the same
change (`ai/rules/docs.md`).

## Working Principles

- Prefer small, focused changes.
- Write object-oriented code per `ai/rules/oop.md` — a feature lands as a class or a
  method in the layer that owns it, never as loose functions or module-level state.
- Follow the existing HTML, CSS, and JavaScript structure.
- Do not add new abstractions unless they remove real duplication or clarify a
  boundary.
- Do not rewrite working code just to make it look different.
- Keep UI changes responsive, accessible, and consistent with the current visual
  language.
- If a request conflicts with these rules, follow the user's explicit request and
  mention the tradeoff.

## Project Defaults

- Package manager: `yarn` (v1), never npm or pnpm; keep `yarn.lock`, no `package-lock.json`,
  and do not edit the lockfile by hand unless there is no safer option
- Stack: the browser plus Node.js build tooling; Webpack 5 (`webpack/`); HTML,
  modular plain CSS imported from `src/styles/main.css`, and JavaScript ESM (ES classes,
  OOP)
- Sources: everything in `src/` (`index.html`, `favicon.svg`, `fonts/`, `scripts/`,
  `styles/`); files that need an unhashed URL in `public/`; output in `dist/`
- CI: GitHub Actions runs lint, format check, build, and size check on every push —
  a post-push signal; a red `main` is fixed right away
- Formatting: Prettier (`.prettierrc`, `yarn format`). Linting: ESLint 10 flat config
  (`eslint.config.js`), including rules that enforce `ai/rules/oop.md`
- Pre-commit: Husky + lint-staged lint and format staged files

## Language

- Chat with the author in Russian.
- Code, comments, commit messages, specs, plans, and `ai/` docs stay in English.
- Linear issues are written in Russian, following `ai/linear-task-template.md`.

## Verification

Run before handing over any change:

```bash
yarn lint
yarn format:check
yarn build
yarn size
```

Then exercise the change in the browser (`yarn dev`) on desktop and at mobile width —
a green build does not prove a UI change works. If a check cannot be run, report that
clearly.
