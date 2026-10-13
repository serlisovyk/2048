# MY-130 — Statistics: a summary of each game and all-time numbers

Issue: MY-130 · Branch: `my-130-statistics` · Spec: `ai/superpowers/specs/2026-10-13-statistics.md`

Blockers MY-127 (the settings dialog) and the related MY-128 (board sizes) and MY-129 (win target) are
`Done` and in the branch base; nothing else runs in parallel.

## Author's answers

The issue's «Решения автора» (2026-10-11 to 2026-10-13) and the orchestrator's brief, translated. All are
final; the full list is in the spec. In short:

1. The summary in the win and game-over dialogs: score, moves, highest tile.
2. The Statistics section in the settings: games played, wins, best score, best tile, no win percentage,
   shared by every board size (the per-size high scores stay as they are).
3. "Played": a game ended by game over, or left by a new one (`New Game`, a size change, a target change)
   after at least one move; a reload does not end a game. "Win": the target was reached, once per game.
4. Stored with a `version`, validated like the settings (invalid → zeros, no errors), through `SafeStorage`.
5. Reset with the shared confirmation; the settings closes for the question and reopens on Cancel.
6. The move count is part of the saved game: version 4, upgrade `3: (saved) => ({ ...saved, version: 4, moves: 0 })`.
7. Limits: JS to 10 kB and CSS to 5 kB if needed, each with a short decision record. Now JS 7.2 / 8 kB,
   CSS 3.96 / 4 kB.
8. README: at most one short Features line, nothing in Architecture Notes.

## Decision records checked

None is contradicted. Where this issue settles something it is in section 8.

- `2026-10-11-settings-dialog-and-storage.md` — followed: a section is markup plus a view method, one
  dialog at a time (the settings closes for a question and reopens on "no"), the settings controller owns
  its `version` and the only writes of its key. It says the statistics reset "closes the settings, asks
  and reopens it on 'no', as `requestChange` does" and the skill says to extract that step "when the
  second caller arrives": this is the second caller (section 3).
- `2026-10-12-board-size-records-and-saved-game.md` and `2026-10-13-win-target-per-board-size.md` —
  followed: both say the move counter is one more field of the game state and the save, with a version
  bump, one entry in `#SAVE_UPGRADES` and a default 0 for older saves; the statistics are shared by all
  sizes and live under a key of their own.
- `2026-10-10-saved-game-format.md` — followed: validate or discard, the model validates what it owns
  (`moves` included), the controller owns the `version`, flow state is not saved.
- `2026-10-10-confirm-dialog.md` — followed: the reset asks through `ConfirmDialogView.ask()` with its own
  wording, `Cancel` first and focused; the view and its markup are not touched. Its remark that "a move
  counter instead of a flag (nothing needs the number)" was rejected is superseded by the need: `Game`
  keeps `#hasMoved` for `isInProgress` and gets a counter next to it (section 2).
- `2026-10-11-high-score-reset-stays-in-the-header.md` — followed: "the statistics reset is a different
  action and does belong in the settings"; the high score reset is untouched.
- `2026-10-10-win-and-game-over-same-move.md` — followed: a winning and ending move shows the game-over
  dialog only, now with the summary; both counters are updated for it.
- `2026-10-10-rejected-features.md` — nothing from the list: no history, share, celebration. "Move
  history viewer" is a list of moves; this is a counter.

## 1. Where each part lives (`ai/rules/oop.md`)

| Layer / file                 | Change                                                                                                                                                                                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `constants.js`               | `SAVED_GAME_VERSION` 4; `STORAGE_KEYS.STATISTICS` (`'statistics'`) and `STATISTICS_VERSION` (1)                                                                                                                                            |
| `game/Board.js` (model)      | `getHighestTile()`                                                                                                                                                                                                                         |
| `game/Game.js` (model)       | `moves` (counted in `move()`, reset in `start()`, in `toState()`, validated in `restore()`) and `highestTile` getters                                                                                                                      |
| `game/Statistics.js` (model) | New. The four numbers: `recordMove(...)`, `recordRestart()`, `reset()`, `toState()`, `restore(state)`. No DOM, storage or timers                                                                                                           |
| `StatisticsController.js`    | New. Loads the stored numbers, applies the events it is told about and saves them (the only writer of the key, it owns the `version`)                                                                                                      |
| `GameController.js`          | Tells the statistics about a move, a game over and a game left by a new one; passes the summary to the overlay; the upgrade table gets the step to version 4                                                                               |
| `SettingsController.js`      | Renders the numbers when the dialog opens; `requestResetStatistics()`; the private `#askFromSettings(prompt)` that `requestChange` shares                                                                                                  |
| `ui/SettingsView.js`         | `renderStatistics(values)`, `onResetStatistics(handler)`                                                                                                                                                                                   |
| `ui/OverlayView.js`          | `showWin({ winTile, summary })` and `showGameOver({ justWon, winTile, summary })` write the summary into their dialog                                                                                                                      |
| `index.html`                 | A `.game-summary` list in the win and game-over dialogs; a third `.settings-section` (Statistics) with the four values and the reset button                                                                                                |
| `main.js`                    | Creates `Statistics` and `StatisticsController`, hands the controller to `GameController` and `SettingsController`, the reset button to `SettingsView`, wires the button to `requestResetStatistics`, calls `statisticsController.start()` |
| Styles                       | `overlays.css` (the lists), `controls.css` (the reset button joins the outlined secondary look). Tokens only, none new                                                                                                                     |
| `.size-limit.json`           | CSS 4 → 5 kB (certain: 0.04 kB is left); JS 8 → 10 kB if the new code crosses 8 kB                                                                                                                                                         |

