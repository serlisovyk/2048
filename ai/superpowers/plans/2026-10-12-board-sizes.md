# MY-128 — Board sizes: 3x3, 4x4 and 5x5, with a high score for each size

Issue: MY-128 · Branch: `my-128-board-sizes` · Spec: `ai/superpowers/specs/2026-10-12-board-sizes.md`

Blockers MY-127 (the settings dialog) and MY-113 (the saved game) are `Done`, and so is the
related MY-126 (tile animations), all in the branch base. MY-129 (win target) and MY-130
(statistics) build on this issue.

## Author's answers

The issue's "Решения автора" (2026-10-11) and the notes of 2026-10-12, translated. All of them
are final; nothing below overrides them.

1. This issue turns on the ⚙ toolbar button: "Board size" is the first settings section (MY-127
   left the button `hidden`).
2. The size picker is a segmented control "3×3 | 4×4 | 5×5" styled like the header buttons, the
   selected one highlighted; underneath it stays a radio group (keyboard arrows and screen readers
   work as for radios). Colours through tokens, both themes.
3. Win targets per size arrive in MY-129 (3x3: 256 / 512 / 1024, 4x4: 1024 / 2048 / 4096, 5x5:
   2048 / 4096 / 8192; the middle one when the size changes): the settings model and the save
   format must take that easily. Do not implement it.
4. MY-130 adds all-time statistics shared across sizes and a move counter in the save: same
   requirement, do not implement it.
5. If the CSS crosses 4 kB gzip, `.size-limit.json` goes to 5 kB with a short decision record (the
   author approved). Now: CSS 3.68 / 4 kB, JS 6.36 / 8 kB.
6. The confirmation flow for a change in the middle of a game is MY-127's; reuse it.
7. From the issue text: a "Board size" section with 3x3, 4x4 (default), 5x5; the size stops being
   a constant (grid generation, move logic, win and game-over checks, the CSS variable); the tile
   font scales from the cell size, 4 to 5 digit numbers fit on 5x5 at 320px; the record per size
   (a storage key per size) and the existing record becomes the 4x4 one; the saved game keeps its
   size, an old save without one loads as 4x4, the format `version` goes up; the high score reset
   is for the current size.
8. Done when: every size is playable by keyboard and swipes on desktop and at 320px; every size has
   its own record and the old one became the 4x4 one; a reload restores the game of the right size
   and an old save opens as 4x4; 5x5 fits a narrow screen with no horizontal scroll.

The issue says the CSS variable is `--size`; the one in the code is `--board-size` (set by
`GridView`, read in `board.css`), so that is the one that stays.

## Decision records checked

None is contradicted; the points where this issue settles something are listed in section 9.

- `2026-10-11-settings-dialog-and-storage.md` — followed: one `SETTING_DEFINITIONS` entry, a
  markup-only section, the button's `hidden` removed, `requestChange` ends in `restart()`, one dialog
  at a time. It says the game reads the setting where it builds the game and the grid, and that
  `GameController` does not know the settings "until a setting needs it (MY-128)": it does now.
- `2026-10-11-high-score-reset-stays-in-the-header.md` — followed: the reset stays in the High
  Score box and now resets the current size's record ("MY-128 resets the record of the current board
  size from this same button; nothing moves").
