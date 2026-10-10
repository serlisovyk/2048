# Skills

Repo-local skill playbooks. Tool-agnostic Markdown — any AI agent (Claude, Codex,
others) reads them directly. Each file has `name` + `description` frontmatter so it
maps to a matching skill entry when a tool supports one.

If a change materially reshapes a pattern, update the matching skill in the same
change.

## Build

- [feature](feature.md) — how a game feature flows through state, rendering, input,
  and storage.

## Review

- [review](review.md) — regressions, scope creep, accessibility, docs drift.

## Related

- Task flow: [`ai/workflow.md`](../workflow.md).
- Repo map: [`ai/map.md`](../map.md).
- Rules of record: [`ai/rules`](../rules) — including
  [`definition-of-done`](../rules/definition-of-done.md).
- Decision records: [`ai/decisions`](../decisions).
- Agent entrypoints: [`AGENTS.md`](../../AGENTS.md), [`CLAUDE.md`](../../CLAUDE.md).
