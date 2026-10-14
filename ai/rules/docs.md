# Docs Rules

Every task starts by reading the docs, so they stay short. The code is the source of **how**; docs answer
**where** (`ai/map.md`), **what must hold** (`ai/rules/`, `ai/skills/`) and **why** (`ai/decisions/`).

- **One fact, one home.** Grep before adding a fact; link instead of copying. A doc does not retell the code
  (methods, result shapes, formats, constants) or another doc.
- **No history in current docs.** No task numbers, "since MY-…", measurements, byte budgets or check logs:
  they belong to commits, plans and reports. A rule says what holds now; a decision says why.
- **Name classes and folders, not file paths,** where that is enough: the paths change, the names last.
- **Limits.** `ai/map.md`: at most 150 lines and 12 KB, a list item at most about 150 characters, a table
  cell at most 80. A rules file: about 100 lines. A skill: about 8 KB. A decision record: about 30 lines.
  README Features: about 15 one-line items. A plan or a spec cites decisions, it does not retell them.
- **A task adds a line or two per doc, and cuts when a limit is crossed** — in the same change, from the
  doc that went over.
- **Update only what the change made wrong:** a file, class, storage key or script added, renamed or removed
  → the map; a pattern reshaped → the rule or skill; a durable decision → a record (criteria in
  `ai/decisions/README.md`); what a player sees or how to run it → one line in `README.md`.
