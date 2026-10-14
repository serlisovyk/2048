---
name: feature
description: Use when adding or changing a game-facing feature in the 2048 game — which class in which layer owns state, rendering, input, styles, and storage, and how they connect.
---

# Feature

## When to use

Adding a gameplay feature, a UI control, a dialog, an animation, or anything that
reads or writes persisted data.

## Steps

1. Read `ai/map.md` (who owns what) and follow `ai/rules/oop.md`; do not rediscover the code.
2. Split the feature across the layers before writing code:
   - **Model** (`game/`): the state change and the rule behind it, a method on `Game` or
     `Board` or a new model class. Pure and deterministic (only tile spawning is random);
     no DOM, storage or timers. Return a result object (a move: `slides`, `merges`,
     `spawnedTiles`), never call views.
   - **Controller** (`controllers/`): the use case: when to call the model, which views to
     update, what to persist, guards and pauses. One role each: a role with a key of its own
     is its own controller (`HighScoreController`, `SavedGameController`).
   - **Views** (`ui/`): how it looks: a method on a view or a new view class that owns its
     elements; user actions are `on<Action>(handler)` (vocabulary in `ai/rules/oop.md`).
   - **Input**: every move goes through `GameController.requestMove`, whatever the source.
   - **Storage**: through `SafeStorage`, with a `version` when the shape can evolve. The
     model exports and validates game state (`Game.toState` / `Game.restore`);
     `SavedGameController` owns the `version` envelope. **A new field of the save is a
     version bump and one entry in `SavedGameController.#SAVE_UPGRADES`**, keyed by the
     version the step starts from and returning the next version with the field filled: an
     unknown or newer version is no save and the model stays strict. Other data (the
     statistics) gets a key of its own and a controller that is its only writer
     (`StatisticsController`): it writes only when something changes, never at start, and a
     damaged blob costs a field or gives zeros (`ai/decisions/2026-10-13-statistics.md`).
   - **Styles**: the CSS file that owns that responsibility (`ai/map.md`), keyframes in
     `animations.css`, reduced motion in `motion.css`. Colours, sizes, tiles, fonts and focus
     follow `ai/rules/style.md`: any new colour is a token, sizes come from the scales, text
     inherits the font from `body`.
3. Wire new objects in `main.js` only: the one place that queries the DOM and calls `new`.
   Its `start()` order is part of the design: the settings and the statistics load first,
   because the game reads the one and counts into the other.
4. Put every new shared value in `constants.js`; CSS gets a number from JS as a custom
   property set by the owning view.
5. Verify per `ai/rules/definition-of-done.md`, and play the feature on desktop and at
   mobile width.

## Recipes

**Dialog** — native `<dialog>` + `showModal()`: the top layer, the inert page, the `Tab`
trap, `::backdrop` and `cancel` on `Escape` come free (`ai/decisions/2026-10-10-native-dialog.md`).

- Markup in `index.html`: `<dialog class="…" aria-labelledby="…">` with a heading and real
  buttons (`.button`, `.button-outline` for a secondary one, plus a hook class for `main.js`);
  no `role` / `aria-modal`. The safe or primary button comes first, with `autofocus`.
- View: `OverlayView` owns the `<dialog>` elements `main.js` passes in: `open…()` calls
  `showModal()`, `close…()` calls `close()`; no `style.display`, no manual focus. A dialog
  with state of its own gets its own view class. A modal page takes no move, so the two
  game-end dialogs never need to close each other.
- `Escape` is the `cancel` event: cancel it and run the action that fits (`onContinue` answers
  it too), or only `preventDefault()` when there is nothing to dismiss into. A browser may
  close a dialog by force on a repeated `Escape`: leave it closed, keep the controller valid.
- Focus: the win and game-over dialogs return it to the board on every close
  (`OverlayView.onClose`); a dialog a button opens and the player can dismiss (the
  confirmation, the settings) gives it back to that button.
- The controller decides when to open which dialog; the model only reports (`hasJustWon`,
  `isOver`). What a dialog says about the game (`#getSummary()`) is written by the view into
  the `[data-summary]` element of that name: the markup holds labels and no number.
- CSS (`overlays.css`): the `dialog` rule is every dialog's look (`display` only on
  `&[open]`, `margin: auto`, the dimming on `&::backdrop`); its own class sets only its
  background. `::backdrop` is in the reduced-motion selector in `motion.css`: `*` misses it.

**Confirmation** ("are you sure?" before something hard to undo) — do not write another
dialog: `ConfirmDialogView.ask({ title, message, confirmLabel })` returns a `Promise<boolean>`
(`#confirm` in the controller wraps `ask()` and the focus rule; the wording is a private
static frozen prompt next to the use case). `Cancel` is in the markup and has the initial focus; `Escape` or a forced close answer
`false`, and only a closed dialog answers: its `close` event can arrive after a new question
has opened it. Ask only when there is something to lose (`game.isInProgress`); buttons whose
intent is explicit use `restart()`. Focus: after a "no" call `restoreFocus()` (fall back to
`returnFocusToBoard()` when it returns `false`); after a "yes" act, then focus the board
(`restartAndFocus()`). Never stacked over another dialog: the settings close first and reopen
on "no" (`ai/decisions/2026-10-10-confirm-dialog.md`).

**Setting** — a choice the player makes once and the game keeps (board size, win target):
data plus a section of the existing dialog
(`ai/decisions/2026-10-11-settings-dialog-and-storage.md`).

