# Decisions

Durable project decisions. One decision per file, named `YYYY-MM-DD-<slug>.md`.

How this differs from `ai/rules/`: **rules** state what to do now (current law,
rewritten as it changes). **Decisions** state _why_ a choice was made, with a date —
they are appended, never rewritten. If a decision is reversed, add a new record and
mark the old one `Status: superseded by <file>`; do not delete it.

Format: `Context` → `Decision` → `Consequences`. Short and specific.

The point: an agent (or a human) does not relitigate settled questions or
"helpfully" restore something that was deliberately rejected.

## When to add a record

Propose one **as soon as the decision surfaces** — in conversation or in a change —
without being asked:

- a standing constraint ("we will not do X", "always / never Y");
- a feature the author deliberately rejected;
- a tradeoff accepted over a named alternative;
- a target agreed now, implemented later (`Status: accepted (not implemented)`);
- a convention chosen where an obvious alternative existed.

Not decisions: one-off task details, plain current-state facts, or anything
`ai/rules/` and `ai/map.md` already cover. Do not create noise records.

## Records

- [2026-10-10 — vanilla JavaScript, no UI framework, no TypeScript](2026-10-10-vanilla-js-no-framework.md)
- [2026-10-10 — no automated tests](2026-10-10-no-automated-tests.md)
- [2026-10-10 — deployed on Vercel through its Git integration](2026-10-10-vercel-deploy.md)
- [2026-10-10 — merge locally into `main`, no pull requests](2026-10-10-local-merge-without-pr.md)
- [2026-10-10 — features the author rejected](2026-10-10-rejected-features.md)
- [2026-10-10 — object-oriented architecture](2026-10-10-oop-architecture.md)
