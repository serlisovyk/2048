# Tiles are elements over a background grid; a move is animated from the model's result

Date: 2026-10-10 · Status: accepted

## Context

A tile used to be the grid cell itself: a move rewrote the numbers in place, so tiles never
travelled, and the merge pop fired on any change of a cell's value, so a tile that only
slid into an empty cell pulsed too. After a reload every restored tile pulsed once for the
same reason (MY-126). Sliding needs a tile that is the same element before and after a
move, which means it needs an identity, a position of its own, and a way for the view to
know what moved without guessing from a diff of two boards.

## Decision

- **Tiles are `.tile` elements over a background grid.** `.game-grid` stays the focusable
  board and the CSS grid; `GridView` fills it with `size * size` empty `.grid-cell`s (the
  background, no numbers) and appends the tiles to it. A tile is `position: absolute` in
  the cell size, and its position is `translate` built from two custom properties the view
  writes, `--row` and `--col`, and the inherited `--cell-size` and `--cell-gap`. No pixel
  value is written by JS or CSS, so a resize needs no JavaScript and any `BOARD_SIZE`
  works. This extends `2026-10-10-css-custom-properties-from-js.md`: the numbers JS passes
  to CSS now include the cell a tile sits in.
- **`translate` and `scale`, not `transform`.** The issue said
  `transform: translate(...)`. A tile's position and its pop would both live in
  `transform`, and a pop keyframe would replace the position and drop the tile in the
  grid's corner. The individual properties are independent, are in Vite's default
  baseline-widely-available set (Chrome 104, Firefox 72, Safari 14.1) and already carry the
  record badge. The author accepted the deviation. Rejected: a wrapper (`.tile` for the
  position, `.tile-inner` for the pop), which costs two elements per tile.
- **The model reports the move with tile ids**, no DOM: `Game.move()` returns
  `slides` (`{ id, from, to }` for every tile that changes cell), `merges`
  (`{ id, row, col, value, mergedFrom: [idA, idB] }`) and `spawnedTiles`; `Game.tiles` is the
  whole board for a full draw. Ids come from a per-board counter, are runtime only and are
  never saved (a restored game gets fresh ones), so the saved-game format and its version
  do not change (`2026-10-10-saved-game-format.md`).
- **A merge makes a new tile; it does not double a survivor.** The two sources slide into
  the cell and vanish, and the merged tile, with its own id, pops there. A tile element is
  created with its number and never changes it, so there is no text swap in the middle of
  an animation, no JS timer to time one, and the palette rules apply once, at creation.
  Rejected: the leading tile keeps its id and doubles (`mergedInto`), which needs the
  number flipped by a timer at the end of the slide.
- **The sequence is CSS delays, not JS timers**: slide (110 ms), then the merge pop
  (100 ms, `scale` 1, 1.1, 1), then the new tile (`pop-in`, 100 ms; it waits for the slide, or
  for the slide and the merge pop when the move merged something). The merged tile is
  `visibility: hidden` until its delay and fully opaque at full size from its first frame,
  at the moment the two sources, `.retired-tile`, turn `visibility: hidden`: no flash and
  no gap. The numbers live in `constants.js` and reach CSS as `--tile-slide-duration` and
  `--tile-pop-duration`. One `setTimeout` per move only tidies up (removes the retired
  elements, drops the animation classes); nothing depends on it.
- **The slide `transition` exists only while a move runs** (`.game-grid.is-sliding .tile`).
  Measured: with a standing `transition: translate`, a resize from 1000 to 320 px moved the
  cell at once and the tile took about 100 ms to follow (the viewport-relative cell size
  changes the computed `translate` on every frame of a drag), so tiles would trail the grid
  the whole time the window is dragged. Rejected: registering `--row` and `--col` with
  `@property` and transitioning those (Firefox 128, newer than the browser target).
- **No animation for a restored game**, and a new game's two starting tiles pop in (the
  author's answer; `render(tiles, spawnedTiles)`). A game restored from the save has
  nothing that happened to it, so nothing moves and there is no merge pulse after a reload.
- **The win and game-over dialogs open at once** after the move, as before, and the move
  animates under the dimmed backdrop. Rejected: opening them after the animation, which
  needs a pending-dialog timer that every other path (`New Game`, `Restart Game`, the
  confirmation) would have to cancel, and could stack two modal dialogs
  (`2026-10-10-confirm-dialog.md`).
- **Reading order is kept.** After a move settles, `GridView` re-appends the tiles in the
  DOM row by row, so a screen reader in browse mode reads the numbers in the order of the
  board, as it did when the cells were the tiles. Re-inserting a node drops its pending
  transition, so this runs at the end of a move, never at the start of the next.
- **Reduced motion:** `motion.css` sets `--tile-slide-duration` and `--tile-pop-duration` to
  `0ms !important` on `.game-grid` (it beats the inline value the view sets), so nothing
  slides, pops, or waits for another step; the board changes in the next frame.

## Consequences

- A new tile value is still a token plus one rule after the base `.tile[data-value]` rule
  (`2026-10-10-tile-palette.md`); the theme task keeps its tokens on `.tile`.
- A feature that needs to know what moved reads `slides` and `merges`; it never diffs
  boards. The model stays free of DOM, timers and storage.
- A press during an animation finishes it at once; see
  `2026-10-10-input-during-tile-animation.md`.
- During a rapid series the tiles stay in creation order in the DOM until the series stops
  (the settle timer); only the reading order at rest is guaranteed.
- Not verified without a real phone: smoothness on a low-end device. The animated
  properties are `translate`, `scale` and `opacity`, and the transition runs on at most
  one board of tiles.
- The 5x5 board at 320 px is wider than the screen because of the existing minimum cell
  size (60 px) in `layout.css`; the tiles stay on their cells. Fitting other board sizes is
  the game-modes issue (MY-128).
