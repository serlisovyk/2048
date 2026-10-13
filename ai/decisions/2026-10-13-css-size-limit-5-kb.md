# The CSS size limit goes from 4 kB to 5 kB

Date: 2026-10-13 · Status: accepted

## Context

The CSS budget in `.size-limit.json` was 4 kB gzip. After MY-135 and MY-131 the stylesheet was 3.96 kB,
0.04 kB under it. MY-130 (statistics) adds the summary of a game in the win and game-over dialogs and the
Statistics section of the settings, which is more than 0.04 kB of rules, so it crosses the limit. The
author had already agreed that the issue that crosses 4 kB raises it to 5 kB
(`2026-10-11-settings-dialog-and-storage.md`, `2026-10-13-win-target-per-board-size.md`) and said so again
for this issue (2026-10-13).

## Decision

- **`.size-limit.json`: the `CSS` entry is `5 kB`**, gzip, as before. The JavaScript and the font entries are
  not touched by this record.
- **The new rules are written as they should be, not squeezed under 4 kB.** The two lists (the summary and the
  statistics) already share their label and value rules; no further trimming was done, and nothing was moved
  into JavaScript or dropped to save bytes.
- Rejected: golfing the existing stylesheet to buy room (it would trade readable rules for bytes the author
  agreed to spend), and splitting the entry into several budgets (one number per kind of file is the point).

## Consequences

- The budget is still a guardrail, not a target: it is checked by `yarn size` locally and in CI, and the next
  change that wants more than 5 kB needs its own record.
- Headroom after MY-130 is written in the statistics record (`2026-10-13-statistics.md`).
