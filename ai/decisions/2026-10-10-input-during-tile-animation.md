# A press during a tile animation finishes the animation and is applied at once

Date: 2026-10-10 · Status: accepted

## Context

After every move the controller locked input for 100 ms (`#isMoving`, `MOVE_COOLDOWN_MS`) and
the presses in that window were dropped (MY-126). A move now animates for about 210 ms
(310 ms with a merge), so a lock as long as the animation would drop most fast presses. The
issue left the choice to the plan: a queue of one or two moves, or finish the running
animation at once and apply the next move.

## Decision

- **A press during an animation finishes it instantly and the new move starts from that
  board.** `GridView.animateMove` first jumps every running animation and transition to its
  end (`getAnimations({ subtree: true }).forEach((animation) => animation.finish())`),
  removes the retired tiles and drops the animation classes, then animates the new move.
  The model is applied synchronously in `requestMove`, so it is never behind the view and
  the saved game is always the real board.
- **No lock, no cooldown and no queue.** `#isMoving`, its timer and `MOVE_COOLDOWN_MS` are
  gone. `requestMove` refuses a move only after a win (until `Continue`) and after game
  over. Keyboard and swipe still share that one guard.
- **A held key moves on every repeat event** (about 30 a second, where the old cooldown
  capped it at 10). `event.repeat` is not filtered; ignoring it would be a separate change
  and is not part of this decision.
- **Reduced motion needs nothing in JS.** The animations are instant and no step waits, so
  input never waits either.
- Rejected: **a queue of one or two moves** that wait for the running animation. Every
  animation would play in full, but a press answers up to 310 ms late (and up to two moves
  later), a third press while two wait is still dropped, a held key keeps moving the board
  after it is released, and the controller needs a queue and a lock that are emptied on a
  new game, on a dialog and on game over, and a view that reports its duration, and `0`
  under reduced motion (a `matchMedia` object passed in from `main.js`).

## Consequences

- With presses 310 ms or more apart every animation plays in full; in a fast series the
  animations are cut short and the tiles jump. That is the price of never dropping or
  delaying a move.
- Checked in headless Chrome: the same series of presses (10, 30, 60, 100 and 300 ms apart,
  back to back, and with the auto-repeat flag, and touch swipes at 320 and 375 px) always
  leaves the DOM board, the saved game and a replay of the same moves on the model equal,
  with no stray tile and nothing still animating.
- The 500 ms debounce of the score announcement stays right, and more needed than before:
  see `2026-10-10-score-live-region-and-focus-ring.md`.
- A later feature that must run code after a move's animation cannot rely on it ending: a
  following press cuts it short.
