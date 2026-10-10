# MY-126 — tiles slide, merges pop, fast input is not lost

Issue: MY-126 · Branch: `my-126-tile-slides` · Spec: `ai/superpowers/specs/2026-10-10-tile-slides.md`

Blocker MY-109 (the architecture move) is `Done`. Related, not blocking: MY-124 (score pop),
MY-125 (New record badge), MY-113 (the save), MY-122 (the palette) — all `Done` and merged —
and MY-128 (game modes, `Todo`: the size is any `BOARD_SIZE`, section 2.7).

The issue has two items to "decide in the plan", so the work stops after this plan: the
restored game on screen (Q1) and input during an animation (Q2). Two more choices the
issue asked to be stated in the plan (dialog timing, Q3) or that I found on the way (the
reading order of the numbers, Q4) are in section 1 with a default; they are small and the
default stands unless the author says otherwise.

**MY-123 (the theme) is built in parallel** and will most likely land in `main` first: it
turns every colour literal in every CSS file, `board.css` and `tiles.css` included, into a
custom property. This plan changes no colour. The tile rules are moved as they are: the
selector changes (`.grid-cell[data-value…]` to `.tile[data-value…]`), the declarations do
not. The rename is mechanical (one global replace plus the structure rule in `board.css`), so
on the rebase the conflicts are resolved by taking MY-123's tokens and re-applying the
rename on top; the new tile elements keep the tokens.

## Decision records checked

None is contradicted. Some are refined and get a "refined by" note or a new record, the rest
are kept as they are:

- `2026-10-10-tile-palette.md` — its own consequences foresee this: "if they keep
  `data-value`, the base-first scheme and the tokens carry over with a renamed selector".
  The base rule stays first, no `:not()` chain, tokens only.
- `2026-10-10-css-custom-properties-from-js.md` — the "numbers passed to CSS" exception
  covers a tile's `--row` and `--col` as well as durations (a new record states it).
- `2026-10-10-score-live-region-and-focus-ring.md` — mentions the 100 ms cooldown as the
  reason for the debounce; with Q2 B the cooldown goes away, the debounce stays right
  (a held key is faster, not slower).
- `2026-10-10-saved-game-format.md` — the save keeps `{ version, board, score, hasWon }`;
  tile ids are runtime only and are never stored (a restored game gets fresh ones).
- `2026-10-10-win-and-game-over-same-move.md`, `2026-10-10-native-dialog.md`,
  `2026-10-10-confirm-dialog.md` — the dialogs open at once as today (Q3), so no new window
  in which two dialogs could stack.
- `2026-10-10-score-pop.md`, `2026-10-10-new-record-badge.md`,
  `2026-10-10-keyboard-by-event-code.md` — untouched.
- `2026-10-10-rejected-features.md` — nothing from it (no shake on a blocked move, no
  confetti).

## 1. Questions for the author

### Q1. A game restored from the save (decide in the plan)

| Option                                   | What the player sees                                                                                 | Cost                                                                   |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **A. No animation (recommended)**        | The board is there at once, exactly as it was left. A reload feels like a pause, not an event.       | `render(tiles)`: nothing to write.                                     |
| B. Pop-in of all tiles (like a new game) | An empty board for a moment, then 6 to 16 tiles pop in together, on every reload and every tab open. | `render(tiles, tiles)`: one argument. Reduced motion makes it instant. |

Why A: the issue's goal is "the board without a merge pulse"; a reload is not a game event
and nothing happened to the tiles, so nothing should move. B reads as "something started",
and a player who refreshes often sees the show every time. Switching later is one argument in
`GameController.#restoreSavedGame`.

### Q2. Input during an animation (decide in the plan)

