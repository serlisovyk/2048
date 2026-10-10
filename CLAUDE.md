# CLAUDE.md

`AGENTS.md` is the single source of truth for working in this repo — same rules for
every AI agent. Read it, then the linked docs. Nothing agent-specific is duplicated
here.

@AGENTS.md

## Quick orientation

- Vanilla JS + Vite 2048 game, deployed on Vercel. Game logic, rendering, and input
  currently live in one `script.js`; styles are split by responsibility under
  `styles/`. Check `ai/map.md` before assuming where something lives.
- Task flow: `ai/workflow.md` — branch → plan → implement → docs → verify → DoD →
  self-review → report → author approval → local merge into `main`.
- Several tasks from one session: `ai/orchestrator-prompt-template.md`.
- Rules of record: `ai/rules/`. Decision records: `ai/decisions/` — including the
  list of features the author rejected; do not propose them again.
- No automated test suite. Verify with `yarn format:check`, `yarn build`, and by
  playing the game in `yarn dev`.