## 2. The model

- **`Board.getHighestTile()`**: the largest value on the board, 0 when it is empty. It is the highest tile of
  the whole game: a tile only ever merges into a larger one.
- **`Game`**:
  - `#moves` is incremented where `#hasMoved` is set (a move that changes the board), zeroed in `start()`,
    exported by `toState()` as `moves`, and checked by `restore()` (`Number.isSafeInteger` and ≥ 0, like the
    score). Getters `moves` and `highestTile`.
  - `#hasMoved` stays. `isInProgress` cannot become `moves > 0`: a version 3 save is restored with
    `moves: 0` and is still a game that has had moves (a save is only written after one), and the
    confirmation question and the "played" count both need that.
- **`Statistics`** (`game/Statistics.js`), private `#played`, `#wins`, `#bestScore`, `#bestTile`:
  - `recordMove({ score, highestTile, justWon, isOver })` raises the two bests, adds a win when `justWon`
    (a game fires it once, `Game` holds `hasWon`), adds a played game when `isOver`; returns `true` when
    anything changed, so the controller saves only then (most moves change nothing).
  - `recordRestart()` adds a played game: the one left by a new game.
  - `reset()` zeroes everything. `toState()` returns a copy.
  - `restore(state)`: starts from zeros and takes every field of `state` that is a valid number, so a broken
    field costs only itself, as in `Settings.restore`; any value of `state` is safe (not an object,
    `null`, an array, strings). Valid is a non-negative safe integer, and for the best tile 0 or a power of
    two (`Board`'s rule for a tile; a private static `#isTileValue` of its own: the rule is two lines and the
    model has no shared helper module).
  - The model does not know the version, the key or when it is saved.
- **`StatisticsController`** (`{ statistics, storage }`):
  - `start()` reads `STORAGE_KEYS.STATISTICS` through `SafeStorage.getJson`, and gives it to
    `Statistics.restore` only when `version === STATISTICS_VERSION` (another version: zeros). Nothing is
    written.
  - `recordMove(move)`, `recordRestart()`, `reset()`: apply the event to the model and `#persist()`
    (`{ version, ...statistics.toState() }`) when it changed something. A getter `values` returns
    `statistics.toState()` for the dialog.
  - A reset writes the zeros rather than removing the key: one write path, and a missing key reads as the
    same four zeros.

## 3. The flow

- **`GameController.requestMove`**, after `result.moved`: `statistics.recordMove({ score, highestTile,
justWon, isOver })` from `result` and the game's getters, then the dialogs as before, now with
  `summary: { score, moves, highestTile }` (a private `#getSummary()`), then `#persistGame()`.
- **`GameController.#startNewGame`**: before it starts the game, `if (this.#game.isInProgress)
statistics.recordRestart()`. It is the one place every way to a new game goes through (`restart()` from
  the page button after a confirmation, the win dialog, the settings change after its question), so the
  count cannot be missed or doubled: a fresh board, a finished game (game over has counted it) and the
  first start of the page are not "in progress". A game that was restored is: its save was written after a
  move.
- **The summary is read from the game** after the move (`game.score`, `game.moves`, `game.highestTile`), so
  the same numbers go to the statistics and the dialogs.
- **`SettingsController`**:
  - `#render()` also calls `view.renderStatistics(statisticsController.values)`, so the numbers are
    current whenever the dialog is opened (`open()` renders first) and after a reopened "no".
  - `async requestResetStatistics()`: `if (!(await this.#askFromSettings(PROMPT))) return`, then
    `statisticsController.reset()` and `gameController.returnFocusToBoard()`.
  - **`#askFromSettings(prompt)`** (extracted from `requestChange`, which now calls it): closes the settings,
    awaits `confirmDialogView.ask(prompt)`, reopens the settings on "no", returns the answer. One dialog at
    a time stays true in one place.
  - The prompt is a private static frozen object next to the use case, as the others: title `Reset the
statistics?`, message `Games played, wins, best score and best tile will be set back to 0. High scores
and your current game are not affected.`, confirm label `Reset`.
- **`SettingsView`** takes `resetStatisticsButton` from `main.js`. `renderStatistics(values)` writes each
  value into the element marked `data-statistic="<name>"` inside the dialog (the names are the fields of
  `Statistics.toState()`: `played`, `wins`, `bestScore`, `bestTile`), and hides the reset button while every
  value is 0. `onResetStatistics(handler)` is a click listener. The section is markup plus these two
  methods, as the skill says for a control that is not a radio group.
