---
name: feature
description: Use when adding or changing a game-facing feature in the 2048 game — which class in which layer owns state, rendering, input, styles, and storage, and how they connect.
---

# Feature

## When to use

Adding a gameplay feature, a UI control, a dialog, an animation, or anything that
reads or writes persisted data.

## Workflow

1. Read `ai/map.md` first — it lists every class and what it owns. Do not rediscover
   the code from scratch. Follow `ai/rules/oop.md`.
2. Split the feature across the layers before writing code:
   - **Model** (`src/scripts/game/`) — what changes in the game state and the rule
     that changes it: a method on `Game` or `Board`, or a new model class. Pure and
     deterministic (only tile spawning is random); no DOM, storage, or timers.
     Return a result object; do not call views. A move reports what changed, with
     tile ids: `slides` (`{ id, from, to }`), `merges` (a new tile and the two it
     replaces) and `spawnedTiles`, so a view can animate it without guessing from a
     diff of values.
   - **Controller** (`GameController`) — the use case: when to call the model, which
     views to update, what to persist, guards and pauses.
   - **Views** (`src/scripts/ui/`) — how it looks: a method on an existing view or a
     new view class that owns its elements. User actions are exposed as
     `on<Action>(handler)`.
   - **Input** (`src/scripts/input/`) — every move goes through
     `GameController.requestMove`, whatever the source.
   - **Storage** (`src/scripts/storage/`) — persisted data goes through
     `SafeStorage`, tolerates failures (blocked storage, corrupted JSON), and carries
     a `version` when its shape can evolve. Game state is exported and validated by
     the model (`Game.toState` / `Game.restore`); the controller owns the `version`
     envelope and when to save or delete (`ai/decisions/2026-10-10-saved-game-format.md`).
     A new field of the save is a version bump and **one entry in `GameController.#SAVE_UPGRADES`**
     (the step from the old version to the next, filling the field); the reader applies the steps in
     order, an unknown or newer version is no save, and the model stays strict
     (`ai/decisions/2026-10-13-win-target-per-board-size.md`).
   - **Styles** — the CSS file that owns that responsibility (see `ai/map.md`);
     motion overrides in `motion.css`. **Any new colour is a token**, never a literal:
     in `theme.css` for the UI, in `tiles.css` for tiles, with a dark value on `:root` and a
     light override under `:root[data-theme='light']` (or a deliberate "same in both"), and
     contrast checked in both themes. A new tile value is a token plus one rule after the
     base `.tile[data-value]` rule in `tiles.css`, with 3:1 text contrast on both ends of
     the gradient (`ai/rules/style.md`). Text inherits the font from `body`: a new number or label
     needs no `font-family` and no `tabular-nums` of its own (`base.css` sets both), and
     a number that changes during play stays put because of it.
3. Wire new objects in `main.js` only — it is the one place that queries the DOM and
   calls `new` for the object graph.
4. Put every new shared value (sizes, thresholds, timings, storage keys, targets) in
   `src/scripts/constants.js`. When CSS needs a number from JS, pass it as a CSS
   custom property set by the view that owns the element.