- `2026-10-10-saved-game-format.md` — followed: a new `SAVED_GAME_VERSION`, version 1 keeps loading as
  4x4 ("Version 1 has no `size`... Later versions add those fields and bump the version; version 1 keeps
  loading as 4x4 / 2048"). Validate-or-discard stays. The rule for a save that disagrees with the
  setting is new (section 3.3).
- `2026-10-10-tiles-over-the-grid.md` — followed: tiles are placed by `--row` / `--col` and the inherited
  `--cell-size` and `--cell-gap`, "so any `BOARD_SIZE` works". Its last consequence ("the 5x5 board at
  320px is wider than the screen because of the 60px minimum cell... fitting other board sizes is the
  game-modes issue") is what section 5 does.
- `2026-10-10-input-during-tile-animation.md` — untouched: nothing in the move path changes, and every
  size is exercised in the browser with fast presses.
- `2026-10-10-tile-palette.md` — the colours are untouched. The font sizes "follow the digit count" and
  stay doing so: only the unit changes from the viewport to the cell (section 5.2).
- `2026-10-10-header-toolbar.md` — followed: the settings button needs no header CSS, three buttons fit
  exactly at 320px.
- `2026-10-10-confirm-dialog.md`, `2026-10-10-native-dialog.md` — followed, nothing new.
- `2026-10-10-css-custom-properties-from-js.md` — followed: `GridView` passes the board size to CSS as
  `--board-size` and CSS reads it with a fallback.
- `2026-10-10-new-record-badge.md` — followed: `#hasRecordToBeat` is derived from the record of the
  size on screen; the saved format does not store it.
- `2026-10-10-theme-tokens-and-head-script.md` — no new colour: the control uses the dialog's existing
  tokens, which the light theme already re-points for the settings card.
- `2026-10-10-rejected-features.md` — nothing from the list.

Everything below that the author's answers do not cover is my choice, recorded here and in the
decision records of section 9, and final unless the author objects at review.

## 1. Where each part lives (`ai/rules/oop.md`)

| Layer / file                                     | Change                                                                                                                                                                                                                             |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/scripts/constants.js`                       | `BOARD_SIZE` goes. New: `BOARD_SIZES`, `SETTING_NAMES`, `LEGACY_BOARD_SIZE`, `LEGACY_SAVED_GAME_VERSION`, `STORAGE_KEYS.HIGH_SCORE_PREFIX` / `LEGACY_HIGH_SCORE`; `SAVED_GAME_VERSION` is 2; `boardSize` in `SETTING_DEFINITIONS`. |
| `src/scripts/game/Game.js`                       | The size is a property of the game: `size` getter, `start(size)`, `toState()` and `restore(state)` carry and validate it.                                                                                                          |
| `src/scripts/game/Settings.js`                   | Nothing: `SETTING_DEFINITIONS` already drives it.                                                                                                                                                                                  |
| `src/scripts/ui/GridView.js`                     | The size is no longer a constructor argument: `resize(size)` rebuilds the background cells and sets `--board-size`.                                                                                                                |
| `src/scripts/GameController.js`                  | Takes `settings`; reads the size when it starts a game; the record per size and its one-time migration; the version-1 upgrade; the save-wins rule; the reset prompt wording.                                                       |
| `src/scripts/SettingsController.js`              | Nothing: it already saves and ends in `restart()`.                                                                                                                                                                                 |
| `src/scripts/main.js`                            | One shared `Settings`, passed to both controllers; no `BOARD_SIZE`.                                                                                                                                                                |
| `src/index.html`                                 | The "Board size" section (a radio group of three labelled radios), `hidden` removed from `.settings-button`.                                                                                                                       |
| `src/styles/layout.css`, `tiles.css`             | `--cell-size` moves to `.game-grid` and becomes a function of the board size; the tile font sizes are shares of `--cell-size`.                                                                                                     |
| `src/styles/controls.css`                        | The segmented control. No new colour, so nothing in `theme.css`; nothing in `motion.css` (a colour change has no animation worth switching off beyond the global rule).                                                            |
| `SafeStorage`, input, `ScoreView`, `OverlayView` | Unchanged.                                                                                                                                                                                                                         |

The layers keep their jobs: the model validates and reports (`Game`), the controller decides when to
read and write and which keys, the view draws what it is given, `SafeStorage` only moves strings and
JSON.

## 2. The size flows from the setting

```js
// constants.js
export const BOARD_SIZES = Object.freeze([3, 4, 5])
export const SETTING_NAMES = Object.freeze({ BOARD_SIZE: 'boardSize' })
export const SETTING_DEFINITIONS = Object.freeze({
  [SETTING_NAMES.BOARD_SIZE]: { defaultValue: 4, allowedValues: BOARD_SIZES },
})
```

- `SETTING_NAMES` is the one place the name `boardSize` is written in JS (the HTML `name` has to
  repeat it; the markup recipe says so). MY-129 adds `WIN_TARGET`.
- `GameController` receives the shared `Settings` model in its constructor (a model, not the settings
  controller: it reads one value and, on a restore, sets one). `#startNewGame()` does
  `game.start(settings.get(SETTING_NAMES.BOARD_SIZE))`, then `gridView.resize(game.size)`, loads the
  record of that size and draws. `SettingsController.requestChange` already ends in
  `settings.set` → `persist` → `gameController.restart()`, so a change is picked up by the next game
  with no new path. `settingsController.start()` still runs before `controller.start()`.
- `Game` keeps its constructor `{ size, winTile }` so it is always a valid game; the size given there
  is the board it holds before its first `start` or `restore` (`main.js` passes the setting's current
  value). `start(size = this.#size)` begins a game on `size`; `get size()` reports it.
  `restore(state)` adopts `state.size` once the whole state has passed validation, and fails without
  touching the game otherwise.
- `GridView` takes the element only. `resize(size)` finishes what is running, forgets the tile elements
  and rebuilds the `size * size` background cells (`replaceChildren`, which also drops the tile
  elements), then sets `--board-size`. It is always followed by `render(...)`. Rejected: a new
  `GridView` per size (`main.js` would have to rewire its callers, and the element is one).
- `Board` needs nothing: it already takes its size and every loop uses `#size`.
- `BOARD_SIZE` is deleted, not kept as a default (it would be a second source next to the definition's
  `defaultValue`).

## 3. Records and the saved game, per size

### 3.1 The high score per size

- Keys: `highScore3x3`, `highScore4x4`, `highScore5x5`, built by one private static method of
  `GameController` from `STORAGE_KEYS.HIGH_SCORE_PREFIX` (`'highScore'`) and the size. Rejected: a map
  literal of three keys (the sizes would be written twice), a JSON object under one key (one write
  would lose another size's record if two tabs are open, and `SafeStorage.getNumber` fits the key
  per size).
- `GameController` keeps `#highScore` for the size on screen, as now. A new private `#showBoardSize(size)` resizes the
  grid, reads that size's record and renders it; it runs when a game starts and when a save is
  restored, before the score is rendered, so `#hasRecordToBeat` (`highScore > 0` for a new game,
  `score < highScore` for a restored one) is derived from the right record. The record is written to
  the key of `game.size` and reset through the same key.
- The reset prompt's text changes: `The high score of this board size will be set back to 0. Other
sizes and your current game are not affected.` It stays a static prompt (no size in the string),
  so nothing else about the prompt changes.

### 3.2 The old record: a one-time migration

`STORAGE_KEYS.LEGACY_HIGH_SCORE` is the old `'highScore'`. `GameController.start()` calls
`#migrateLegacyHighScore()` first:

```js
// if the old key exists:
//   record = max(old key as a number, the 4x4 key as a number)
//   write record to the 4x4 key, then remove the old key
```

- "Once" is the removal: a second start finds no old key. Removing it also keeps a later reset of the
  4x4 record from being undone by a stale old key. The `max` (not an overwrite) covers an older tab that
  still writes the old key after a newer one has created the 4x4 key; nothing is lost either way.
- A garbage old value reads as 0 (`getNumber`) and the key is removed too.
- Storage that throws or is blocked: `SafeStorage` swallows both, the game starts with a record of 0
  and the old key stays where it was (not lost).

### 3.3 The saved game

- `SAVED_GAME_VERSION` becomes 2: `{ version: 2, size, board, score, hasWon }`. `Game.toState()` returns
  `{ size, board, score, hasWon }` and the controller adds `version`.
- `Game.restore(state)` validates `size` first (`BOARD_SIZES.includes(size)`), then the board as `size`
  rows of `size` cells, as it does today, and the rest unchanged.
- The controller owns the envelope and the upgrade, in one private static method
  `#readSavedGame(saved)`: version 2 → as is; version 1 (`LEGACY_SAVED_GAME_VERSION`) → the same object
  with `size: LEGACY_BOARD_SIZE` (4); anything else → `null`. The result goes to `Game.restore`; a failure
  is "no save" and `#startNewGame` deletes the bad one, as before. Rejected: the model knowing the
  version (it never has).
- **A save disagrees with the setting: the save wins.** After a successful restore the controller sets
  the in-memory setting to `game.size` (`settings.set`, not saved), shows that size and its record, and the
  settings dialog (which renders from the model) shows it. The stored `settings` key is rewritten by the next
  change as usual. Rejected: discarding the save (a player loses a game for a mismatch they cannot see
  and did not cause); keeping the setting and the save apart (the dialog would say 4x4 over a 5x5
  board, and choosing "4x4" would do nothing because it is "unchanged"); writing the settings from the
  game controller (`SettingsController` stays the only writer).
  How it can happen: the settings key is cleared or damaged while the save is kept, or a second tab
  changed the size. A normal change cannot cause it, because it ends in `restart()`, which deletes the save.
- Next versions: MY-129 adds `winTile` to the state (one more field, `Game.restore` validates it, the version
  goes to 3, and a version 2 save reads as the default target of its size); MY-130 adds a move count (the
  same way) and keeps its statistics under a key of their own, shared by all sizes. The upgrade method is
  where each older version learns its defaults; nothing in `Game` branches on a version.

## 4. The settings section

```html
<section class="settings-section">
  <h3 id="settings-board-size-title">Board size</h3>
  <div
    class="segmented"
    role="radiogroup"
    aria-labelledby="settings-board-size-title"
  >
    <label class="segment">
      <input class="visually-hidden" type="radio" name="boardSize" value="3" />
      <span>3×3</span>
    </label>
    <!-- 4×4, 5×5 -->
  </div>
</section>
```

and `hidden` removed from `.settings-button`. That is all the JavaScript the section needs
(`SettingsView.render` checks the radio of the stored value, `onChange` reports `(name, value)`).

- The radio inputs stay in the DOM and in the accessibility tree (the `.visually-hidden` utility, not
  `display: none`), so the group is a real radio group: arrows, `Tab`, `Space`, the name "Board size" and
  "1 of 3" for a screen reader. The `<span>` is what is drawn.
- The label text is `3×3` with the multiplication sign, as the author wrote it. The radio's name is
  that text; a screen reader says "3 times 3" or "3 by 3". Checked in the accessibility tree; a real
  screen reader is not available.
- Styles in `controls.css` (the buttons' file), tokens that exist: `--dialog-text`, `--button-outline`,
  `--button-outline-hover-bg`, `--button-bg`, `--button-text`. The row is a flex container; each segment is
  an equal share, `min-height: 44px`, 2px outline, the shared rounded ends (`8px` on the outer corners, the
  borders overlap by 2px so there is one line between two segments); the checked segment is the primary
  button look; hover on an unchecked one is the outlined buttons' hover. Focus: `input:focus-visible + span`
  draws the shared ring (`3px solid var(--focus-ring-color)`, offset 3px; the dialog already re-points the
  colour), so a keyboard user sees it exactly where a button would show it. The ring is on the span, outside
  its box, so nothing may clip it (no `overflow: hidden` on the row).
- The light theme needs nothing: `:root[data-theme='light'] .settings-dialog` already re-points the button
  tokens to ink on paper, and the segment reads them (checked in both themes).

## 5. Fitting the board and scaling the text

### 5.1 The cell size

`--cell-size` leaves `.game-container` (which cannot see `--board-size`, set on its child) and becomes a
declaration of `.game-grid`, which owns the size. `--cell-gap` stays on the container and is inherited.

```css
.game-grid {
  --cell-size: min(
    clamp(
      60px,
      72vw / var(--board-size, 4),
      min(100px, 400px / var(--board-size, 4))
    ),
    (
        100vw - 2 * var(--page-padding) - (var(--board-size, 4) + 3) *
          var(--cell-gap)
      ) /
      var(--board-size, 4)
  );
}
```

- The first term is today's rule with the board size in it: `18vw` is `72vw / 4`, so 4x4 is unchanged (the
  `400px / 4` cap is 100px, today's cap). 3x3 gets `24vw` and the same 100px cap, so it never grows past
  the cell 4x4 already has; 5x5 gets `14.4vw` and an 80px cap, so the 5x5 board is about as wide as the
  4x4 one on a desktop (496px against 484px) and not 596px.
- The second term is the one that fixes the overflow: the cell can never be bigger than what is left of
  the viewport after the page padding and the `size + 3` gaps (two board paddings and the gaps between
  cells). It only bites where the 60px floor of the first term would overflow (5x5 below about 400px).
  The floor itself is kept because it is what holds 4x4's measured look.
- Measured before the change (baseline, 4x4): the cell is 60, 61.19, 67.5, 74.52, 86.39, 100, 100, 100,
  100 at 320, 340, 375, 414, 480, 600, 768, 1000, 1440px. After the change the same widths must give the
  same numbers for 4x4; that is checked, not assumed. At 320px the board is 296 / 300 / 278 wide for
  4 / 5 / 3, inside the 300px of free width.
- Rejected: a pure fit formula for every size (4x4 would grow on phones, a visible change nobody asked
  for), a per-size class on the grid with its own numbers (a second place that knows the sizes), and a
  `vh` term (the page already scrolls vertically on short windows at 4x4; 5x5 is no taller than it).
  `--page-padding` is the body's padding variable; the safe-area insets are ignored here as they are in
  the 4x4 rule today.

### 5.2 The tile text

Each per-value rule in `tiles.css` has `font-size: calc(var(--cell-size) * <share>)` instead of the
`clamp()` of viewport units: 0.4 for 1-2 digits, 0.35 for 3, 0.3 for 4, 0.25 for 5, and 0.2 for the
fallback (6 digits), the same sizes as today at the 100px cell, so 4x4 at 1000px is pixel-for-pixel as
before and a smaller cell shrinks the text with it. There is no pixel floor: a floor larger than the
share is what overflows a small tile. At 320px: 4x4 24 / 21 / 18 / 15 / 12px (today 20 / 18 / 16 / 14 / 12),
5x5 18.9 / 16.5 / 14.2 / 11.8 / 9.4px, 3x3 30.7 / 26.9 / 23 / 19.2 / 15.4px. The widest number must still
fit its tile on every size at 320px (measured with `scrollWidth`, section 8), the six-digit one included.
This changes 4x4 on phones: the text is larger than the old fixed 20px (27px at 375px); the issue asks for
text that scales with the cell and this is it. `ai/rules/style.md` (the digit-count sizes) and the
tile-palette record's consequences are updated to say "a share of the cell".

## 6. Budget

Baseline from MY-127: CSS 3.68 kB of 4, JS 6.36 kB of 8. Estimated: the segmented control about 110
gzipped bytes of CSS, the cell formula and the per-value font sizes about 60, the section markup (HTML, not
counted); JS about +0.3 kB (migration, upgrade, `resize`). So CSS crosses 4 kB and the limit goes to 5 kB in
`.size-limit.json` with a decision record (author's answer 5, `2026-10-12-css-budget-5-kb.md`). If the real
number stays under 4 kB, the limit is left alone and no record is written. The measured numbers go into
the report.

## 7. Commits

1. `docs: add spec and plan for MY-128 board sizes` — these two files.
2. `feat: make the board size a setting the game and the grid read` — constants, `Game`, `GridView.resize`,
   `GameController` reading `Settings`, `main.js`. The button is still hidden; the size can only be set through
   storage, and a version 1 save of another size than the setting is discarded (transient: the next commit).
3. `feat: keep a high score for each board size` — keys, the migration, the reset wording.
4. `feat: save the board size and read old saves as 4x4` — `SAVED_GAME_VERSION` 2, `Game` state, the upgrade, the
   save-wins rule.
5. `style: fit every board size to the screen and scale tile text with the cell` — section 5.
6. `feat: add the board size section and turn the settings button on` — markup and the segmented control.
7. `build: raise the CSS size limit to 5 kB` and its record — only if the build says so.
8. `docs: document board sizes, per-size records and save format 2` — `README.md`, `ai/map.md`, rules, skills,
   decisions (section 9).
9. `docs: record what building MY-128 found in its plan` — only if reality diverges.

Each commit builds and passes the hook. Commits 2 to 4 are testable through storage alone; 5 before 6 so the
section is never shown while 5x5 still overflows.

## 8. Verification

`yarn lint`, `yarn format:check`, `yarn build`, `yarn size` (baseline CSS 3.68 kB / 4, JS 6.36 kB / 8).

In headless Chrome over the DevTools Protocol (the dev server on 5192 and the preview of the build on 5196;
real key events and touch events, `Emulation.setEmulatedMedia` for the colour scheme and reduced motion),
widths 1000, 375 and 320, both themes:

- **Geometry.** For every size and for 320, 340, 375, 414, 480, 600, 768, 1000 and 1440: the grid's and the
  header's rects, the cell size and `scrollWidth <= innerWidth`; every tile fits (`scrollWidth <= clientWidth`)
  for the values 2, 128, 1024, 16384 and 131072. 4x4 equals the baseline measured before the change.
- **Play.** Each size: arrows and WASD, touch swipes in all four directions, merges and the win-free game over
  on 3x3 (fill the board), slide / merge / new-tile animations (a screenshot mid-move), a burst of fast presses
  (the DOM board, the save and the model agree, no stray tile), reduced motion.
- **Settings.** Open by mouse and by keyboard; `Tab` order, the arrows select, `Space`, the focus ring in both
  themes; the accessibility tree (a named radio group, three named radios, one checked); the dialog at 1000px
  and 320px in both themes (screenshots), contrast of the checked and unchecked text.
- **Changing the size.** On a fresh game (saved, new board behind the dialog, dialog stays open); in a game in
  progress (the question; `Cancel`, `Escape`, forced close: board, score and `savedGame` unchanged, settings back
  with the old size; `New Game`: saved, new game, focus on the board, a never-two-dialogs check in each step);
  the same size again does nothing.
- **Records.** A record per size; the reset hits the current size only; the badge shows once per game per size
  and not for a size with no record; the High Score box follows the size; after a reset the badge stays quiet.
- **Reload.** Each size restores its game, score and record; a finished game does not come back; the
  settings dialog shows the right size after a reload.
- **Old data**, put in storage before the first load: `highScore` = `1234` and a version 1 `savedGame` → the 4x4
  record is 1234, the old key is gone, the game is restored as 4x4, the next move rewrites the save as version 2;
  `highScore` plus an existing `highScore4x4` (the larger wins); a garbage `highScore`; a version 1 save with
  `settings` = 5 (the save wins, the dialog shows 4x4); a version 2 save for 5 with no settings key; a save with
  `size` 6 / `"4"` / missing, a board that does not match its size, version 99 (each discarded, a new game starts,
  the save key removed); corrupted `settings`; blocked storage.
- Console: no error in any of these.

Before the final commit: the build is rebuilt and the sizes in the report are the committed ones.

## 9. Docs and decisions

- `README.md`: the feature line (three board sizes from the settings dialog, a high score for each, the board
  fits from 320px), the structure listing, the architecture note about the generated cells.
- `ai/map.md`: the `index.html` row and the header text (the settings button is shown), the scripts table
  (`constants.js`, `GameController`, `Game`, `GridView`, `main.js`), the styles table (`layout.css`, `tiles.css`,
  `controls.css`), the Settings section (the steps are done; what MY-129 and MY-130 add), the Storage table and
  text (the keys per size, the legacy key, save format 2).
- `ai/rules/architecture.md` (the board size comes from the setting), `ai/rules/style.md` (the digit-count text
  sizes and the cell-size rule), `ai/rules/definition-of-done.md` needs nothing.
- `ai/skills/feature.md` (the Settings step: the button is on; a setting the game reads; the save-vs-setting rule)
  and `ai/skills/review.md` (the settings button is shown now; checks per size).
- Decision records, dated 2026-10-12, and the `ai/decisions/README.md` index:
  - `2026-10-12-board-size-records-and-saved-game.md` — the record per size and the key names, the one-time
    migration of `highScore` (max, then remove), the saved game version 2 and the version 1 upgrade in the controller,
    the save-wins rule and what was rejected, the reset wording, how MY-129 / MY-130 extend the format.
  - `2026-10-12-board-geometry-per-size.md` — the cell-size rule (4x4 unchanged, caps, the fit term), the tile text as a
    share of the cell, the segmented control over visually hidden radios.
  - `2026-10-12-css-budget-5-kb.md` — only if the limit is raised.
  - Short "Refined by" lines in `2026-10-10-saved-game-format.md` and `2026-10-10-tiles-over-the-grid.md` (their open
    points are settled here), as earlier records do.

## 10. How MY-129 and MY-130 plug in (checked against this design)

- **MY-129:** `winTarget` is one more `SETTING_DEFINITIONS` entry; its allowed values depend on the size, which is
  a method of `Settings` (fields are read in table order, the size first; changing the size sets the middle target).
  `Game` takes the target the way it takes the size (a `start` argument, a validated `restore` field); the save
  version goes to 3 and `#readSavedGame` gives a version 2 save the default target of its size. The win and
  game-over texts that say `2048` follow it. Nothing built here has to be undone.
- **MY-130:** the statistics live under their own key, shared by all sizes (not under a size), written by their own
  object; the move count is a field of the game state and of the save (version bump, default 0 for older saves). The
  high score per size stays as it is.

## 11. Out of scope

The win target and anything MY-129 owns (so on 3x3 the 2048 target is unreachable for now); statistics and the move
counter (MY-130); a size label on the High Score box; sizes other than 3, 4 and 5; making the page fit short windows
vertically; a keyboard shortcut for the size; automated tests.