|                                                         | A. A queue of 1 to 2 moves                                                                                                                                                                                                                                     | B. Finish the running animation at once, then apply the move (recommended)                                                                                                                      |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Press to reaction                                       | After the running animation: up to about 310 ms, and up to two more moves behind it.                                                                                                                                                                           | Immediate, always.                                                                                                                                                                              |
| Animations                                              | Every one plays in full.                                                                                                                                                                                                                                       | Cut short when the next press comes. With presses 310 ms or more apart every animation plays in full; in a fast series the tiles jump.                                                          |
| Lost presses                                            | Beyond the queue: a third press while two wait is dropped.                                                                                                                                                                                                     | None.                                                                                                                                                                                           |
| Held key (the keyboard repeats about 30 times a second) | Paced by the animation, 3 to 5 moves a second, and one or two more moves after the key is released.                                                                                                                                                            | A move per repeat event, much faster than today's 10 a second cap, like classic 2048. Ignoring `event.repeat` would be a separate, tiny change.                                                 |
| Code                                                    | A queue and a lock with a timer in `GameController`, drained when the animation ends; cleared on a new game, a dialog and game over; the view has to report its duration and report `0` under reduced motion (a `matchMedia` object passed in from `main.js`). | Nothing added. `#isMoving`, its timer and `MOVE_COOLDOWN_MS` are deleted. The view finishes its own animation first (`getAnimations().finish()`, one line). Reduced motion needs nothing in JS. |
| Risks                                                   | Stale queued moves after a game over or a win; "the board keeps moving after I let go".                                                                                                                                                                        | A hold-the-key run ends the game sooner than before; the animation in a rapid series is less visible.                                                                                           |

My recommendation is B. The model is applied synchronously either way, so the board is always
right; B adds no state, keeps every press, and answers at once, and it is the least code. A
is what to choose if every move must be seen in full at any speed, at the price of latency
and a queue. If A is chosen the rest of this plan holds; only section 2.5 and the controller
change (section 3 lists both).

### Q3. Dialogs: at once, or after the animation (the issue asked to say which)

My choice: **at once**, as today. `requestMove` stays one synchronous step (move, score, view,
dialog, save), the dialog's own 300 ms fade overlaps the 210 to 310 ms animation behind the
dimmed backdrop, and there is no window in which a dialog is "pending".

The alternative is a dialog after the animation, so the player sees the move that ended the
game. It costs a timer in the controller that every other path must cancel: `New Game` and the
buttons (`restart`) and the confirmation (a pending win dialog firing while the confirmation
is open would stack two modal dialogs, which `2026-10-10-confirm-dialog.md` rules out), and a
reload in the window loses the dialog. About a dozen lines and three edge cases for a polish
detail; I would not take it unless the author wants it.

### Q4. Reading order of the numbers (found on the way; default stands)

Today the cells are in the DOM in row-major order, so a screen reader in browse mode reads the
numbers row by row. Tiles are created as they appear, so their DOM order would be the order of
creation and change with every move. Default: after each move settles, `GridView` re-appends
the tiles in row-major order (about five lines), so nothing changes for a screen reader. The
alternatives are to leave the order alone (simplest, but the reading order becomes arbitrary)
or to hide the tiles from assistive technology (`aria-hidden`; loses the numbers, which are
readable today). The board has no other accessible structure today (no roles, no positions)
and that is not this issue.

## 2. Design

### 2.1 What the model reports (`game/`, no DOM, no timers)

`Board` keeps `{ id, value }` in its private grid; the id comes from a per-board counter, so
it is deterministic and the only randomness is still tile spawning. Public surface:

- `toArray()` — values, `0` for empty, unchanged: the save and `Game.toState()` keep working.
- `toTiles()` — `[{ id, value, row, col }]`, a copy, row-major. For drawing a whole board.
- `restore(cells)` — validation unchanged; gives every restored tile a fresh id.
- `spawnRandomTile()` — `{ id, row, col, value }` (the id is new).
- `move(direction)` —

```text
{
  moved,                         // true when at least one tile changes cell
  scoreGained,
  slides: [{ id, from: { row, col }, to: { row, col } }],
                                 // every tile that changes cell, one that merges included
  merges: [{ id, row, col, value, mergedFrom: [idA, idB] }],
                                 // the new tile and the two tiles it replaces
}
```

`Game.move()` returns `{ moved, scoreGained, slides, merges, spawnedTiles, justWon, isOver }`
(`spawnedTiles` now carry ids; empty `slides` and `merges` when nothing moved). A new getter
`Game.tiles` returns `Board.toTiles()`; `Game.cells` has no user left and is removed.

**A merge makes a new tile; it does not double a survivor.** The two sources slide into the
cell and the merged tile, with its own id, appears there when they arrive. The issue's "which
tile merged into which" is `mergedFrom`. The point: the view never changes the value of an
element. A tile is created with its number, keeps it until it is removed, and the palette
rules apply once at creation; no text swap in the middle of an animation and no JS timer to
time one. Rejected: the leading tile keeps its id and doubles (`mergedInto`): the number flip
has to be timed in JS at the end of the slide, and it needs more state to cut it short.

