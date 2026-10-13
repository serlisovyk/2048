# The win target is a setting with three choices per board size; the saved game is version 3 and is brought up to date step by step

Date: 2026-10-13 · Status: accepted

## Context

MY-129 turns the winning tile from the constant 2048 into a setting. One list for every board does not
fit: 2048 is practically out of reach on 3x3 and soon reached on 5x5. The issue left "what to do on 3x3"
(restrict the choice, show a hint, or pick a recommended target when the size is chosen) to the plan. The
author answered: **each size has its own three choices, and a size change puts the target on the middle
one.** Four things had an obvious alternative: how a setting can depend on another one, how the picker
shows choices that change, what the saved game looks like and how older saves load, and where the target
is named.

## Decision

- **Choices per size, the middle one is the default.** `WIN_TILES` in `constants.js`: 3x3 256 / 512 / 1024,
  4x4 1024 / 2048 / 4096, 5x5 2048 / 4096 / 8192. The middle choice (`MIDDLE_CHOICE_INDEX`) is the default of
  a size, so the default of the default board is still 2048, and it is what a size change goes back to.
  This is the answer to "3x3": the sets are right for the board, so there is nothing to restrict and no
  hint text. Rejected: one list for all sizes (3x3 could never offer a reachable 2048), keeping the target
  when the size changes (it could be a value the new size does not offer, or one that means something
  else there), a hint under the picker (not asked for), a free numeric field.
- **A setting can depend on another.** The definition of `winTile` has `dependsOn: boardSize` and an
  `allowedValues` that is a map from the board size to its choices, and no `defaultValue`. `Settings`
  resolves the choices from the current value (`getAllowedValues(name)`), accepts a value only when it is
  one of them, and `set` sends every dependent setting back to its default **when the value it depends on
  actually changes**, so choosing the size already in use keeps the target. `restore` reads the fields in
  table order and checks each against the ones before it: a stored `{ boardSize: 3, winTile: 2048 }` is
  3x3 with 512, and a blob written before this issue (`{ boardSize: 5 }`) is 5x5 with 4096. Rejected: a
  `winTile` branch hard-coded in `Settings` (the recipe in `ai/skills/feature.md` would not say how the next
  dependent setting is added), and functions inside `constants.js` (it holds values only).
- **`SETTINGS_VERSION` stays 1.** A field with a default needs no bump, and nothing that was stored changes
  meaning. A broken field still costs only itself.
- **The picker is the board size's control with changing labels.** The same `.segmented` / `.segment`
  markup and CSS, three radios named `winTile`, no new styles. The markup cannot hold the values, so
  `SettingsController` gives `SettingsView.render(values, choices)` the choices of the current size every
  time it renders, and the view sets each radio's `value` and the text of its `<span>` (the label is the
  value). The controller renders again after a change, because on a fresh or finished game the dialog stays
  open behind a size change and the second section has to follow at once. Rejected: nine radios with the
  wrong ones hidden (the rounded ends of the control break, and one name would join all the groups), and a
  view that knows which setting depends on which (it renders what it is given).
