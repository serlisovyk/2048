---
name: review
description: Use to self-review a diff in the 2048 repo for regressions, scope creep, accessibility, and docs drift before reporting a change done.
---

# Review

## When to use

Self-review pass before handing over any non-trivial change, per `ai/workflow.md`.

## Checklist

- **Gameplay**: moves, merges (no double merge in one move), scoring, spawning, win
  at the target tile, `Continue`, game over, high score — still correct?
- **Input**: keyboard and swipe both still go through the single movement guard;
  nothing moves while a dialog is open or after game over.
- **OOP** (`ai/rules/oop.md`): one class per file in the right layer; state in
  private fields, no internal arrays handed out; dependencies through the
  constructor; no `document.querySelector` outside `main.js`; no speculative base
  classes or factories.
- **Boundaries**: model (`game/`) free of DOM, storage, and timers; views free of
  game rules; no inline styles (custom properties for numbers excepted) or
  handlers; no game state on `window`.
- **Single sources**: no duplicated literals for size, thresholds, timings, storage
  keys, or the target tile; JS timings match CSS durations.
- **Storage**: every read/write wrapped and validated; old saved data still loads or
  is safely discarded.
- **Accessibility**: buttons have names (an icon-only button has an `aria-label` and a
  `title`; its icon is inline SVG with `aria-hidden="true"`), focus is visible and returns to the board
  after dialogs, `prefers-reduced-motion` respected for new animation (including
  `::backdrop`). Every button shows the one shared focus ring on keyboard focus and
  none on a mouse click (no per-button `outline` override), the board shows none, and
  a changing value is announced once through a polite live region, not on every
  update. A decoration that repeats that value (the score `+N` pop) is `aria-hidden`,
  outside the live region, and still visible under reduced motion (without movement),
  never gone at once.
- **Dialogs**: native `<dialog>` opened with `showModal()`, never two open at once,
  `Escape` does what the dialog's purpose says, the page behind is dimmed and inert.
- **Responsive**: 320px wide to desktop, no horizontal scroll, swipes work on touch.
- **Tile colours**: only tokens in `tiles.css` (no literals in the per-value rules),
  the base `.grid-cell[data-value]` rule first and no `:not()` chain, text at least
  3:1 on both ends of the gradient for every value, the widest number (six digits)
  fits its tile at 320px.
- **Scope**: nothing from `ai/rules/scope.md` or
  `ai/decisions/2026-10-10-rejected-features.md` slipped in; no unrelated rewrites.
- **Dead code**: removed behavior left no unused functions, classes, styles, or
  constants.
- **Docs drift**: `README.md`, `ai/map.md`, `ai/rules/*`, `ai/skills/*` still match
  the code; a new `ai/decisions/` record if a durable decision was made.

## Verification gaps to catch

- Build green but the change was never played in the browser.
- Checked on desktop only — never with swipes at mobile width.
- Animation checked only with motion enabled.

## Report

State what was checked and what was found — fix it or say plainly why a finding is
being left alone, per `ai/workflow.md`'s report step.