- **`OverlayView`** writes `summary` into the elements marked `data-summary="<name>"` inside the dialog it is
  showing (`score`, `moves`, `highestTile`: the fields of the summary), before `showModal()`. The win text
  and the game-over note stay as they are.

## 4. Markup and styles

- `index.html`, in each of the win and game-over dialogs, between the text and the button(s):

  ```html
  <dl class="game-summary">
    <div>
      <dt>Score</dt>
      <dd data-summary="score"></dd>
    </div>
    <div>
      <dt>Moves</dt>
      <dd data-summary="moves"></dd>
    </div>
    <div>
      <dt>Highest tile</dt>
      <dd data-summary="highestTile"></dd>
    </div>
  </dl>
  ```

  The two copies are two small blocks of static markup; a view that moves one element between two dialogs
  would be more code than the repeat. The numbers are never in the markup.

- `index.html`, inside `.settings-dialog` after Win target: a `<section class="settings-section">` with
  `<h3 id="settings-statistics-title">Statistics</h3>`, a `<dl class="statistics">` of four `<div>`s
  (`<dt>` the label, `<dd data-statistic="…">0</dd>`) and
  `<button class="reset-statistics-button">Reset statistics</button>`. No `aria-labelledby` on the list: a
  generic element has no accessible name to give; the heading right above names the section for a screen
  reader reading in order.
- Styles. One look for the "small label over a bold value" in both places: `.game-summary` and `.statistics`
  share the `dt` / `dd` rules (the label 13px, the value bold and larger, `clamp` for small screens). The
  summary is a centred flex row; the statistics a two-column grid. **No opacity and no new colour on the
  labels:** on the win card's gradient white at full opacity reaches about 3.7:1 at its lightest corner and
  more below, so lowering it would fail 4.5:1 for small text; the label differs from the value by size and
  weight. The reset button is added to the outlined secondary group in `controls.css` (the confirmation's
  `Reset`/`Cancel` pair and `.win-restart-button` have that look): its colours are the dialog tokens, which
  the light theme already re-points for the settings card. Nothing in `motion.css` (no animation).
- Heights: the settings dialog grows by the section's height (about 130px). It is a `<dialog>`, so a screen
  too short for it scrolls inside the dialog (the UA `max-height` and `overflow: auto`); measured in
  section 7.

## 5. Budget

CSS is 3.96 / 4 kB, so this issue crosses it: `.size-limit.json` goes to 5 kB with a short decision record
(the author approved it). JS is 7.2 / 8 kB and the model, the controller and the view methods are expected to
add about 1 to 1.5 kB: if it crosses 8, the limit goes to 10 kB with its own record, in the commit that needs
it. A limit is raised in its own commit before the one that crosses it, so every commit passes `yarn size`.

## 6. Commits

1. `docs: spec and plan for the statistics (MY-130)` — this plan and the spec, before any code.
2. `feat: count the moves of a game and keep them in the saved game` — `Game.moves` and `highestTile`,
   `Board.getHighestTile`, `SAVED_GAME_VERSION` 4 and the upgrade step. Nothing shows yet.
3. `build: raise the CSS size limit to 5 kB` — `.size-limit.json` and its decision record.
4. `feat: show the summary of the game in the win and game-over dialogs` — the markup, `OverlayView`, the
   styles, `GameController.#getSummary`.
5. `feat: count games, wins, best score and best tile` — `Statistics`, `StatisticsController`, the key, the
   calls in `GameController`, `main.js`. After it the numbers are counted and saved, with no UI yet.
6. `build: raise the JS size limit to 10 kB` — only if the previous commit crosses 8 kB.
7. `feat: add the Statistics section to the settings` — the markup, `SettingsView`, `SettingsController` (the
   render, the reset, `#askFromSettings`), the styles.
8. `docs: document the statistics, the metric definitions and save format 4` — `ai/map.md`, the decision
   record and its index, "Refined by" lines in older records, `ai/skills/*`, `ai/rules/architecture.md`, the
   README line, this plan's "What building it found".

A fixup goes into the commit that introduced the fault (`--fixup` + autosquash before the hand-over).

## 7. Verification

