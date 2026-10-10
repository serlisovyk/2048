# Agent Instructions

This is the canonical instruction file for **every** AI agent working in this repo.
`CLAUDE.md` and any other tool-specific entrypoint point here — keep shared knowledge
in `ai/`, not duplicated per tool.

## Project

A compact 2048 browser game built with HTML, modular plain CSS, vanilla JavaScript
(ESM), and Vite. No UI framework, no TypeScript, no automated tests. Keep the code
clean, practical, accessible, and proportional to the project size.

- Live demo: <https://2048-xi-three.vercel.app/> (Vercel)
- Tasks: Linear, project **2048** (team `MY`, issues `MY-<n>`)

## Read First

- `README.md` — setup, scripts, features.
- `ai/map.md` — repo map: files, responsibilities, storage keys, and what the
  project deliberately does **not** have. Read it before exploring the code from
  scratch.
- `ai/rules/architecture.md` — file responsibilities and boundaries.
- `ai/rules/style.md` — HTML, CSS, JavaScript, and formatting conventions.
- `ai/rules/scope.md` — what not to add without an explicit request.
- `ai/rules/assets-performance.md` — assets, metadata, build output.
- `ai/rules/verification.md` — required checks and reporting.
- `ai/rules/definition-of-done.md` — the gate before a change is handed over.

## Decisions

`ai/decisions/` records durable decisions and **why** they were made. Read it before
proposing to change or "restore" anything — rules say what to do now, decisions say
why. Reversing one means adding a new dated record, not editing the old one.

Capture new decisions as they surface, without being asked: a standing constraint
("we will not do X"), a feature the author deliberately rejected, a tradeoff accepted
over a named alternative, or a target agreed now and implemented later. One-off task
details and plain current-state facts are not decisions.

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
- Merges happen locally into `main`, then `main` is pushed. No pull requests.
- No automated tests — do not add them unless explicitly asked.

To run several tasks from one session, use `ai/orchestrator-prompt-template.md`. To
run a single task, use `ai/task-prompt-template.md`. Linear issues follow
`ai/linear-task-template.md`.

## Skills

Skill playbooks live in `ai/skills/` (tool-agnostic Markdown, index in
`ai/skills/README.md`):

- `feature` — how a game feature flows through state, rendering, input, and storage.
- `review` — self-review for regressions, scope creep, and docs drift.

If a change materially reshapes a pattern, update the matching skill in the same
change.

## Working Principles

- Prefer small, focused changes.
- Follow the existing HTML, CSS, and JavaScript structure.
- Do not add new abstractions unless they remove real duplication or clarify a
  boundary.
- Do not rewrite working code just to make it look different.
- Keep UI changes responsive, accessible, and consistent with the current visual
  language.
- If a request conflicts with these rules, follow the user's explicit request and
  mention the tradeoff.

## Project Defaults

- Package manager: `yarn` (v1)
- Runtime: Browser + Node.js build tooling
- Build tool: Vite
- Languages: HTML, CSS, and JavaScript ESM
- Styling: modular plain CSS imported from `styles/main.css`
- Compatibility: Vite legacy plugin for non-modern browsers, excluding IE 11
- Formatting: Prettier; line endings are LF (`.gitattributes`)

## Language

- Chat with the author in Russian.
- Code, comments, commit messages, specs, plans, and `ai/` docs stay in English.
- Linear issues are written in Russian, following `ai/linear-task-template.md`.

## Verification

Run before handing over any change:

```bash
yarn format:check
yarn build
```

Then exercise the change in the browser (`yarn dev`) on desktop and at mobile width —
a green build does not prove a UI change works. If a check cannot be run, report that
clearly.