- **The target is named only in the settings and in the win texts.** The win dialog and the game-over note
  (`You've reached <target>!`, `2026-10-10-win-and-game-over-same-move.md`) are written by `OverlayView` from
  the game's win tile; the markup holds no number. The header, the board and the page title do not show it
  (the author's decision).
- **A change in the middle of a game asks first, once.** It is the MY-127 flow, unchanged: `requestChange`
  asks through `ConfirmDialogView` when a game is in progress and "no" changes nothing. A size change and the
  target reset it causes are one change and one question.
- **The saved game is version 3: `{ version, size, winTile, board, score, hasWon }`.** `Game` takes the tile
  with the size (`start(size, winTile)`, `toState`, `restore`) and `restore` validates it against
  `WIN_TILES[size]`; a save with another value, a missing one or a string is discarded like any bad field
  (`2026-10-10-saved-game-format.md`). A bump rather than "a field with a default": a version 2 save has no
  target and must not be read as a damaged version 3.
- **Older saves go through an upgrade table.** `GameController.#SAVE_UPGRADES` maps the version a step starts
  from to a function that returns the save as the next version: 1 → 2 adds `size: 4`, 2 → 3 adds the middle
  `winTile` of the save's size. `#readSavedGame` applies steps until the current version; a version no step
  starts from (unknown, newer, not an integer) is no save, and the model validates the rest. A version 1 save
  runs both steps. Saves are read, never written, in an old format: the next move writes version 3. Rejected:
  another `if` per legacy version (each new version would need a branch that knows every older shape), a
  migration in the model (it has never known versions), discarding version 2 (players would lose games for an
  upgrade), and a default for a missing target inside `Game.restore` (the model stays strict).
- **The save wins over a disagreeing setting, for the target too.** After `Game.restore` the controller sets
  the in-memory board size and then the in-memory target from the game (the size first, because a changed size
  resets the target), writing nothing (`2026-10-12-board-size-records-and-saved-game.md`).

## Consequences

- **MY-130 adds one entry.** The move counter is a field of the game state and the save: `Game` exports it in
  `toState()`, `SAVED_GAME_VERSION` goes to 4 and `#SAVE_UPGRADES` gets `3: (saved) => ({ ...saved, version: 4,
moves: 0 })`. Nothing else in the reader changes. The statistics can read the target from `Game.winTile`.
- **1024 on 3x3 is the highest tile a 3x3 board can ever hold** (2^10, the board's ceiling), so that choice is
  in practice a perfect game. It is the author's list; the choices are data in `WIN_TILES`, and changing a list
  later is safe: a value removed from a size makes a save that holds it invalid (discarded) and a stored setting
  that holds it fall back to the middle choice; a value added needs nothing.
- The header, the board and the title still say `2048` (the logo is a name, not the target).
- The markup of the win target group holds three empty radios (and a comment) instead of numbers, so `WIN_TILES`
  stays the only place that lists them; the labels exist only after `open()` has rendered the dialog.
- A size change rewrites the second section's labels with no announcement: there is no live region for it, and a
  player using a screen reader finds the new choices by moving to the group. Accepted: the section is one step
  away and a live region for a setting dialog would be the first of its kind here.
- Budget after the issue: JS 7.13 kB of 8, CSS 3.87 kB of 4 (no CSS was added). The 5 kB CSS limit is still waiting
  for the issue that crosses 4 kB; JS has about 0.9 kB left for MY-130.
- Refines `2026-10-10-win-and-game-over-same-move.md` (the texts follow the target, as it said they would),
  `2026-10-10-saved-game-format.md` and `2026-10-12-board-size-records-and-saved-game.md` (version 3, as it said), and
  `2026-10-11-settings-dialog-and-storage.md` (the dependent setting is data, not a hard-coded method).
- Checked in headless Chrome 155 on the dev server and the production build: each of the 9 size and target
  combinations (no dialog a merge before the target, the dialog on it, its text, `Continue Playing`, no second
  dialog), win and game over on one move on 3x3 for all three targets, 12 natural games on 3x3 with the target
  256 (no false win), the picker on a fresh and an in-progress game (cancel and `Escape` change nothing), the
  size change resetting the target, a reload, versions 1 and 2 saves of every size, bad and newer versions, a save
  disagreeing with the settings, inconsistent and corrupted settings, blocked storage, keyboard (`Tab`, arrows,
  `Escape`), both themes at 1000, 375 and 320px. Not checked: Safari, Firefox, a real screen reader.
- Carried out by `2026-10-13-statistics.md` (MY-130): the entry `3: (saved) => ({ ...saved, version: 4, moves: 0 })` was added and nothing else in the reader changed; JS ended at 7.92 kB of 8, so the limit stayed.
