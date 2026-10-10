# MY-125 — "New record!" badge when the high score is beaten (spec)

Issue: MY-125 · Branch: `my-125-new-record-badge` · Plan: `ai/superpowers/plans/2026-10-10-new-record-badge.md`

The questions the issue left to the plan (how long the badge stays, what a screen reader
hears, reduced motion, a reset in the middle of a game, the place) were answered by the
author on 2026-10-10: plan, section 5. This text is the approved behavior.

## Goal

When the score first passes the high score that stood when the game started, a small gold
"New record!" badge appears at the High Score box, once per game. It marks one of the
best moments of the game. Nothing else changes: not the header's size, not the game, not
the saved data.

The issue was narrowed by the author: confetti on a win is dropped as overkill, and only
the badge remains.

## What is wrong today

- Beating the record is silent. The High Score box just starts following the score, and a
  player who is looking at the board never learns that the record fell.

## Behavior

### When the badge shows

- At most once per game, on the first move after which the score is **greater than** the
  high score that stood before the move, and only when that high score was **above 0**:
  there has to be a record to beat.
- Every later move in the same game raises the high score along with the score, as it
  does today, and shows nothing more.
- Equal to the record is not a record: the score has to exceed it.
- A game that starts with a high score of 0 (the very first game, or any game after the
  high score was reset) never shows the badge: 0 is "no record yet", so the first points
  are not a record. It does not show later in that game either: the high score is then
  following the game's own score, and passing it on every move is not news.

### Games, reset, reload

- **New Game / Restart Game** (any path): a visible badge is removed at once, and the new
  game starts armed again. It can show the badge once, if the high score is above 0 when
  the game starts. That includes the record the previous game has just set.
- **Reset high score** (after its confirmation, answer "yes"): a visible badge is removed
  at once. The high score is 0 now, so for the rest of that game there is no badge (the
  same as a first game). The next game is armed again as soon as the high score is above 0.
- **Reload in the middle of a game** (the saved game is restored): the badge is never
  shown on load, and a badge that was in the air at the reload is gone, since it is a
  moment and not saved state. The saved format does not change. The restored game is armed
  only if its score is below the high score. A game that is already at or above the high
  score (it has broken the record before the reload, or tied it, or the record was reset)
  does not show the badge again for the rest of the game. A game that has only tied the
  record before the reload and then passes it shows no badge either; that edge case is
  accepted, because "tied" cannot be told from "broken" without storing one more flag.
- **The move that wins or ends the game** can break the record. The badge is shown as
  usual and sits under the dimmed dialog backdrop with the rest of the header; it finishes
  by itself. `New Game` or `Restart Game` removes it at once.
- A move that does not change the score (a slide) never shows the badge. A blocked move,
  the 100 ms cooldown, and moves after game over are ignored as before.

### What it looks like

- A pill with the text `New record!`: gold background (`#ffd700`, the gold of the score
  digits), dark text (`#3b3226`, the logo's text colour), bold, 11 to 12 px, a soft
  shadow. It sits at the right end of the High Score box and straddles its top edge, like a
  flag on the corner: about half of the pill is in the gap under the toolbar and half over
  the box's top padding.
- It floats over the box (out of the layout, `position: absolute`,
  `pointer-events: none`): the header does not shift or resize when it appears or goes
  away, at any width from 320px up, and it never takes a tap. It does not overlap the
  reset-high-score button (which is in the box's second row, at the right) or any other
  button, and fits next to a 7-digit high score at 320px.
- **How long it stays:** about 4 seconds, then it fades out by itself and is gone from
  the page. It is not shown again in that game.
- **Entry:** a short pop, about 300 ms: it grows from 60% to a little over 100% of its
  size while fading in, and settles at 100%. It then holds still until the last ~400 ms,
  when it fades out.

### Reduced motion

- With `prefers-reduced-motion: reduce` the badge is static: it appears at once at full
  size and opacity, stays the same length of time, and is removed at once. No scale, no
  movement, no fade.

### Screen readers

- The badge itself is `aria-hidden="true"`: a visual decoration that is not in the
  accessibility tree, so browse mode does not read it, and it never changes the text of
  the score or the high score.
- The record is announced once, through the score's existing polite live region and not
  as a second announcement: the announcement that follows the record move reads
  `New record! <score>` instead of the bare `<score>`. The usual 500 ms debounce applies,
  so a burst of fast moves is read once, with the prefix on that one announcement. Later
  announcements are bare numbers again. There is no second live region and no duplicate:
  the score is spoken once.
- The high score box still has no live region
  (`ai/decisions/2026-10-10-score-live-region-and-focus-ring.md`).

### Unchanged

- Moves, merges, scoring, the high score and when it is saved, the saved game and its
  format, the dialogs and their focus handling, the score pop (`+N`), the score's live
  region and its debounce for every other announcement, the tile animations.
- The header, the score boxes, and the toolbar look and measure exactly the same with and
  without the badge.

## How it will be checked

No automated tests exist. The change is played in `yarn dev` and driven by a headless
Chrome over the DevTools protocol, because the built-in browser pane is hidden here and
does not advance animations. Positions are prepared through `localStorage` (`highScore`
and `savedGame`).

- Record 100, a game at 90 with a merge ready: the badge shows on the first move above
  100, once; further merges show nothing. A record of 0: no badge at all.
- `New Game` removes the badge and arms the next game; the high score reset removes it and
  disarms the rest of the game; a reload mid-game after the break shows no second badge;
  a reload below the record still shows it when the record falls.
- Desktop and 320px with a 7-digit high score: the bounding boxes of the logo, toolbar,
  score boxes, and board are identical before, during, and after the badge; the badge's
  box does not intersect the reset button or the toolbar button.
- Normal motion: opacity and scale at several moments of the 4 s, the element is gone
  after it. Reduced motion (emulated): no scale or fade at any moment, removed at 4 s.
- Accessibility tree: no badge node; the live region text reads `New record! <score>`
  once, and bare numbers otherwise.
- Screenshots of the badge (desktop, 320px, reduced motion) go to the scratchpad.