`from` is in the result because the issue asks for from to to and it makes a move
self-describing; the view only uses `to` and the id.

**Checked on a prototype** (scratchpad, not committed): the new `Board` against the current
algorithm on 60,000 random boards (3x3 to 6x6, every direction): identical resulting values,
`moved` and score, and the invariants of the description hold (every `from` is where the tile
was, every `to` is where it is, the merged tile sits in the merge cell with the summed value,
both sources end in that cell and are gone, nothing else is lost, ids are unique). The check is
repeated on the real file.

### 2.2 How it is drawn (`ui/GridView.js`, styles)

- `.game-grid` keeps its job (the focusable board, the CSS grid) and gets `position: relative`.
  `GridView` fills it with `size * size` empty `.grid-cell`s, background only: no number, no
  `data-*`.
- Each tile is a `div.tile` appended to the same `.game-grid`: `position: absolute`,
  `top` and `left` of `var(--cell-gap)`, `width` and `height` of `var(--cell-size)`, and its
  position from two custom properties that the view writes, `--row` and `--col`:

  ```css
  translate: calc(var(--col) * (var(--cell-size) + var(--cell-gap)))
    calc(var(--row) * (var(--cell-size) + var(--cell-gap)));
  ```

  `--cell-size` and `--cell-gap` are the viewport-relative `clamp()`s from `layout.css` and are
  inherited, so a resize needs no JS and no `px` is written anywhere. It is the "numbers to
  CSS" exception again (`ai/rules/architecture.md`), now covering a tile's cell.

- **`translate` and `scale`, not `transform`.** The issue says `transform: translate(...)`.
  A tile's position and its pop would both live in `transform`, and a pop keyframe would
  replace the position and drop the tile in the grid's corner. The individual properties are
  independent, are in Vite's default baseline-widely-available set (Chrome 104, Firefox 72,
  Safari 14.1), already carry the record badge, and keep one element per tile. The alternative
  is a wrapper (`.tile` for the position, `.tile-inner` for the pop): two elements per tile.
- **The slide `transition` exists only while a move animates.** Measured on a prototype in
  headless Chrome: with `transition: translate` always on, a resize from 1000 to 320 px moved
  the cell at once and the tile took about 100 ms to follow (the viewport-relative cell size
  changes the computed `translate` on every frame of a drag, so the tiles would trail the grid
  the whole time). So `transition` is on `.game-grid.is-sliding .tile`; the view sets
  `is-sliding` when a move starts and clears it when the move settles, and at rest a tile is
  glued to its cell. Prototype result: with the class added in the same tick as the new
  `--col` the slide still plays (268 to 380 px over about 110 ms) and the resize no longer lags.
- **Styles move, they are not rewritten.** In `tiles.css` every `.grid-cell[data-value…]`
  becomes `.tile[data-value…]` (the fallback rule stays first), declarations as they are. In
  `board.css` the structure rule (`font-weight`, `box-shadow`) becomes `.tile` and gains the
  position, size, centering, radius and `translate`; its `transition: all` goes (a tile's
  value never changes now). `.new-cell` and `.merged-cell` become `.new-tile` and
  `.merged-tile` (renamed because the thing they describe is no longer a cell), and the
  dead `data-row` and `data-col` attributes of the cells go.

`GridView` public API:

- `render(tiles, spawnedTiles = [])` — settle, remove every tile element, draw `tiles` at
  their cells with no slide; a tile whose id is in `spawnedTiles` pops in. New game and the
  restored game (Q1) use it.
- `animateMove({ slides, merges, spawnedTiles })` — settle the previous move first, turn
  `is-sliding` on, then: each slide sets that tile's `--row` and `--col`; each merge retires
  the two sources (`.retired-tile`) and creates the merged tile (`.merged-tile`); each spawned
  tile is created (`.new-tile`, with a modifier for how long it waits); schedule the settle.
- `focus()` — unchanged.

