# Skills

Repo-local skill playbooks. Tool-agnostic Markdown — any AI agent (Claude, Codex,
others) reads them directly. Each file has `name` + `description` frontmatter so it
maps to a matching skill entry when a tool supports one. A skill is a recipe; what must
hold is in `ai/rules/`. The other docs are listed in `AGENTS.md`.

- [feature](feature.md) — how a game feature flows through state, rendering, input,
  storage and styles; recipes for dialogs, settings, controls, animation.
- [og-image](og-image.md) — remaking the link preview image and the favicon when the
  palette, the logo gold, a page colour or the author's name changes.
- [review](review.md) — self-review of a diff: regressions, scope creep, accessibility,
  docs drift.
