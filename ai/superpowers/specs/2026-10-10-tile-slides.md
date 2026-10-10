# MY-126 — tiles slide, merges pop, fast input is not lost (spec)

Issue: MY-126 · Branch: `my-126-tile-slides` · Plan: `ai/superpowers/plans/2026-10-10-tile-slides.md`

The issue left two questions to the plan: what a game restored from the save does on screen,
and what happens to input during an animation. The author answered them on 2026-10-10 (plan,
section 6) and approved the recommended behavior in both; this text is that behavior.

## Goal

A move is seen: tiles slide to their new cells, two tiles that merge slide into one cell and
the merged tile pops, then the new tile pops in. The merge pop belongs to real merges only,
a game restored from the save appears without one, and a series of fast presses neither
loses moves nor breaks the board. Rules, scoring, the saved data and the look of the tiles do
not change.

## What is wrong today

- Tiles do not move: a cell just changes its number, so the board jumps from one position to
  the next.
- The merge pop fires on any change of a cell's value, so a tile that only slid into an empty
  cell pulses as if it had merged.
- After a move the input is locked for 100 ms and the presses in that window are dropped.
- After a reload every tile of the restored game gets the merge pop once.

## Behavior

### One move, in three steps

| Step         | What the player sees                                                                                                                              | Time    |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 1. Slide     | Every tile that changes cell moves to it in a straight line. A tile that stays does not move. Two tiles that merge both slide into the same cell. | ~110 ms |
| 2. Merge pop | When they arrive the two are replaced by one tile with the doubled value, which grows to about 110% and settles back. Only a real merge pops.     | ~100 ms |
| 3. New tile  | The new tile fades in from half size to full size. It starts after the slide, or after the merge pop when the move merged something.              | ~100 ms |

- A move with merges takes about 310 ms, one without about 210 ms. The numbers are starting
  values, tuned by eye in the browser and kept in `constants.js`.
- Several merges in one move pop together. A move that only slides never pops anything but
  the new tile.
- The score, the `+N` pop, the New record badge and the save change at the moment of the
  move, not at the end of the animation; they are not delayed.
- A move that changes nothing is ignored as today: no animation, no new tile.

### New game, restored game

- **New Game / Restart Game:** the old tiles disappear at once and the two starting tiles pop
  in, as today.
- **Reload with a saved game:** the board appears at once, exactly as it was left, with no
  animation of any kind: no merge pop and no pop-in.

### Fast input

- A press during an animation finishes it at once (every tile jumps to where it was going,
  merges are applied, the new tile is shown) and the new move starts from that board. Nothing
  is queued, nothing is dropped, there is no delay between a press and its move.
- A move is never applied to a board that is not yet in its final state, and the board after
  any series of presses is the board the rules give for those moves.
- The 100 ms input lock (`isMoving`, `MOVE_COOLDOWN_MS`) is gone. A held key repeats at the
  keyboard's own rate and each repeat event is a move; ignoring `event.repeat` is not part of
  this issue.
- Keyboard and swipe behave the same, and both still go through `requestMove`.

### Dialogs

- The win and game-over dialogs open at once after the move that causes them, as today, and
  the move animates behind the dimmed backdrop. `Game over` still wins over `win` on the
  same move (`ai/decisions/2026-10-10-win-and-game-over-same-move.md`).
- `New Game` and the buttons in the dialogs clear the board and cut any animation in flight.

### Reduced motion

- With `prefers-reduced-motion: reduce` there is no slide, no pop and no waiting: the board
  changes at once and the input never waits.

### Size and position

- Tiles stay in their cells at any window width, including while the window is being
  resized: no tile lags behind the grid. A resize in the middle of a move does not leave a
  tile in the wrong place.
- Any board size works (`BOARD_SIZE`, the future game modes); no `4` is written in the
  tile code or its styles.
- Tile colours, text sizes and the 2048 glow are exactly the ones in `tiles.css` today; only
  the element they apply to changes (a tile, not a grid cell).

### Unchanged

- Moves, merges, scoring, win, game over, high score, the New record badge, the score pop,
  the score's live region, keyboard and swipe mapping, the confirmation, focus on the board
  after a dialog, the saved game and its format (`SAVED_GAME_VERSION` stays 1).
- The board is still one focusable element (`.game-grid`, no outline). The numbers on the
  tiles stay readable text in the page, in row-major order: after a move settles the tiles are
  re-ordered row by row in the DOM.

## How it will be checked

No automated tests exist. The change is played in `yarn dev` and driven by a headless Chrome
over the DevTools protocol (real key and touch events, auto-repeat, emulated reduced motion,
resized viewport), because the built-in browser pane cannot run animations here. Positions
come from `localStorage` (`highScore`, `savedGame`).

- Slide: a tile's position sampled over time moves from its old cell to its new cell in about
  110 ms; the grid cells never move.
- Merge pop only on merges: the `animationstart` events of a game are counted against the
  merges of every move; a plain slide produces none, a merge produces one per merged pair.
- Reload mid-game: no `animationstart` at all after the load, and the tiles are the saved ones.
- Fast input: key presses at several rhythms (10 to 300 ms apart) and with the auto-repeat flag
  against a seeded `Math.random`; the final board equals a replay of the same moves on the
  model, and the board in the DOM equals the saved one.
- Resize at 1000, 768, 375 and 320 px, also in the middle of a move: every tile's rectangle
  equals the rectangle of its cell, with no lag.
- Reduced motion: the tiles are in their final cells in the next frame, no animation runs.
- Win, game over and both on one move; `+N` and the badge; 3x3 and 5x5 (temporary
  `BOARD_SIZE`, not committed); swipes on a 320 and 375 px touch screen.
- Screenshots and a frame sequence of a slide and a merge go to the scratchpad.