Private state: `#tiles` (`Map` of id to element), the retired elements, the settle timer id.
`#settle()` is idempotent: cancel the timer; jump every running animation and transition to its
end (`this.#element.getAnimations({ subtree: true }).forEach((animation) => animation.finish())`);
remove the retired elements; drop the `new-tile`, `merged-tile` and modifier classes; clear
`is-sliding`; re-append the tiles in row-major order (Q4). _Built differently: the re-append is not
part of the settle that starts a move, see section 7._

### 2.3 The sequence: slide, merge pop, new tile

All of it is CSS, so the view holds no timer per step. `GridView` passes two numbers from
`constants.js` as custom properties on `.game-grid` (replacing `--tile-animation-duration`):
`--tile-slide-duration` (110 ms) and `--tile-pop-duration` (100 ms).

- **Slide** — `transition: translate var(--tile-slide-duration) ease-out` on `.is-sliding .tile`.
- **Sources of a merge** — `.retired-tile`: a zero-length animation that starts after the slide
  and sets `visibility: hidden`. The sources never peek out from under the merged tile and
  their shadows do not pile up behind it.
- **Merged tile** — `.merged-tile` is `visibility: hidden` until its `animation-delay`
  (the slide) and then pops `scale` 1, 1.1, 1 over the pop duration with `fill-mode: forwards`;
  the keyframes set `visibility: visible`. It is fully opaque at full size from its first
  frame, exactly when the sources vanish, so there is no flash and no gap.
- **New tile** — `.new-tile` is the existing `pop-in` (opacity 0 to 1, scale 0.5 to 1). In a
  move it waits for the slide, or for the slide and the merge pop when the move merged
  something (a modifier class set by the view); in `render()` it starts at once.
- A move with merges takes `slide + 2 * pop` = 310 ms, one without `slide + pop` = 210 ms.
  The numbers are starting values and are tuned by eye in the browser.
- One `setTimeout` per move in the view (`slide + 2 * pop + 50 ms`, the pattern the current
  `ANIMATION_CLEANUP_MS` has) runs `#settle()`. It only tidies; correctness and input never
  wait for it.

Checked on the prototype by sampling every 20 ms: the sources slide from 156 to 45 px in about
106 ms, at about 110 to 127 ms the sources are hidden and the merged tile is visible in the
same sample, and its width peaks at about 108 on 100 px and returns to 100.

### 2.4 The merge pulse is real-merge-only (the bug)

Today `GridView.#renderCell` pulses whenever a cell's number differs from the previous one.
In the new model an element's value never changes, so a plain slide has nothing to pulse: the
pop is the animation of a `.merged-tile`, and a `.merged-tile` is only ever created from
`result.merges`. The restored game calls `render()` and is not a merge either, so the reload
pulse (the fourth item in the issue) goes away with it.

### 2.5 Input and the lock (Q2)

With B (recommended): `GameController.requestMove` is `if (paused after win or game over)
return`, then `game.move`, then the view and the rest as today. `#isMoving`, its `setTimeout`
and `MOVE_COOLDOWN_MS` are deleted. A press that arrives during an animation reaches
`GridView.animateMove`, whose first step is `#settle()` — the running move is finished instantly
and the new one starts from the finished board. The model is applied synchronously, so it is
never "behind" the view and the saved game is always the real board.

With A: `#isMoving` becomes `#isAnimating`, `MOVE_COOLDOWN_MS` becomes the animation length
(0 under reduced motion, so the view reports its duration and gets a `matchMedia` object from
`main.js`), a queue of at most two directions is drained when the animation ends (each drained
move re-runs the guards), and the queue is emptied on a new game, a dialog and game over.

### 2.6 Reduced motion

`motion.css` already makes every animation and transition 0.01 ms. What it does not zero is the
delays that order the steps, so under reduced motion it also sets `--tile-slide-duration` and
`--tile-pop-duration` to `0ms !important` on `.game-grid` (an `!important` stylesheet
declaration beats the non-important inline value the view sets). Result: no slide, no pop, no
step waits for another, the merged and new tiles appear in the same frame as the move. With B
the JS needs to know nothing about it.

### 2.7 Any board size

The model takes `size`; the grid is `repeat(var(--board-size, 4), …)`; a tile's position uses
only `--row`, `--col` and the cell variables; no `4`, no row or column count and no pixel
value is written in the tile code or styles. Checked on 3x3 and 5x5 by changing `BOARD_SIZE`
temporarily (not committed; a save of another size is rejected by `Game.restore`, so the check
starts a new game).

