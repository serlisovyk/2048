---
name: feature
description: Use when adding or changing a game-facing feature in the 2048 game — where state, rendering, input, styles, and storage go, and how they connect.
---

# Feature

## When to use

Adding a gameplay feature, a UI control, a dialog, an animation, or anything that
reads or writes persisted data.

## Workflow

1. Read `ai/map.md` first — it says where state, rendering, input, styles, and
   storage currently live. Do not rediscover the code from scratch.
2. Separate the feature into its layers before writing code:
   - **State / rules** — what changes in the game state, and the rule that changes
     it. Keep rules pure and deterministic (only tile spawning is random); no DOM
     access in rule code.
   - **Rendering** — how the new state shows up. Rendering reads state; it does not
     decide game rules.
   - **Input** — every move goes through the single movement guard
     (`requestMove`), whatever the source (keyboard, pointer, buttons).
   - **Styles** — the CSS file that owns that responsibility (see the styles table
     in `ai/map.md`); motion overrides in `motion.css`.
   - **Storage** — persisted data goes through one place, tolerates failures
     (blocked storage, corrupted JSON), and carries a `version` when its shape can
     evolve.
3. Put every new shared value (sizes, thresholds, timings, storage keys, targets)
   in the constants section — no literals duplicated between files. Keep JS timings
   in sync with the CSS durations they mirror.
4. Dialogs: use native `<dialog>` with `showModal()` (focus trap, `Escape`,
   `::backdrop` for free) and return focus to the board on close.
5. Controls: real `<button>`s with an accessible name; icon-only buttons get
   `aria-label` and `title`.
6. Animation: respect `prefers-reduced-motion`; never let an animation swallow or
   reorder player input.
7. Verify per `ai/workflow.md`: format, build, and play the feature on desktop and at
   mobile width.

## Avoid

- Mixing rule logic with DOM updates in the same function.
- A second input path that bypasses the movement guard.
- New abstractions for one-use logic.
- Reading `localStorage` without `try/catch` or without validating the shape.
- Features listed in `ai/decisions/2026-10-10-rejected-features.md`.
