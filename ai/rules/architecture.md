# Architecture Rules

All sources live in `src/`; Vite builds with `root: 'src'` into `dist/` at the repo
root. The JavaScript is object-oriented — see `ai/rules/oop.md` for the class
conventions. `ai/map.md` lists every file.

## File Responsibilities

- `src/index.html` owns the page markup, landmarks, metadata, favicon link, and the
  Vite entry script (`./scripts/main.js`).
- `src/favicon.svg` is the only image; Vite hashes it into `dist/assets/`.
- `src/fonts/` holds the self-hosted font (one woff2 that carries its own license metadata); `base.css`
  declares it and `index.html` preloads it.
- `src/scripts/main.js` is the composition root: imports the styles, finds the DOM
  elements, creates and wires the objects, starts the game.
- `src/scripts/constants.js` holds every shared number and key.
- `src/scripts/ThemeController.js` owns the theme: the current theme, its saved choice and
  following the system. `ui/ThemeView.js` owns `<html data-theme>`, the toggle button and
  the `theme-color` metas. `src/styles/theme.css` holds every UI colour for both themes.
  The inline script in the `<head>` of `index.html` applies the theme before the first paint;
  it is the one code that is not a class (it runs before any module).
- `src/scripts/SettingsController.js` owns the settings use cases: loading and saving the
  settings (the `settings` key and its `version`), opening the dialog, and applying a change,
  asking first when it would end a game in progress. `game/Settings.js` holds the values and
  checks them against `SETTING_DEFINITIONS`; `ui/SettingsView.js` owns the dialog, its toolbar
  button and `Close`; the button is shown since the first section (Board size) exists
  (`ai/decisions/2026-10-11-settings-dialog-and-storage.md`).
- `src/scripts/StatisticsController.js` owns the all-time numbers' use cases: loading and saving them (the
  `statistics` key and its `version`), applying the events `GameController` reports (a move, a game left by a new
  one) and the reset. `game/Statistics.js` holds the four numbers and counts what it is told
  (`ai/decisions/2026-10-13-statistics.md`). The Statistics section of the settings is markup plus two
  `SettingsView` methods; the numbers are not settings.
- `src/scripts/GameController.js` owns the use cases and flow state: the single
  movement guard, the pause after a win, the high score of each board size (and whether
  the current game can still beat it, for the New record badge), and saving and
  restoring the current game. It reads the shared `Settings` model to start a game, tells the statistics
  what happened and hands the win and game-over dialogs the summary of the game.
- `src/scripts/game/` is the model (`Board`, `Game`, `Settings`, `Statistics`): rules, game state, the
  settings values and the all-time numbers, no DOM, no storage, no timers.
- `src/scripts/ui/` holds the views (`GridView`, `ScoreView`, `OverlayView`,
  `ConfirmDialogView`, `SettingsView`, `FooterView`): they own their elements and render what
  they are given; `GridView` draws the tiles and animates the model's move result;
  `FooterView` writes the current year into the footer (`main.js` passes the number).
- `src/scripts/input/` turns keyboard and pointer events into directions
  (`KeyboardInput`, `SwipeInput`).
- `src/scripts/storage/SafeStorage.js` wraps `localStorage` and never throws.
- `src/styles/main.css` is the single CSS entry, imported by `main.js`; the other
  files in `src/styles/` are split by responsibility (see `ai/map.md`).
- `vite.config.js` owns production build behavior: `root`, output, minification
  (terser, `drop_console`), and HTML optimization.
- `dist/` is generated output. Do not edit it manually.

## Game Structure

- The board size is the `boardSize` setting (`BOARD_SIZES`, `SETTING_DEFINITIONS`): `GameController`
  reads it from `Settings` when a game starts and hands it to `Game` and `GridView.resize`; CSS
  gets it as `--board-size`. A saved game carries its own size
  (`ai/decisions/2026-10-12-board-size-records-and-saved-game.md`).
- The win tile is the `winTile` setting, three choices per board size (`WIN_TILES`):
  `GameController` hands it to `Game` with the size, the saved game carries it, and the win
  and game-over dialogs name it (`ai/decisions/2026-10-13-win-target-per-board-size.md`).
- The game counts its moves (`Game.moves`, a press that changes nothing is not one) and the saved game carries them
  (version 4); the summary in the win and game-over dialogs and the statistics read the game, never a copy
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
  and reopens it on "no" (`ai/decisions/2026-10-11-settings-dialog-and-storage.md`).
- Do not add React, Vue, Angular, or another UI framework.
- Do not rename existing CSS classes only for cosmetic reasons; class names are part
  of the local styling contract.
