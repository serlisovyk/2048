# Architecture Rules

All sources live in `src/`; Webpack builds them into `dist/` at the repo root. The JavaScript is object-oriented — see `ai/rules/oop.md` for the class
conventions. `ai/map.md` says where every file and class lives.

## Game Structure

- The board size and the win tile are settings (`boardSize`, `winTile`). `GameController`
  reads them from the shared `Settings` when a game starts and hands them to `Game` and
  `GridView.render`; CSS gets the size as `--board-size`. A saved game carries its own size
  and win tile (`ai/decisions/2026-10-12-board-size-records-and-saved-game.md`,
  `ai/decisions/2026-10-13-win-target-per-board-size.md`).
- The game counts its moves; the summary in the win and game-over dialogs and the
  statistics read the game, never a copy of its numbers
  (`ai/decisions/2026-10-13-statistics.md`).
- Generate grid cells from JavaScript instead of duplicating board structure in
  HTML. The cells are only the background; a tile is its own element over them
  (`ai/decisions/2026-10-10-tiles-over-the-grid.md`).
- Logic, then the move result, then the animation: the model reports a move as
  `slides`, `merges` and `spawnedTiles` (with tile ids, no DOM), the controller hands
  it to `GridView.animateMove`, and the view animates it. A press during an animation
  is never queued or dropped: the view finishes the running one
  (`ai/decisions/2026-10-10-input-during-tile-animation.md`).
- Keep keyboard and pointer input routed through `GameController.requestMove` so
  paused and game-over states stay consistent.

## Boundaries

- Do not move styles into inline attributes. The one exception: a view may set CSS
  custom properties that pass numbers to CSS: from `constants.js` (the board size, the
  tile durations) and the cell a tile sits in (`--row`, `--col`).
- Do not move interaction logic into HTML event handlers.
- Do not build modals by hand: dialogs are native `<dialog>` elements opened with
  `showModal()`, with no custom overlay, focus trap, or `style.display` toggling
  (`ai/decisions/2026-10-10-native-dialog.md`).
- Never two dialogs open at once: a question asked from the settings closes the settings first
  and reopens them after the answer (`ai/decisions/2026-10-14-settings-reopen-after-a-question.md`).
- Do not add React, Vue, Angular, or another UI framework.
- Do not rename existing CSS classes only for cosmetic reasons; class names are part
  of the local styling contract.
