# MY-129 — Win target: the player picks the winning tile, a set of choices per board size

Issue: MY-129 · Branch: `my-129-win-target` · Spec: `ai/superpowers/specs/2026-10-13-win-target.md`

Blockers MY-127 (the settings dialog) and the related MY-128 (board sizes) are `Done` and in the
branch base. MY-130 (statistics) comes after this issue and adds a move counter to the save.

## Author's answers

The issue's «Решения автора» (2026-10-11, 2026-10-12) and the orchestrator's brief, translated.
All are final; the full list is in the spec. In short:

1. Choices per board size, replacing the single list: 3x3 256 / 512 / 1024, 4x4 1024 / 2048 / 4096,
   5x5 2048 / 4096 / 8192. A size change sets the target to the middle choice of the new size
   (this settles the issue's item 5, "decide for 3x3"). The default (4x4) is 2048.
2. The picker is the same segmented control as the board size, a second section after it.
3. The target is shown only in the settings and in the win dialog text; header and main screen
   stay as they are.
4. A change in the middle of a game asks first (MY-127 / MY-128 flow); cancel changes nothing.
5. The save stores the target; a version 1 or 2 save loads with the default target of its size.
   I decide the version bump (section 3).
6. README: at most one short Features line, nothing in Architecture Notes.
7. CSS limit to 5 kB (with a record) only if CSS crosses 4 kB. Now CSS 3.87 / 4 kB, JS 6.67 / 8 kB.
8. Runs before MY-130, not in parallel.

## Decision records checked

None is contradicted. Where this issue settles something it is in section 9.

- `2026-10-11-settings-dialog-and-storage.md` — followed: one `SETTING_DEFINITIONS` entry, a
  markup-only section, one dialog at a time, `requestChange` ends in `restart()`, one flat object,
  validated field by field, no `SETTINGS_VERSION` bump for a new field with a default. It says the
  win target "is a method of `Settings`" and that fields are read in table order; section 2 does
  that, driven by data (`dependsOn`) rather than a hard-coded name.
- `2026-10-12-board-size-records-and-saved-game.md` — followed: it already says "the version goes to
  3 and `#readSavedGame` gives a version 2 save the default target of its size", and that the save
  wins over a disagreeing setting; the target is handled like the size.
- `2026-10-10-saved-game-format.md` — followed: validate or discard, the model validates what it
  owns, the controller owns the envelope and the version, flow state is not saved.
- `2026-10-10-win-and-game-over-same-move.md` — followed. Its consequence ("the dialog copy says
  `2048` literally... when the win target becomes configurable, both texts follow it") is carried
  out here: both texts follow the target.
- `2026-10-12-board-geometry-per-size.md` — followed: the second picker reuses `.segmented` /
  `.segment` unchanged. Three segments with a 4-digit label fit at 320px (checked in section 8).
- `2026-10-10-confirm-dialog.md`, `2026-10-10-native-dialog.md` — followed, nothing new.
- `2026-10-10-rejected-features.md` — nothing from the list; no confetti or other celebration is added
  for a higher target.

## 1. Where each part lives (`ai/rules/oop.md`)

| Layer / file               | Change                                                                                                                                                                                                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `constants.js`             | `WIN_TILE` goes. New: `WIN_TILES` (size → frozen list), `SETTING_NAMES.WIN_TILE` (`winTile`), its `SETTING_DEFINITIONS` entry, `SAVED_GAME_VERSION` 3. `LEGACY_SAVED_GAME_VERSION` goes (the upgrade table, section 3, replaces it); `LEGACY_BOARD_SIZE` stays (the old record) |
| `game/Settings.js` (model) | Dependent settings: choices and default per value of another setting, reset when it changes; `getAllowedValues(name)`                                                                                                                                                           |
| `game/Game.js` (model)     | Takes the win tile with the size: `start(size, winTile)`, `winTile` getter, in `toState()`, validated in `restore()` against `WIN_TILES[size]`                                                                                                                                  |
| `GameController.js`        | Starts and restores with the target; the save follows it into the settings; writes version 3; reads old versions through an upgrade table; hands the target to the overlay                                                                                                      |
| `SettingsController.js`    | Renders the dialog with the target's choices, and again after a change (the dialog may stay open)                                                                                                                                                                               |
| `ui/SettingsView.js`       | `render(values, choices)`: a group in `choices` takes them as the value and label of its radios                                                                                                                                                                                 |
| `ui/OverlayView.js`        | Fills the win text and the game-over note from the target: `showWin(winTile)`, `showGameOver({ justWon, winTile })`                                                                                                                                                             |
| `index.html`               | The second `.settings-section` (Win target); the two `You've reached 2048!` paragraphs lose their literal                                                                                                                                                                       |
| `main.js`                  | `Game` gets the initial target from the settings, `OverlayView` gets the win-text element                                                                                                                                                                                       |
| Styles                     | None expected: the control and the section exist. If something is needed it goes in `controls.css` / `overlays.css`, tokens only                                                                                                                                                |

## 2. The setting and its model

- **Data** (`constants.js`):

  ```js
  export const WIN_TILES = Object.freeze({
    3: Object.freeze([256, 512, 1024]),
    4: Object.freeze([1024, 2048, 4096]),
    5: Object.freeze([2048, 4096, 8192]),
  })
  ```

  and `[SETTING_NAMES.WIN_TILE]: { dependsOn: SETTING_NAMES.BOARD_SIZE, allowedValues: WIN_TILES }`
  — for a setting that depends on another, `allowedValues` is a map from the other's value to the
  choices. It has no `defaultValue`: its default is the middle choice
  (`MIDDLE_CHOICE_INDEX = 1`, a constant so the save upgrade uses the same rule).

- **`Settings`** keeps `get`, `isChange`, `set`, `toState`, `restore` and adds `getAllowedValues(name)` (a
  copy of the choices now in force). `#findAllowedValue` checks against the choices now in force, so
  `256` is not a valid target on 4x4. `set(name, value)` resets every setting that `dependsOn` it to its
  default **only when the value actually changes**, so setting the same size again keeps the target.
  `restore(state)` keeps its rule: defaults first, then every field that passes `set`, in table order. A
  stored `{ boardSize: 3, winTile: 2048 }` therefore gives 3x3 / 512: the bad field costs only itself.
  A stored `{ boardSize: 5 }` with no `winTile` (written before this issue) gives 5x5 / 4096.
- **`SETTINGS_VERSION` stays 1.** The rule in the settings record: a field with a default needs no bump;
  nothing that was stored changes meaning. Old blobs are valid blobs.
- **`Game`** takes the target the way it takes the size: the constructor's initial value, `start(size,
winTile)`, `restore(state)`; `move()` compares against it (`justWon` unchanged). The model validates
  the target of a save: `WIN_TILES[size].includes(winTile)` after the size check.
- **A change** still ends in `requestChange` → `restart()`. The new game reads both values from the
  settings in `#startNewGame`, so a size change and the target reset it causes arrive together.

## 3. The saved game: version 3, and how old versions load

- **Version 3**: `{ version, size, winTile, board, score, hasWon }`. `GameController.#persistGame` spreads
  `game.toState()`, so the new field needs no code there.
- **Why bump** rather than "a field with a default": the save is validate-or-discard and every version
  states its shape; a version 2 save has no target and must not be taken for a broken version 3. This is
  also what `2026-10-12-board-size-records-and-saved-game.md` promised.
- **Upgrade table instead of an `if` per legacy version.** `#readSavedGame` becomes a loop over a
  frozen table whose key is the version a step upgrades from and whose value brings the save to the next
  version:

  ```js
  static #SAVE_UPGRADES = Object.freeze({
    1: (saved) => ({ ...saved, version: 2, size: LEGACY_BOARD_SIZE }),
    2: (saved) => ({ ...saved, version: 3, winTile: WIN_TILES[saved.size]?.[MIDDLE_CHOICE_INDEX] }),
  })
  ```

  A version 1 save runs both steps. A save of the current version is used as it is; a newer, unknown or
  non-numeric version is no save. `WIN_TILES[saved.size]?.…` is `undefined` for a bad size, which the model
  then rejects as it rejects the size itself. **MY-130 adds one line** (`3: (saved) => ({ ...saved,
version: 4, moves: 0 })`) and bumps `SAVED_GAME_VERSION`; nothing else in the reader changes.

- **The save wins over a disagreeing setting**, target included: after `game.restore(saved)` the controller
  sets the in-memory board size and then the in-memory target from the game (that order: a size change
  resets the target, the second `set` puts the saved one back). Nothing is written.
- A game over still deletes the save; `New Game` and `Restart Game` still delete it.

## 4. The settings section

- `index.html`: a second `<section class="settings-section">` after Board size, with
  `<h3 id="settings-win-tile-title">Win target</h3>` and a `role="radiogroup"`
  `aria-labelledby="settings-win-tile-title"` holding three `.segment` labels with radios named `winTile`.
  The markup carries the 4x4 choices (1024 / 2048 / 4096) so nothing is empty before JS runs.
- The choices change with the size, so the markup cannot hold them. `SettingsView.render(values, choices)`:
  for every `name` in `choices` the radios named so take, in order, `choices[name][i]` as their `value` and as
  the text of the `<span>` beside them; then the checked state is set as today. A group not in `choices`
  (the board size, whose labels are `3×3`…) is left alone. The markup must have as many segments as the
  longest list (three).
- `SettingsController` renders `(settings.toState(), { winTile: settings.getAllowedValues('winTile') })`
  in `open()` and **again at the end of `requestChange`**: on a fresh or finished game the dialog stays
  open behind a size change and its second section has to follow at once.
- The `change` handler stays the one delegated listener: `(name, value)` → `requestChange`. The radios'
  values are strings; `Settings` already reads `'512'` as `512`.

## 5. The win texts

`OverlayView` gets the paragraph of the win dialog (`.win-message`) next to `.game-over-win-note`. Both are
written by the view from the target (`You've reached ${winTile}!`); the markup keeps no number.
`GameController.requestMove` passes `this.#game.winTile` to `showWin` and `showGameOver`. The "win and game
over on the same move" precedence and `justWon` are untouched.

## 6. Budget

No CSS expected, so the CSS stays at 3.87 kB and the limit stays 4 kB. JS grows by a few hundred bytes
(the upgrade table, `getAllowedValues`, the dependent logic, the render step): expected 6.67 → about 7.0 kB
of 8. If something forces CSS over 4 kB, `.size-limit.json` goes to 5 kB and a short decision record says
why (the author agreed in principle).

## 7. Commits

1. `docs: spec and plan for the win target (MY-129)` — this plan and the spec, before any code.
2. `feat: make the win tile a per-size setting and a field of the saved game` — constants, `Settings`,
   `Game`, `GameController` (start, restore, upgrade table, version 3), `OverlayView` and the two
   paragraphs, `main.js`. After it the game plays with the middle target of each size and the win texts
   follow it; there is no picker yet.
3. `feat: add the Win target section to the settings` — the markup, `SettingsView.render(values, choices)`,
   the `SettingsController` renders.
4. `docs: document the win target, the per-size choices and save format 3` — `ai/map.md`, the decision record
   and its index, "Refined by" lines in the older records, `ai/skills/*`, the README line, this plan's
   "What building it found".

A fixup goes into the commit that introduced the fault (`--fixup` + autosquash before the hand-over).

## 8. Verification

`yarn lint`, `yarn format:check`, `yarn build`, `yarn size`; then headless Chrome over CDP against
`yarn dev` (port 5192) and the production build (`yarn preview`, 5196), with `localStorage` set up per case.

- **Each size × each target (nine cases).** A near-win board saved as version 3 (two tiles of half the
  target side by side, spare tiles so moves remain): no dialog before the move; the move that merges them
  opens the win dialog; its text is `You've reached <target>!`; `Continue Playing` closes it and the
  next moves open nothing; `New Game` starts a game. Also a board one merge short of a _lower_ tile never
  opens a win dialog. The target of the saved game, not the settings, decides.
- **Win and game over on the same move**: a board where the merge makes the target and leaves no moves
  shows only the game-over dialog with `You've reached <target>!`, no win dialog, no save left.
- **Picker.** Both sections show; each size shows its three choices with the middle one checked;
  picking a size changes the second section's choices at once (dialog open, fresh game) and writes
  `settings` with the size and the middle target; picking a target on a fresh game restarts at once and
  writes it; in a game in progress the question appears, `Cancel` / `Escape` change nothing (save, score,
  settings key, the old target checked on reopening), `New Game` applies it; the size question covers the
  target reset (one question). Picking the target already in use does nothing.
- **Persistence.** Reload restores the target with the game; a version 1 save → 4x4 / 2048; a version 2
  save of each size → its middle target; a version 3 save with a target not valid for its size, or without
  one → discarded, new game; `settings` of the MY-128 shape, an inconsistent `winTile`, corrupted JSON,
  blocked storage → the game starts. A save that disagrees with the settings wins and writes nothing.
- **UI.** 1000 / 375 / 320px, both themes, screenshots of the settings with both sections at 1000 and 320px
  in both themes and of a win dialog (3x3, 512); no horizontal scroll, the dialog fits at 320px; keyboard in
  the settings (`Tab` order, arrows within a group, `Space`, `Escape` returning focus to the gear), the
  accessibility tree (two named radio groups, labels `256`…`8192`); reduced motion unchanged (no new
  animation).
- **Regressions.** Moves, merges, scoring, the record and the badge, saving after each move, game over,
  swipes at 375px, fast presses.
- No automated tests exist and none are added.

## 9. Docs and decisions

- `README.md`: one Features line (the win target per board size, in the settings, saved with the game);
  the two existing mentions of `2048` as _the_ target (the game-over dialog line) are reworded to "the
  target". Nothing in Architecture Notes.
- `ai/map.md`: the `constants.js`, `Game`, `Settings`, `SettingsView`, `SettingsController`, `OverlayView`,
  `GameController` rows; `index.html` (the settings and the win text); the Settings section (the recipe: "a
  setting whose choices depend on another"); Storage (version 3, the upgrade table, `winTile` in settings).
- New decision record `2026-10-13-win-target-per-board-size.md` and its line in `decisions/README.md`: the
  choices per size and the middle default (why not one list, why no 3x3 hint or restriction), the
  dependent-setting mechanism, the save version 3 and the upgrade table, no settings bump, the target in the
  texts. "Refined by" lines in the saved-game, board-size, win-and-game-over and settings records.
- `ai/skills/feature.md` (settings recipe: a setting whose choices change; the upgrade table in the storage
  bullet) and `ai/skills/review.md` (the storage and gameplay lines mention the target and version 3).
- `ai/rules/architecture.md` / `definition-of-done.md`: the "win tile" is no longer a constant; the lines are
  reworded where they say so.

## 10. How MY-130 plugs in (checked against this design)

- The move counter is one more field of the game state and the save: `Game` gets it in `toState()` /
  `restore()`, `SAVED_GAME_VERSION` goes to 4 and one entry joins the upgrade table with `moves: 0`.
- The statistics live under a key of their own; the target of a game is part of what a result records
  (`Game.winTile` is a public getter).
- A statistics reset in the settings uses the same close → ask → reopen step as `requestChange`.

## 11. Out of scope

- The target on the main screen or in the header; custom targets; a hint for 3x3 (the middle default and
  the per-size lists answer it); the move counter and statistics; any celebration beyond the dialog.

## 12. What building it found

_Filled in while building._
