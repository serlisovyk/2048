---
name: review
description: Use to self-review a diff in the 2048 repo for regressions, scope creep, accessibility, and docs drift before reporting a change done.
---

# Review

## When to use

Self-review pass before handing over any non-trivial change, per `ai/workflow.md`.

## Checklist

Walk the diff against `ai/rules/definition-of-done.md` and the rules of the areas it
touches (`oop`, `architecture`, `style`, `assets-performance`, `scope`). Then check what
the rules do not cover:

- **Gameplay**: moves, merges (no double merge in one move), scoring, spawning, win at the
  target tile, `Continue`, game over, high score — still correct? The New record badge
  shows once per game, only when the record was above 0, and starts over after `New Game`,
  `Restart Game` and the high score reset.
- **Statistics** (`ai/decisions/2026-10-13-statistics.md`): a game is played once (a game
  over, or a game left by `New Game`, a size or a target change after at least one move; a
  fresh board, a `Restart Game` after a game over and a reload add nothing), a win once per
  game (a win that ends the game on the same move adds a win and a played game); the summary
  in the dialogs equals the header's score, the presses that changed the board and the
  largest tile; the reset asks first, never shows two dialogs, reopens the settings on "no",
  and touches neither the high scores nor the game.
- **Input**: keyboard and swipe both go through the single movement guard; nothing moves
  while a dialog is open or after game over; a press during an animation is applied at once
  (no lock, no queue, no dropped move).
- **Tile animation**: the merge pop only on real merges (none after a plain slide or a
  reload), slide then merge pop then new tile, no tile trails its cell while the window is
  resized, no stray or hidden tile element after a burst of presses, reduced motion changes
  the board at once, and the tiles stay in row-major order in the DOM once a move settles.
- **Storage**: a saved game of the current version loads; anything else (another version, a
  bad size, a target the size does not offer, a bad `moves`, an empty board) is safely
  discarded (`SavedGameController`); a broken settings or statistics field costs only itself
  and a damaged blob never stops the game; nothing is written until something changes.
- **In the browser** (a green build proves none of it): both themes at desktop and 320px,
  including the dialogs, the badge and the `+N` pop; every board size at 320px (5x5 has the
  smallest cell, so the widest number must fit its tile) with no horizontal scroll; swipes
  on touch; the theme switch with the View Transitions API absent and under reduced motion,
  and no wrong-theme frame on load; the GitHub row and the footer never overlap the header
  or the board; the focus ring on keyboard focus only, none on the board; the font from the
  game's own origin with no layout jump when it swaps in.
- **Link preview**: a change to the palette, the logo gold, a page colour or the author's
  name means `ai/skills/og-image.md` was followed.
- **Scope**: nothing from `ai/rules/scope.md` or the rejected features slipped in; no
  unrelated rewrites; removed behavior left no unused code.
- **Docs drift**: the docs still match the code, none went over its limit
  (`ai/rules/docs.md`), and a decision record exists if a durable decision was made.

## Verification gaps to catch

- Build green but a change to code or UI was never played in the browser.
- Checked on desktop only — never with swipes at mobile width.
- Animation checked only with motion enabled.

## Report

State what was checked and what was found — fix it or say plainly why a finding is
being left alone, per `ai/workflow.md`'s report step.