5. Dialogs — native `<dialog>` + `showModal()` (the top layer, inert page, `Tab` trap,
   `::backdrop`, and `cancel` on `Escape` come for free;
   `ai/decisions/2026-10-10-native-dialog.md`):
   - **Markup** in `index.html`: `<dialog class="…" aria-labelledby="…">` with a
     heading and real buttons; no `role` / `aria-modal`. The safe or primary button
     comes first and carries `autofocus`.
   - **View**: `OverlayView` owns the `<dialog>` elements `main.js` passes in.
     `show…()` calls `showModal()`, `hide…()` calls `close()`, user actions are
     `on<Action>(handler)`; no `style.display`, no manual focus. Showing a dialog
     closes the other game-end dialog first, so two are never open at once. Give a
     dialog its own view class once it has state of its own (`ConfirmDialogView`,
     `SettingsView`).
   - **`Escape`** is the `cancel` event: cancel it and run the action that fits
     (`Continue Playing`, `Cancel`), or only `preventDefault()` when there is nothing
     to dismiss into. A browser may still close a dialog by force on a repeated
     `Escape`; leave it closed and keep the controller's state valid.
   - **Focus**: the win and game-over dialogs return focus to the board on every
     close: `OverlayView.onClose` (it fires for every close) is wired in `main.js` to
     `GameController.returnFocusToBoard()`. A dialog a button opens and the player can
     dismiss (the confirmation) gives focus back to that button instead — see below.
   - **Confirmation** ("are you sure?" before something hard to undo — a new game, a
     reset, a settings change): do not write another dialog, ask the shared one.
     `ConfirmDialogView.ask({ title, message, confirmLabel, cancelLabel })` returns a
     `Promise<boolean>`, so the use case reads
     `if (!(await this.#confirm(GameController.#NEW_GAME_PROMPT))) return`, where
     `#confirm` wraps `ask()` and the focus rule.
     The wording is a private static frozen prompt next to the use case; the view only
     defaults `cancelLabel` to `Cancel`. `Cancel` has the initial focus, and `Escape`
     or a close forced by the browser answer `false` (nothing is lost). Ask only when
     there is something to lose (`game.isInProgress`), and keep an unconditional path
     (`restart()`) for buttons whose intent is already explicit (the win and game-over
     dialogs). Focus: `ask()` remembers the focused element; after a "no" the
     controller calls `restoreFocus()` (back to that element) and falls back to
     `returnFocusToBoard()` when it returns `false`; after a "yes" the use case acts and
     then calls `returnFocusToBoard()` itself. There is no `onClose` hook for it. One
     question at a time, and never stacked over another dialog: a question asked from
     the settings closes the settings first and reopens it on "no"
     (`SettingsController.requestChange`), so there is never more than one open dialog
     (`ai/decisions/2026-10-10-confirm-dialog.md`,
     `ai/decisions/2026-10-11-settings-dialog-and-storage.md`).
   - **Controller**: decides when to show which dialog and whether a pause flag is
     needed; the model only reports (`justWon`, `isOver`).
   - **CSS** (`overlays.css`): `display` only on `dialog[open]`; `margin: auto`
     (the reset's `margin: 0` beats the browser's); dimming on `dialog::backdrop`;
     `::backdrop` listed in the reduced-motion selector in `motion.css`, since `*`
     does not match it.
