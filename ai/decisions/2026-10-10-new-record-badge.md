# The New record badge is a transient `aria-hidden` flag; the record is spoken once, inside the score announcement

Date: 2026-10-10 · Status: accepted

## Context

Beating the high score was silent (MY-125): the High Score box just started following the
score. A small badge marks the moment. Confetti on a win was part of the same issue and
the author dropped it as overkill (`2026-10-10-rejected-features.md`). Four choices had
an obvious alternative:

- **Where "this game has beaten the record" lives.** The high score is not part of the
  game state (`2026-10-10-saved-game-format.md`); the controller owns it.
- **How long the badge stays.** A moment, or a status for the rest of the game.
- **What reduced motion does.** The global rule in `motion.css` makes every animation
  0.01 ms long, which would remove a timed badge at once.
- **What a screen reader hears.** The score has a debounced live region and the high
  score deliberately has none (`2026-10-10-score-live-region-and-focus-ring.md`).

## Decision

- **The rule.** The badge shows on the first move of a game after which the score is
  above the high score, if that high score was above 0. One private boolean in
  `GameController`, `#hasRecordToBeat` ("a record exists and this game has not beaten it
  yet"): a new game sets it to `highScore > 0`, a restored game to `score < highScore`
  (derived, not stored, so the saved format does not change), `#renderScore()` clears it
  and shows the badge, the high score reset clears it. A game that starts with a record of
  0 never sets it, so the rest of that game (and of a game after a reset) is silent: the
  high score is following the game's own score, and passing it on every move is not news.
  The model does not know about the high score, so the rule is not in `Game`.
- **A moment, not a status.** The badge is a `hidden` element in the markup
  (`.record-badge`, `aria-hidden`), absolutely positioned on the top edge of the High
  Score box at its right end, out of the layout (the header never shifts, the reset button
  is never covered). It shows for 4 s: one CSS animation (a pop in, a hold, a fade out),
  the length in `--record-badge-duration`, and `ScoreView` hides it on `animationend`: no
  JS timer, nothing in `constants.js`. `New Game`, `Restart Game`, and the high score reset
  hide it at once. Rejected: "until the game ends" (a gold pill in the header for a
  half-hour game, and it cannot survive a reload because the state is not saved).
  Rejected placements: over the `High Score` label (at 1000px a sliver of the wider label
  sticks out), the bottom edge (the reset button is in that corner), the empty middle of
  the logo row (not "at the record block", and it collides with the toolbar button at
  320px).
- **Reduced motion: static.** Appears at full size, stays 4 s, disappears; no scale, no
  fade. `motion.css` gives the badge its own override, as for the score pop: its duration
  restored with `!important` and a second keyframes rule that changes nothing
  (`record-badge-static`), so `animationend` still fires and removes it.
- **The record is spoken once, inside the score announcement.** The announcement that
  follows the record move reads `New record! <score>` instead of the bare `<score>`; every
  other announcement is still the bare number. `ScoreView.showNewRecord()` sets a private
  pending flag, `#announce` consumes it, and the wording is the badge's own text, so it is
  written once. The 500 ms debounce is kept: a burst of fast moves is read once, with the
  prefix on that one announcement. The badge itself stays `aria-hidden`. Rejected: a second
  live region (two utterances for one event, and they can speak over each other), and no
  announcement at all (the one number worth hearing would be visual only).

## Consequences

- Another decoration that has to be heard rides on the score announcement the same way: a
  pending flag in `ScoreView`, consumed by `#announce`. It still reads once and never adds
  a live region.
- A game that was tied with the record before a reload is restored as "at the record" and
  shows no badge when it later passes it; telling "tied" from "broke" would need one more
  field in the save (a version bump) for a decoration. Accepted.
- Any record above 0 counts: after a very short first game the next game shows the badge a
  few moves in. A minimum record would be a new rule.
- While a modal dialog is open the page is inert, so a record broken by the move that wins
  or ends the game is not read; the badge still shows under the backdrop. The same limit
  the score already has.
- The badge's colours are the header's existing literals (`#ffd700` on `#3b3226`, 8.9:1);
  the theme task tokenises them with the rest.
- Not verified without a real screen reader: how NVDA and VoiceOver speak
  `New record! 1234`. The accessibility tree (no badge node, `New record!` only in the live
  region), the live-region text, and a burst of moves were checked.
