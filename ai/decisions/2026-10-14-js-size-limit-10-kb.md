# The JavaScript size limit goes from 8 kB to 10 kB

Date: 2026-10-14 · Status: accepted

## Context

The `JavaScript` entry of `.size-limit.json` was 8 kB gzip and had under 100 bytes of headroom. The JS
refactor writes the code the way `ai/rules/style.md` asks (named conditions, one class per role, a view per
control, no comments to strip) and costs a little more than the code it replaces; the UX tasks that follow add
behaviour. The author agreed on 2026-10-13 to raise the limit to 10 kB, as the CSS one was raised
(`2026-10-13-css-size-limit-5-kb.md`).

## Decision

- **`.size-limit.json`: the `JavaScript` entry is `10 kB`**, gzip, as before. The CSS and font entries are not
  touched by this record.
- **The code is written as it should be, not squeezed under the old number:** no short names, merged classes or
  dropped checks to save bytes.
- Rejected: golfing the scripts to stay under 8 kB (readable code traded for bytes the author agreed to spend),
  and one budget for everything (one number per kind of file is the point).

## Consequences

- The budget stays a guardrail, not a target: `yarn size` checks it locally and in CI, and the next change that
  wants more than 10 kB needs its own record.