6. Settings — a choice the player makes once and the game keeps (board size, win target;
   `ai/decisions/2026-10-11-settings-dialog-and-storage.md`, "Settings" in `ai/map.md`). The
   dialog, the storage and the "this starts a new game" question already exist, so a setting is
   data plus a section, not a new mechanism.
   - **Where it lives**: the value and its checks in `Settings` (model), through one entry in
     `SETTING_DEFINITIONS` (`constants.js`): `name: { defaultValue, allowedValues }`. It is saved
     by `SettingsController` as one flat object `{ version, <name>: <value> }` under
     `STORAGE_KEYS.SETTINGS` through `SafeStorage`, only when a setting changes. The model
     validates field by field (a broken field falls back to its default and the others are kept),
     the controller owns the `version`. Adding a field with a default needs no version bump;
     changing what an existing field means or allows does (a migration, or a discard).
   - **A section** is markup only, inside `.settings-dialog` between the title and `Close`:
     `<section class="settings-section">` with an `<h3 id="…">` and a
     `<div role="radiogroup" aria-labelledby="…">` (the heading's id) holding one
     `<label><input type="radio" name="<setting>" value="<allowed value>"> …</label>` per choice.
     The group, not the `<section>`, carries the name, so a screen reader announces it once (a
     labelled `<section>` adds a second landmark). `SettingsView.render` checks the stored value from the model and `onChange`
     reports `(name, value)` to `SettingsController.requestChange`: nothing to wire in
     `main.js`. Another control type extends `SettingsView.render` and `onChange`. Style the
     controls with tokens only (`controls.css` / `overlays.css`). A choice among a few options is
     the `.segmented` control (the board size is the example): each option is
     `<label class="segment"><input class="visually-hidden" type="radio" …><span>…</span></label>`,
     so the inputs stay a real radio group for the keyboard and screen readers and the `<span>`
     is what is drawn; the chosen one is filled like a primary button and the focus ring is drawn
     on the `<span>` (`input:focus-visible + span`), where a hidden input has nothing to show it.
   - **The settings button is on** since the first section (Board size) exists; a new section
     needs nothing there. The UI never shows a placeholder for a section that has no issue yet.
   - **A change starts a new game** (every planned setting does): `requestChange` ignores an
     unchanged or invalid value, asks first in a game in progress (the settings closes for the
     question and reopens on "no", showing the stored value, so a refused change needs no
     revert), then saves and calls `GameController.restart()`. The game has to read the value
     where it builds the game: `GameController` takes the same `Settings` object (`main.js`
     creates one and hands it to both controllers) and reads it in `#startNewGame`;
     `settingsController.start()` runs before `controller.start()`.
   - **A setting whose choices depend on another** (the win target on the board size, the second
     worked example): its definition has `dependsOn: <name>` and an `allowedValues` map from the
     other's value to the choices, and no `defaultValue` (the middle choice). It is listed after the
     setting it depends on (fields are read in table order); `Settings` accepts only the choices in
     force (`getAllowedValues(name)`) and `set` sends it back to its default when the other value
     really changes. The markup is the `.segmented` one with as many radios as choices, but the
     radios' values and labels are filled by `SettingsView.render(values, choices)`, so
     `SettingsController.#render` passes the choices each time (on `open()` and again after a
     change, because the dialog stays open when no game is in progress).
   - **A setting that is also part of a saved game** (the board size, the win target): the save stores what the
     game was built with and the model validates it (`Game.restore`); a save that disagrees with
     the stored setting wins, because it is the game the player was in, and `GameController` sets
     the in-memory setting from it, the one others depend on first (never written:
     `SettingsController` stays the only writer;
     `ai/decisions/2026-10-12-board-size-records-and-saved-game.md`). Data kept per choice of a
     setting (the high score per size) gets a key per choice; an older single key is moved once
     on start (the larger value wins, then the old key is removed).
   - **An action inside a section** (the statistics reset): the same rule as `requestChange`:
     close the settings, ask through `ConfirmDialogView`, reopen on "no". Extract that step into
     a private method when the second caller arrives.
   - **Not here**: the high score reset (it stays by the high score,
     `ai/decisions/2026-10-11-high-score-reset-stays-in-the-header.md`) and a confirmation over
     the settings.
7. Controls: real `<button>`s with an accessible name; icon-only buttons get
   `aria-label` and `title`. Do not style focus: the generic `button:focus-visible,
a:focus-visible` rule in `base.css` gives every button and link the same ring, so keep
   hover and active styles off `outline` and never set `outline: none` on a button or a link.
   Something that is not a button but is focused from script (`tabindex="-1"`) gets
   `:focus-visible { outline: none }`.
   A link out of the page (the GitHub icon, `.github-link`) is an `<a>` with `target="_blank"`,
   `rel="noopener"` and an `aria-label` and a `title` that say it opens a new tab. It is a flex
   item of `body` with a row of its own at the top right, not a toolbar button
   (`ai/decisions/2026-10-13-footer-and-github-link.md`); the footer is the last child of
   `.game-layout`, so it is as wide as the board, and a text in it that comes from the code
   (the year) is written by a view (`FooterView`), never in the markup.
   An action that belongs in the header (the theme toggle and the settings button are the
   worked examples) is a `.toolbar-button` in the header's `.toolbar`: copy the `New Game` button,
   give it an inline SVG icon (24px, `currentColor`, `aria-hidden="true"`,
   `focusable="false"`), an `aria-label` and a `title` with the same text, and its own hook
   class for `main.js`. No CSS, unless the icon depends on a state: the theme toggle holds a
   sun and a moon and `controls.css` shows one by `data-theme`, so the right icon is there
   at the first paint without JS. At 320px three buttons fit exactly, a fourth makes the header
   5px wider than the board, a fifth overflows (`ai/map.md`).
   Icons are inline SVG, never an icon font or library (`ai/rules/style.md`). A toggle's
   label names the action (`Switch to light theme`), not the state, and it has no
   `aria-pressed`.
   A value that changes during play and that a screen-reader user needs (like the
   score) gets a live region owned by its view: a visually hidden
   `aria-live="polite" aria-atomic="true"` element, the visible value `aria-hidden`,
   and the text updated after a debounce from `constants.js`, only when it differs
   from the last announcement (`ScoreView`). Rules: `ai/rules/style.md`.
   Something that must be heard but is not the value itself (the `New record!` badge)
   rides on that announcement instead of getting a second live region: the view keeps a
   pending flag that the next `#announce` consumes, so the player hears
   `New record! <score>` once (`ai/decisions/2026-10-10-new-record-badge.md`). A fact about
   the current game that depends on the high score (whether it can still beat it) is
   controller state, not model or view state, and a restored game derives it from what is
   saved instead of storing it.
8. Animation: respect `prefers-reduced-motion`; never let an animation swallow or
   reorder player input. The global reduced-motion rule makes every animation instant;
   one the player must still see (the score pop, `+N`) gets its own override in
   `motion.css` — no movement, duration restored — as the pop does. A transient element
   a view creates (the pop) is `aria-hidden`, removes itself on `animationend`, and
   floats out of the layout (`position: absolute`, `pointer-events: none`) so it never
   shifts what is around it; a newer one replaces the one still in the air, so a burst
   of fast moves never draws numbers over one another
   (`ai/decisions/2026-10-10-score-pop.md`). A decoration that is a moment (the record badge, 4 s)
   is a `hidden`, `aria-hidden` element in the markup that the view shows by clearing
   `hidden` and hides again on `animationend`; under reduced motion it is
   static (an override with keyframes that change nothing and the duration restored), and
   it floats out of the layout so it never shifts the header or covers a button
   (`ai/decisions/2026-10-10-new-record-badge.md`). A flourish that depends on a newer
   browser API (the theme reveal, a View Transition) is a progressive enhancement:
   feature-detect it in the view, skip it under reduced motion in JS, keep the instant path
   as the base behaviour, and keep its coordinates as custom properties
   (`ai/decisions/2026-10-10-view-transitions-progressive-enhancement.md`).
   A tile animation follows the move result, not a diff of the board:
   `GridView.animateMove({ slides, merges, spawnedTiles })` moves each tile by its id
   (`--row` / `--col`, a `translate` transition only under `.is-sliding`), retires the two
   sources of a merge, creates the merged tile and the new tile, and the order (slide,
   merge pop, new tile) is CSS delays, not JS timers. A tile element never changes its
   value. The view finishes the running move at once (`getAnimations().finish()`) before
   it starts the next, so there is no input lock and no queue; `GameController` calls
   `animateMove` right after the move and shows a dialog at once, not after the
   animation (`ai/decisions/2026-10-10-tiles-over-the-grid.md`,
   `ai/decisions/2026-10-10-input-during-tile-animation.md`). A whole board is drawn with
   `render(tiles, spawnedTiles)`: a new game pops its tiles in, a restored game draws
   with no animation.
9. Verify per `ai/workflow.md`: format, build, and play the feature on desktop and at
   mobile width.

## Avoid

- Rule logic inside views or the controller; DOM access inside the model.
- Module-level state or loose functions where a class method belongs.
- A second input path that bypasses `requestMove`.
- Hand-made overlays, focus traps, or `style.display` toggling for a dialog.
- A second dialog open together with another one (a confirmation over the settings), or a
  settings section, button state or placeholder for a setting that does not exist yet.
- Settings kept outside the `settings` object (a key per setting), read by a view, or written
  on a path other than `SettingsController`; the high score reset moved into the settings.
- A second confirmation dialog, or a copy of the confirmation markup, for a new
  "are you sure?" — use `ConfirmDialogView.ask`.
- Per-button focus styles, `outline: none` on a button or a link, or a focus ring built from
  `box-shadow`.
- An icon font, an icon library, or an image file for an icon; a placeholder button for
  a feature that does not exist yet; an icon-only button without an `aria-label` and a
  `title`.
- `aria-live` on text that changes with every move with no debounce, `assertive` live
  regions, or a live region on the high score.
- A decorative `+N` inside the live region or inside the visible score, one without
  `aria-hidden`, or a pop that moves the header.
- A second live region for the record, a badge that is not `aria-hidden`, a badge that
  stays for the whole game, or a "has beaten the record" flag in the model or in the saved
  game.
- A colour literal (hex, `rgb()`, a named colour) anywhere in `src/styles/` outside
  `theme.css` and `tiles.css`, or in JS; a second place that decides the theme (a
  `prefers-color-scheme` block in the stylesheets); a state-only toggle label such as
  `Dark theme`.
- A `:not()` chain that lists every value with a rule to build a fallback, or tile
  colours written as literals inside the per-value rules.
- A `font-family` or `font-variant-numeric` on an element, or a font loaded from a
  CDN or any third-party host (the font is self-hosted in `src/fonts/`).
- Base classes, factories, or other abstractions for a single implementation.
- Reading `localStorage` directly instead of through `SafeStorage`. The one exception is the
  inline theme script in the `<head>` of `index.html` (it runs before any module); do not
  copy it for anything else.
- A tile animation that diffs the old and new board values, a tile element whose
  `data-value` changes, a `transform` for a tile's position, a standing `transition` on
  `.tile`, a pixel position written by JS, or JS timers that order the steps of a move.
- An input lock, a cooldown, or a queue of moves for the sake of an animation.
- Features listed in `ai/decisions/2026-10-10-rejected-features.md`.
