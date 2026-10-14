---
name: feature
description: Use when adding or changing a game-facing feature in the 2048 game — which class in which layer owns state, rendering, input, styles, and storage, and how they connect.
---

# Feature

## When to use

Adding a gameplay feature, a UI control, a dialog, an animation, or anything that
reads or writes persisted data.

## Steps

1. Read `ai/map.md` (who owns what) and follow `ai/rules/oop.md`. Do not rediscover the
   code from scratch.
2. Split the feature across the layers before writing code:
   - **Model** (`game/`): the state change and the rule behind it, a method on `Game` or
     `Board` or a new model class. Pure and deterministic (only tile spawning is random);
     no DOM, storage or timers. Return a result object, never call views. A move reports
     `slides`, `merges` and `spawnedTiles` with tile ids, so a view can animate it without
     diffing values.
   - **Controller**: the use case: when to call the model, which views to update, what to
     persist, guards and pauses.
   - **Views** (`ui/`): how it looks: a method on a view or a new view class that owns its
     elements; user actions are `on<Action>(handler)`.
   - **Input**: every move goes through `GameController.requestMove`, whatever the source.
   - **Storage**: through `SafeStorage`; tolerates blocked storage and corrupted JSON;
     carries a `version` when its shape can evolve. The model exports and validates game
     state (`Game.toState` / `Game.restore`); the controller owns the `version` envelope
     and when to save or delete. **A new field of the save is a version bump and one entry
     in `GameController.#SAVE_UPGRADES`** (the step from the old version to the next,
     filling the field): an unknown or newer version is no save and the model stays strict.
     Data that is neither a setting nor the current game (the statistics) gets a key of
     its own, a model and a controller that is its only writer (`StatisticsController`),
     writes only when something changes, never at start, and a damaged blob costs a field
     or gives zeros (`ai/decisions/2026-10-13-win-target-per-board-size.md`,
     `ai/decisions/2026-10-13-statistics.md`).
   - **Styles**: the CSS file that owns that responsibility (`ai/map.md`), motion in
     `motion.css`. Colours, tiles, fonts and focus follow `ai/rules/style.md`: any new
     colour is a token, text inherits the font from `body`.
3. Wire new objects in `main.js` only: the one place that queries the DOM and calls `new`.
4. Put every new shared value (sizes, thresholds, timings, storage keys, targets) in
   `constants.js`. When CSS needs a number from JS, the owning view sets it as a custom
   property.
5. Verify per `ai/rules/definition-of-done.md`, and play the feature on desktop and at
   mobile width.

## Recipes

**Dialog** — native `<dialog>` + `showModal()`: the top layer, the inert page, the `Tab`
trap, `::backdrop` and `cancel` on `Escape` come free (`ai/decisions/2026-10-10-native-dialog.md`).

- Markup in `index.html`: `<dialog class="…" aria-labelledby="…">` with a heading and real
  buttons; no `role` / `aria-modal`. The safe or primary button comes first, with `autofocus`.
- View: `OverlayView` owns the `<dialog>` elements `main.js` passes in: `show…()` calls
  `showModal()` (and closes the other game-end dialog first), `hide…()` calls `close()`; no
  `style.display`, no manual focus. A dialog with state of its own gets its own view class.
- `Escape` is the `cancel` event: cancel it and run the action that fits (continue
  playing, cancel), or only `preventDefault()` when there is nothing to dismiss into. A
  browser may close a dialog by force on a repeated `Escape`: leave it closed and keep the
  controller's state valid.
- Focus: the win and game-over dialogs return it to the board on every close
  (`OverlayView.onClose` → `GameController.returnFocusToBoard()`); a dialog a button opens
  and the player can dismiss (the confirmation) gives it back to that button.
- The controller decides when to show which dialog; the model only reports (`justWon`,
  `isOver`). What a dialog says about the game (score, moves, highest tile) is read off the
  game (`#getSummary()`) and written by the view into the `[data-summary]` element of that
  name: the markup holds labels and no number.