`yarn lint`, `yarn format:check`, `yarn build`, `yarn size`; then headless Chrome over CDP against `yarn dev`
(port 5192) and the production build (`yarn preview`, 5196), with `localStorage` set up per case. Games on
the small boards are played for real (3x3 with the target 256 is reachable); a game is brought to a wanted
point (a near-win, a near game over) by a saved game with the numbers written, which exercises the same
paths.

- **The numbers agree with what happened.** Several games in a row on different sizes and targets, the four
  numbers read from the dialog after each: a game over (+1 played); `New Game` after moves (+1, with the
  question); `New Game` on a fresh board (+0); a size change and a target change in the middle of a game (+1
  each, one question); the same on a fresh or finished board (+0); a win (+1 wins, at once, with the dialog),
  `Continue Playing` and a later game over (wins unchanged, +1 played); a win that ends the game on the same
  move (+1 and +1); `Restart Game` after a game over (+0); `Cancel` on every question (+0); the best score
  and the best tile over several games and sizes (the larger one stays); a lower game does not lower them.
- **The summary.** In the game-over and win dialogs: score, moves and highest tile equal the header's score,
  the number of moves played (counted by the test, with the presses that change nothing left out) and the
  largest tile on the board; the same-move case; after `Continue Playing` and a later game over the numbers
  are the final ones.
- **The move count and reloads.** Reload in the middle of a game keeps `moves`; the next move makes it
  `moves + 1`; versions 1, 2 and 3 saves load with 0 and are still "in progress" (the question appears on
  `New Game`, a restart counts); a version 4 save with a missing, negative or fractional `moves` is
  discarded. A reload changes no statistic, including after a win.
- **Storage.** The numbers survive a reload; the key holds `{ version: 1, … }`; missing key, another
  version, `null`, an array, corrupted JSON, a non-object, negative or fractional fields, a best tile that is
  not a power of two → zeros or only that field zero, no console error and the game starts; blocked storage →
  counting works in memory.
- **The reset.** The button is hidden at zeros; with numbers: the question (settings closed, one dialog
  open), `Cancel` / `Escape` → the settings is open again and the numbers are unchanged; `Reset` → zeros in
  the storage and the dialog, focus on the board, high scores and the current game and its save untouched.
- **UI.** Screenshots: the settings with the Statistics section in both themes at 1000 and 320px; the
  game-over and win dialogs with the summary (and the same-move case). 1000 / 375 / 320px, no horizontal
  scroll; the settings fits at 320x568 or scrolls inside the dialog (measured, reported); keyboard in the
  settings (`Tab` order over the three sections, the reset button, `Escape` returns focus to the gear); the
  accessibility tree (the heading, the definition list, the button name); contrast of the labels in both
  themes and on both dialog cards; no colour literal added; reduced motion unchanged (no new animation).
- **Regressions.** Moves, merges, scoring, the record and the badge, saving after each move, the existing
  settings and their questions, swipes at 375px, fast presses.
- No automated tests exist and none are added.

## 8. Docs and decisions

- `README.md`: one Features line (the summary and the statistics); the file list under "Project Structure"
  gets the new controller and the model's new class (a structure line, not Architecture Notes). Nothing in
  Architecture Notes.
- `ai/map.md`: the `main.js`, `constants.js`, `GameController`, `Game`, `Settings*`, `OverlayView` rows and the
  two new ones (`Statistics`, `StatisticsController`); `index.html` (the summaries and the section); the
  Settings section (the statistics are a section that is not a radio group, and its action); Storage (the
  `statistics` key and format, save version 4); the `.size-limit.json` row; the styles rows.
- New decision record `2026-10-13-statistics.md` and its index line: the definitions of the four numbers and
  of "played" and "win" (the events table), why wins are counted at the win and played games at the end of a
  game, why bests include the game in progress, shared by all sizes, the format and its validation, the save
  version 4 with `moves` and why `isInProgress` keeps its flag, the reset flow (the settings reopens on
  Cancel, focus to the board on a confirm), why the controller is separate. Two short records for the
  limits (`…-css-size-limit-5-kb.md`, `…-js-size-limit-10-kb.md`). "Refined by" lines in the saved-game,
  board-size, win-target, settings and confirm records.
- `ai/skills/feature.md` (a section that is not a radio group; `#askFromSettings` as the shared step; the
  summary in a dialog; the storage bullet's version) and `ai/skills/review.md` (the Storage and Gameplay lines
  mention `moves` and version 4; a Statistics line). `ai/rules/architecture.md`: the new files.

## 9. How the next issue plugs in

A new number is a field of `Statistics` (and a `data-statistic` element): a field with a zero default needs no
bump of `STATISTICS_VERSION`, changing what a number means does. A new field of a game is one more step in
`#SAVE_UPGRADES`.

## 10. Out of scope

- Everything under "Out of scope" in the spec: percentages, per-size numbers, history, share, a live update
  while the settings is open, syncing tabs.