- Value: one entry in `SETTING_DEFINITIONS` (`name: { defaultValue, allowedValues }`).
  `Settings` validates field by field and takes a value that is, or reads as (the form hands
  over strings), an allowed one; `SettingsController` saves `{ version, <name>: … }` under
  `STORAGE_KEYS.SETTINGS`, only when a setting changes. A new field with a default
  needs no version bump; changing what a field means or allows does.
- Section: markup only, in `.settings-dialog` between the title and `Close`:
  `<section class="settings-section">`, an `<h3 id="…">` and a
  `<div role="radiogroup" aria-labelledby="…">` (the heading's id) with one
  `<label><input type="radio" name="<setting>" value="<allowed value>"> …</label>` per
  choice; `name` is the setting's name in `SETTING_NAMES`. The group, not the `<section>`,
  carries the label (a labelled `<section>` adds a second landmark). `SettingsView.render`
  checks the stored value and `onChange` reports `(name, value)` to
  `SettingsController.requestChange`: nothing to wire in `main.js`. A few exclusive options
  are a `.segmented` control: the inputs stay a real radio group (`visually-hidden`), the
  `<span>` after each is drawn and carries the focus ring.
- A change starts a new game: `requestChange` ignores an unchanged or invalid value, asks
  first in a game in progress (the settings reopen on "no" with the stored value, so a refusal
  needs no revert), saves, then `GameController.restart()`. The game reads the value where it
  builds the game: both controllers get the same `Settings`, and the settings start first.
- Choices that depend on another setting (win target on board size): `dependsOn: <name>`,
  an `allowedValues` map from the other's value to the choices, no `defaultValue` (the
  middle choice, again each time the other changes), listed after what it depends on. The
  radios' values and labels come from `SettingsView.render(values, choices)`;
  `SettingsController.#render` passes `getAllowedValues` every time.
- Also part of the saved game (size, win target): the save stores what the game was built
  with; a save that disagrees with the stored setting wins, and `GameController` sets the
  in-memory setting from it, the one others depend on first; `SettingsController` stays the
  only writer. Data kept per choice (the high score per size) gets a key per choice
  (`ai/decisions/2026-10-12-board-size-records-and-saved-game.md`).
- An action inside a section (the statistics reset): `SettingsController.#askFromSettings`
  closes the settings, asks through `ConfirmDialogView` and reopens on "no"; on "yes" act and
  focus the board. A section that is not a radio group (Statistics) is markup (a `<dl>` whose
  `<dd data-statistic="…">` are named after the fields shown) plus a `SettingsView` method
  that writes the values (`renderStatistics`, called by `#render`) and `on<Action>` for its
  button; no `SETTING_DEFINITIONS` entry. A button with nothing to do is `hidden`. The high
  score reset stays by the high score (`ai/decisions/2026-10-11-high-score-reset-stays-in-the-header.md`).

**Controls** — real `<button>`s with an accessible name (`ai/rules/style.md`).

- A link out of the page (`.github-link`) has a row of its own, not a toolbar button; text
  that comes from code (the footer's year) is written by a view (`FooterView`)
  (`ai/decisions/2026-10-13-footer-and-github-link.md`).
- A header action (the theme toggle, the settings button) is a `.toolbar-button` in
  `.toolbar`: copy the `New Game` button, give it an inline SVG icon (24px), an `aria-label`
  and a `title` with the same text, a hook class for its view and a one-method view class
  (`NewGameView`). No CSS, unless the icon depends on a state (the theme toggle holds both
  icons and `controls.css` shows one by `data-theme`). Three buttons fit at 320px, a fourth
  does not (`ai/decisions/2026-10-10-header-toolbar.md`).
- A value that changes during play and that a screen-reader user needs gets a live region
  owned by its view (`ScoreView`), updated after a debounce; something that must be heard but
  is not the value (the `New record!` badge) rides on that announcement (`ai/rules/style.md`,
  `ai/decisions/2026-10-10-new-record-badge.md`). A fact about the current game that depends
  on the high score is controller state (`HighScoreController`), derived on restore.

**Animation** — respect `prefers-reduced-motion` and never let an animation swallow or
reorder player input (`ai/rules/style.md`).

- A transient element a view creates (the score pop) is `aria-hidden` and floats out of the
  layout, so it never shifts what is around it or covers a button; a newer one replaces the
  one still in the air (`ai/decisions/2026-10-10-score-pop.md`).
- A flourish that needs a newer browser API (the theme reveal, a View Transition) is a
  progressive enhancement: feature-detect it in the view, skip it under reduced motion in
  JS, keep the instant path as the base behaviour, keep its coordinates as custom
  properties, and swallow the `ready` rejection of a transition a newer one replaced
  (`ai/decisions/2026-10-10-view-transitions-progressive-enhancement.md`).
- A tile animation follows the move result (`GridView.animateMove`), not a diff of the
  board; the order (slide, merge pop, new tile) is CSS delays, not JS timers. The view
  finishes the running move at once (`getAnimations().finish()`) before the next: no input
  lock, no queue. A whole board is drawn with `render({ size, tiles, spawnedTiles })`: a new
  game pops its tiles in, a restored one draws with no animation. When a move settles the
  view re-appends the tiles in row-major order, for screen readers; re-appending drops a
  transition, so only the settle timer does it, never a move
  (`ai/decisions/2026-10-10-tiles-over-the-grid.md`,
  `ai/decisions/2026-10-10-input-during-tile-animation.md`).

## Avoid

What the rules and decisions do not already say loudly:

- Settings kept outside the `settings` object (a key per setting), read by a view, or
  written on a path other than `SettingsController`.
- A placeholder button, section or state for a feature that does not exist yet.
- A "has beaten the record" flag in the model or in the saved game.
- A pixel position written by JS, or an input lock, cooldown or queue for an animation.