- CSS (`overlays.css`): `display` only on `dialog[open]`; `margin: auto` (the reset's
  `margin: 0` beats the browser's); dimming on `dialog::backdrop`; `::backdrop` in the
  reduced-motion selector in `motion.css`, since `*` does not match it.

**Confirmation** ("are you sure?" before something hard to undo) — do not write another
dialog: `ConfirmDialogView.ask({ title, message, confirmLabel, cancelLabel })` returns a
`Promise<boolean>`: `if (!(await this.#confirm(GameController.#NEW_GAME_PROMPT))) return`.
`#confirm` wraps `ask()` and the focus rule. The wording is a private static frozen prompt
next to the use case. `Cancel` has the initial
focus; `Escape` or a forced close answer `false`. Ask only when there is something to lose
(`game.isInProgress`) and keep an unconditional path (`restart()`) for buttons whose intent is
explicit. Focus: after a "no" call `restoreFocus()` (fall back to `returnFocusToBoard()` when
it returns `false`); after a "yes" act, then `returnFocusToBoard()`. Never stacked over
another dialog: the settings close first and reopen on "no"
(`ai/decisions/2026-10-10-confirm-dialog.md`).

**Setting** — a choice the player makes once and the game keeps (board size, win target).
The dialog, the storage and the "this starts a new game" question exist: a setting is data
plus a section (`ai/decisions/2026-10-11-settings-dialog-and-storage.md`).

- Value: one entry in `SETTING_DEFINITIONS` (`name: { defaultValue, allowedValues }`).
  `Settings` validates field by field; `SettingsController` saves `{ version, <name>: … }`
  under `STORAGE_KEYS.SETTINGS`, only when a setting changes. A new field with a default
  needs no version bump; changing what a field means or allows does.
- Section: markup only, in `.settings-dialog` between the title and `Close`:
  `<section class="settings-section">`, an `<h3 id="…">` and a
  `<div role="radiogroup" aria-labelledby="…">` (the heading's id) with one
  `<label><input type="radio" name="<setting>" value="<allowed value>"> …</label>` per
  choice. The group, not the `<section>`, carries the name (a labelled `<section>` adds a
  second landmark). `SettingsView.render` checks the stored value and `onChange` reports
  `(name, value)` to `SettingsController.requestChange`: nothing to wire in `main.js`. A few
  exclusive options are a `.segmented` control
  (`<label class="segment"><input class="visually-hidden" type="radio" …><span>…</span></label>`):
  the inputs stay a real radio group, the `<span>` is drawn and carries the focus ring
  (`input:focus-visible + span`). Tokens only. No placeholder section for a setting that has
  no issue yet.
- A change starts a new game: `requestChange` ignores an unchanged or invalid value, asks
  first in a game in progress (the settings close for the question and reopen on "no" with
  the stored value, so a refusal needs no revert), saves, then `GameController.restart()`.
  The game reads the value where it builds the game: `main.js` hands the same `Settings` to
  both controllers and `settingsController.start()` runs before `controller.start()`.
- Choices that depend on another setting (win target on board size): `dependsOn: <name>`,
  an `allowedValues` map from the other's value to the choices, no `defaultValue` (the
  middle choice), listed after what it depends on. `Settings` accepts only the choices in
  force (`getAllowedValues`) and `set` returns it to the default when the other really
  changes. The radios' values and labels come from `SettingsView.render(values, choices)`;
  `SettingsController.#render` passes the choices every time.
- Also part of the saved game (size, win target): the save stores what the game was built
  with and the model validates it (`Game.restore`); a save that disagrees with the stored
  setting wins, and `GameController` sets the in-memory setting from it, the one others
  depend on first. It is never written: `SettingsController` stays the only writer. Data
  kept per choice (the high score per size) gets a key per choice
  (`ai/decisions/2026-10-12-board-size-records-and-saved-game.md`).
- An action inside a section (the statistics reset): `SettingsController.#askFromSettings`
  closes the settings, asks through `ConfirmDialogView` and reopens on "no"; on "yes" act and
  move focus to the board. A section that is not a radio group and not a setting (Statistics)
  is markup (a `<dl>` whose `<dd data-statistic="…">` are named after the fields shown) plus
  a `SettingsView` method that writes the values (`renderStatistics`) and `on<Action>` for its
  button; `#render` calls it on every render; no `SETTING_DEFINITIONS` entry. A button with
  nothing to do is `hidden`.
- Not here: the high score reset stays by the high score
  (`ai/decisions/2026-10-11-high-score-reset-stays-in-the-header.md`).

**Controls** — real `<button>`s with an accessible name (`ai/rules/style.md`).

- A link out of the page (`.github-link`) is a flex item of `body` with a row of its own,
  not a toolbar button; the footer is the last child of `.game-layout`, as wide as the
  board; text that comes from code (the year) is written by a view (`FooterView`)
  (`ai/decisions/2026-10-13-footer-and-github-link.md`).
- A header action (the theme toggle, the settings button) is a `.toolbar-button` in
  `.toolbar`: copy the `New Game` button, give it an inline SVG icon (24px), an `aria-label`
  and a `title` with the same text and a hook class for `main.js`. No CSS, unless the icon
  depends on a state (the toggle holds a sun and a moon and `controls.css` shows one by
  `data-theme`, so the right icon is there at first paint). At 320px three buttons fit, a
  fourth makes the header 5px wider than the board, a fifth overflows
  (`ai/decisions/2026-10-10-header-toolbar.md`). A toggle's label names the action
  (`Switch to light theme`), not the state, and has no `aria-pressed`.
- A value that changes during play and that a screen-reader user needs gets a live region
  owned by its view (`ScoreView`), updated after a debounce and only when it differs from the
  last announcement; something that must be heard but is not the value (the `New record!`
  badge) rides on that announcement (`ai/rules/style.md`,
  `ai/decisions/2026-10-10-new-record-badge.md`). A fact about the current game that depends
  on the high score is controller state, not model or view state, and is derived on restore.

**Animation** — respect `prefers-reduced-motion` and never let an animation swallow or
reorder player input (`ai/rules/style.md`).

- A transient element a view creates (the score pop) is `aria-hidden` and floats out of the
  layout (`position: absolute`, `pointer-events: none`), so it never shifts what is around it
  or covers a button; a newer one replaces the one still in the air
  (`ai/decisions/2026-10-10-score-pop.md`).
- A flourish that needs a newer browser API (the theme reveal, a View Transition) is a
  progressive enhancement: feature-detect it in the view, skip it under reduced motion in
  JS, keep the instant path as the base behaviour, keep its coordinates as custom
  properties (`ai/decisions/2026-10-10-view-transitions-progressive-enhancement.md`).
- A tile animation follows the move result (`GridView.animateMove`), not a diff of the
  board; the order (slide, merge pop, new tile) is CSS delays, not JS timers. The view
  finishes the running move at once (`getAnimations().finish()`) before the next: no input
  lock, no queue. `GameController` animates right after the move and shows a dialog at once.
  A whole board is drawn with `render(tiles, spawnedTiles)`: a new game pops its tiles in, a
  restored one draws with no animation (`ai/decisions/2026-10-10-tiles-over-the-grid.md`,
  `ai/decisions/2026-10-10-input-during-tile-animation.md`).

## Avoid

What the rules and decisions do not already say loudly:

- A second dialog open together with another one, or a second confirmation dialog or copy of
  its markup.
- Settings kept outside the `settings` object (a key per setting), read by a view, or
  written on a path other than `SettingsController`.
- A placeholder button, section or state for a feature that does not exist yet.
- A "has beaten the record" flag in the model or in the saved game.
- A pixel position written by JS, JS timers that order the steps of a move, or an input
  lock, cooldown or queue for the sake of an animation.