### 2.8 The existing features

| Feature                         | What happens                                                                                                                                                                                                    |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Score pop `+N` (MY-124)         | Unchanged: shown in `requestMove` at the moment of the move, 110 ms before the tiles merge on screen. One at a time, so a fast series still draws one number.                                                   |
| New record badge (MY-125)       | Unchanged: `#renderScore` at the moment of the move.                                                                                                                                                            |
| The save (MY-113)               | Written right after the move, as today, from `Game.toState()`; the format and the version are untouched. Restore gives fresh ids and calls `render()`. A reload during an animation just shows the saved board. |
| Win and game-over dialogs       | Open at once (Q3); the same precedence. `restart()` calls `render()`, which settles first and removes every tile, so a move still in flight cannot leak into the new game.                                      |
| Swipe and keyboard              | The same `requestMove`. `SwipeInput` listens on `.game-container`; tiles are its descendants, so their pointer events bubble.                                                                                   |
| Focus on the board              | `.game-grid` stays the focused element and keeps `outline: none`.                                                                                                                                               |
| Score live region, confirmation | Not touched.                                                                                                                                                                                                    |

### 2.9 Size budget

Now: JS 4.49 kB of 8 kB, CSS 2.73 kB of 4 kB (gzip), font 35.35 kB of 40 kB. Expected: JS
+0.4 to 0.7 kB (the tile ids and the plan in `Board`, the view's life cycle, minus the lock),
CSS +0.2 to 0.3 kB (the tile structure and keyframes, minus the old animations). MY-123 will
add its own tokens to the CSS, probably 0.3 to 0.5 kB, so the CSS may end near 3.5 kB; the
budget is not raised unless a measurement says so, and then on purpose, in the change that needs
it.

## 3. Where each part lives (`ai/rules/oop.md`)

| File                            | Change                                                                                                                                                                                    |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/scripts/game/Board.js`     | Tiles with ids; `toTiles()`; `spawnRandomTile()` with an id; `restore()` assigns ids; `move()` returns `slides` and `merges`; line sliding split into a private plan and a private apply. |
| `src/scripts/game/Game.js`      | `tiles` getter replaces `cells`; `move()` passes `slides` and `merges` through.                                                                                                           |
| `src/scripts/ui/GridView.js`    | Section 2.2 and 2.3: background cells, tile elements, `render()`, `animateMove()`, `#settle()`.                                                                                           |
| `src/scripts/GameController.js` | `animateMove(result)` after a move; `render(game.tiles, …)` for a new game and a restore; with Q2 B no lock (`#isMoving`, `MOVE_COOLDOWN_MS` import gone).                                |
| `src/scripts/constants.js`      | `TILE_SLIDE_MS`, `TILE_POP_MS` and the cleanup delay replace `TILE_ANIMATION_MS` and `ANIMATION_CLEANUP_MS`; with Q2 B `MOVE_COOLDOWN_MS` is removed.                                     |
| `src/scripts/main.js`           | No change with Q2 B. With A it passes a `matchMedia` object to the view.                                                                                                                  |
| `src/styles/board.css`          | `.game-grid` position; `.grid-cell` as background; `.tile` structure and position; `.new-tile`, `.merged-tile`, `.retired-tile` and their keyframes; the `is-sliding` transition.         |
| `src/styles/tiles.css`          | Selector rename only; every declaration stays.                                                                                                                                            |
| `src/styles/motion.css`         | The two durations to `0ms` under reduced motion.                                                                                                                                          |
| `README.md`, `ai/*`             | See below.                                                                                                                                                                                |

Docs in the same change: `README.md` (features: the slide and the pops, fast input; structure
line for `board.css`); `ai/map.md` (`GridView`, `Board`, `Game`, `GameController`, constants,
the styles table, and the "known coupling left for MY-126" paragraph is removed);
`ai/rules/oop.md` (the `Game.move()` result), `ai/rules/architecture.md` (a tile is drawn by
`GridView` from the model's move result; the custom-property exception now covers a tile's
cell; the board has a background grid and tile elements), `ai/rules/style.md` (the tile selector
and the base rule, the new tile structure, the reduced-motion rule for the durations);
`ai/skills/feature.md` (model result to view to animation, the tile selector) and
`ai/skills/review.md` (the checklist items for tiles and input); new decision records
`2026-10-10-tiles-over-the-grid.md` (elements over a background grid, position from `--row` and
`--col`, a merge makes a new tile, the transition only while sliding, the sequence in CSS) and
`2026-10-10-input-during-tile-animation.md` (the answer to Q2 and why), both in the decisions
index, plus a "refined by" line in `2026-10-10-tile-palette.md` and, with Q2 B,
`2026-10-10-score-live-region-and-focus-ring.md`.

## 4. Commits

1. `docs:` spec and plan (this commit, before any code).
2. `docs:` the author's answers in the plan and the spec.
3. `refactor:` tile ids and the move result in the model: `Board` and `Game` (additions only,
   so the app still runs on the old view).
4. `feat:` tiles as elements over the grid, with the slide, merge and new-tile sequence:
   `GridView`, the controller, `constants.js`, `board.css`, `tiles.css`, `motion.css`. One
   commit because the markup, the selectors and the styles only work together; `Game.cells` is
   removed here, when its last user goes.
5. `docs:` README, map, rules, skills, the decision records and their index.

If MY-123 lands in `main` first, the branch is rebased onto it before commit 3 and the tile rules
keep its tokens.

## 5. Verification

`yarn lint`, `yarn format:check`, `yarn build`, `yarn size` (baseline above). Then play it in
`yarn dev --port 5192 --strictPort`, driven by a headless Chrome over the DevTools protocol
(port 9432, its own profile): real key events (`Input.dispatchKeyEvent`, with auto-repeat),
touch swipes (`Input.dispatchTouchEvent`), `Emulation.setEmulatedMedia` for reduced motion,
`Emulation.setDeviceMetricsOverride` for widths, a `getBoundingClientRect` timer and
`Animation.setPlaybackRate` for frames in the middle of an animation. Positions come from
`localStorage`. The built-in browser pane is hidden here and cannot run animations; it is not
used for this.

- **Slide:** a tile's x over time goes from the old cell to the new one in about the slide
  time; the cells never move; the merged tile appears when both sources have arrived.
- **Pop only on real merges:** `animationstart` events (`merge-pop`) counted against the
  merges of each move over a whole game: none for a slide, one per merged pair for a merge;
  and none after a reload.
- **Fast input:** key presses 10, 30, 60, 100 and 300 ms apart, and with the auto-repeat flag,
  with `Math.random` seeded; the final board equals a replay of the same moves on the model,
  and after the animations settle the DOM tiles (value, `--row`, `--col`) equal
  `savedGame.board`. A burst that spans a game over and a new game leaves no stray tile.
- **Resize:** at 1000, 768, 375 and 320 px, and in the middle of a move: every tile's rect is
  its cell's rect once settled, and does not lag during a width change.
- **Reduced motion:** the tiles are in their final cells in the next frame; `getAnimations()`
  is empty; input is never waiting.
- **Reload mid-game:** the saved board, no animation, no pulse; a reload in the middle of a
  move shows the saved board.
- **Flows:** win (a 1024 pair), game over, win and game over on one move (the game-over
  dialog only), `Continue Playing`, `New Game` in the middle of an animation; `+N` and the
  New record badge on the same moves as before; focus on the board after a dialog.
- **Other sizes:** 3x3 and 5x5 with a temporary `BOARD_SIZE`.
- **Mobile:** 320 and 375 px with touch swipes: slides play, no horizontal scroll, the board
  does not scroll the page.
- **Not verifiable here:** smoothness on a real phone (only the emulated viewport and the
  frame timing are checked; the animated properties are `translate`, `scale`, `opacity`,
  which run on the compositor), and a screen reader (the reading order is checked in the
  accessibility tree).
- Screenshots and a frame sequence of a slide and a merge go to the scratchpad.

## 6. Author's answers (2026-10-10)

The author approved the plan with every recommendation in it.

1. **Q1. A restored game.** Option A: it renders without any animation (`render(tiles)`), so
   there is no merge pulse and no pop-in after a reload.
2. **Q2. Input during an animation.** Option B: the view finishes the running animation at once
   (`getAnimations({ subtree: true }).forEach((animation) => animation.finish())`) and the next
   move is applied right away. `#isMoving`, its timer and `MOVE_COOLDOWN_MS` are removed. Key
   auto-repeat stays as it is, each repeat event is a move; ignoring `event.repeat` is out of
   scope.
3. **Q3. Dialogs.** The win and game-over dialogs open immediately, as today; the animation
   runs under the backdrop.
4. **Q4. Reading order.** After a move settles, `GridView` re-orders the tile elements row by
   row, so the reading order of the numbers stays as it is today.
5. **Also accepted:** the `translate` and `scale` properties instead of
   `transform: translate(...)` (the deviation from the issue text, and why, is in section 2.2
   and goes into the decision record); the transition only on `.game-grid.is-sliding .tile`
   (section 2.2); a merge creates a new tile with a new id (section 2.1).
6. **MY-123 and the rebase.** The `tiles.css` change stays a pure selector rename, so it can be
   redone on top of MY-123's tokens if that task lands later. `main` had not moved when the work
   started (still `5179db6`), so the rebase before coding was a no-op.

## 7. What building it found

- **Re-ordering the DOM cannot run at the start of a move.** The first version called one
  `#settle()` (finish, tidy, re-append row by row) at the start of `animateMove`. Sampled
  frames showed the tiles jumping instead of sliding: a node that is re-inserted has no
  before-change style, so its transition does not run. It is two methods now: `#finish()`
  (finish the running animations, remove the retired tiles, drop the animation classes,
  clear `is-sliding`) starts every move and `render()`, and `#settle()` (`#finish()` and then
  the row-by-row re-append) only runs from the timer, when nothing is about to slide. During a
  rapid series the DOM order is therefore the creation order until the series stops.
- **The merge pop starts at scale 1, not 0.95.** The old keyframes began at 0.95; the merged
  tile has to cover the two tiles that slid under it from its first frame, so it is 1, 1.1, 1.
- **Measured, with real key events in headless Chrome** (dev server and the production build):
  - A slide of 16 from column 3 to 1: 618 px to 394 px in about 110 ms (ease-out); the two
    merge sources are hidden and the merged tile is visible in the same frame, at about 113 ms;
    the merged tile peaks at 110 px on 100 px at about 158 ms; the new tile starts at about
    213 ms and is opaque at about 312 ms; the timer settles at about 360 ms.
  - Reduced motion: in the next frame the tile is at its cell, the merged and new tiles are
    visible at full size and opacity, `getAnimations()` is empty.
  - Fast input, 8 runs of 48 to 80 presses (10, 30, 60, 100, 300 ms apart, back to back, and
    auto-repeat at 33 ms): the DOM board, the saved board and a replay of the same moves on the
    model (with the page's own random numbers) are equal in every run, exactly two random
    draws per applied move, no retired or stray tile, no running animation, tiles in row-major
    order, no console error.
  - Merge pop only on real merges: over 40 presses (23 moves with merges, 15 plain slides) the
    `merge-pop`, `tile-retire` and `pop-in` starts match the model's merges and spawns move by
    move; none after a reload; two `pop-in` for a new game.
  - Resize: tiles sit on their cells (offset 0 px) after every width change (1000, 768, 600,
    375, 320, 500), during a drag from 1000 to 320 (worst offset 0.08 px) and after a resize in
    the middle of a move.
  - Swipes at 320 and 375 px (400 and 60 ms apart): board equal to the replay, no horizontal
    overflow, the page never scrolled. Frame intervals during a slide at 4x CPU throttling:
    median 4.2 ms, worst 16.7 ms (headless runs the frame loop uncapped).
  - 3x3 and 5x5 with a temporary `BOARD_SIZE` (not committed): the replay matches and tiles sit
    on their cells at 1000 and 320 px. 5x5 at 320 px is 22 px wider than the screen because of
    the existing 60 px minimum cell size (`layout.css`, the game-modes issue's to fit).
  - Win, game over, win and game over on one move, `Continue`, `New Game` and `Restart Game`
    in the middle of an animation, `+N` and the New record badge (and its one announcement) all
    behave as before; the dialogs open before the animation ends.
- **Size:** JS 4.99 kB (was 4.49, +0.50) and CSS 2.90 kB (was 2.73, +0.17), font unchanged:
  inside the estimates of section 2.9.
- **Not verified:** a real phone and a real screen reader.
