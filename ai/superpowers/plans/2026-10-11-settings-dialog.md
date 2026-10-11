# MY-127 — Settings dialog: the skeleton for modes, goal and statistics

Issue: MY-127 · Branch: `my-127-settings-dialog` · Spec: `ai/superpowers/specs/2026-10-11-settings-dialog.md`

Blockers MY-114 (native `<dialog>`) and MY-120 (header toolbar) are `Done` and in the
branch base; related MY-115 (the confirmation) and MY-117 (the high score reset) are `Done`
too. MY-128 (board size), MY-129 (win target) and MY-130 (statistics) build on this issue.

## Author's answers (2026-10-11)

The issue asked to decide some things in the plan. The author answered them up front:

1. **The high score reset stays next to the high score**, as built in MY-117. It is not
   duplicated in the settings. This goes into a decision record (section 9).
2. **No empty settings dialog in the UI.** This issue builds the settings dialog, the
   settings storage and model, the "this change needs a new game" confirmation flow and the
   extension points, but the settings button in the toolbar is **not shown** until the first
   section exists. MY-128 adds the "Board size" section and turns the button on. This issue
   is checked in a browser with a temporary section and button that are **not committed**;
   the exact steps for MY-128 are written down (section 7, `ai/skills/feature.md`,
   `ai/map.md`).
3. **Raising the CSS limit to 5 kB gzip is approved if this issue needs it**, with a short
   decision record; otherwise the issue that crosses 4 kB raises it. This issue does not
   need it (section 6), so the limit is left alone.

Context for later issues (not built here, but the model has to stay easy to extend):

- **MY-129** has a set of win targets per board size (3x3: 256 / 512 / 1024, 4x4: 1024 /
  2048 / 4096, 5x5: 2048 / 4096 / 8192) and switches to the middle one when the size changes.
  So one setting's allowed values depend on another one (section 3).
- **MY-130** statistics are shared by all sizes.

## Decision records checked

None is contradicted; two are narrowed on purpose, both written down in section 9.

- `2026-10-10-native-dialog.md` — the settings is a native `<dialog>` opened with
  `showModal()`, `autofocus` on the safe button, `Escape` through `cancel`. The record left
  "a confirmation over the settings dialog" to this issue: decided **against** a stack
  (section 1.2).
- `2026-10-10-confirm-dialog.md` — the settings asks through `ConfirmDialogView.ask()` with
  its own wording; the view, its markup and its styles are untouched. "One question at a
  time" holds.
- `2026-10-10-header-toolbar.md` — "no empty, disabled, or hidden slot for a feature that
  does not exist yet". The button is hidden here, by the author's decision, because the
  feature (the dialog) exists and is checked, and only its first section is missing. A
  narrow exception, recorded (section 1.1).
- `2026-10-10-saved-game-format.md` — untouched. The settings are a second, separate key;
  how the game reads them (and the saved game's `size` / `winTile`) is MY-128 / MY-129.
- `2026-10-10-theme-tokens-and-head-script.md` — no new colour; the dialog re-uses the
  confirmation's tokens. The head script is not a precedent and no other storage is read
  early.
- `2026-10-10-rejected-features.md` — nothing from the list (no hotkey, no share, no undo).

Everything below that is not in the author's answers is my choice and is final unless the
author objects at review.

## 1. Decisions

### 1.1 The dialog is built, the button is hidden until a section exists

The toolbar button is in `index.html` with the `hidden` attribute, wired in `main.js` and
owned by `SettingsView` like the theme toggle is owned by `ThemeView`. A hidden element
takes no room, is not focusable and is not in the accessibility tree, so the page is exactly
as before. MY-128 removes `hidden`: that is the whole switch.

| Option                                                                | Verdict                                                                                                                                                           |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button in the markup, `hidden`                                        | **Chosen.** One attribute to remove, no branching in `main.js`, the view always has its button; the issue is verified with the real code and a throwaway section. |
| No button in the markup; MY-128 adds it from the toolbar recipe       | Rejected. `main.js` would have to wire a button that may not exist, or `SettingsView` take it as optional.                                                        |
| The view hides the button while the dialog has no `.settings-section` | Rejected. Code whose only job is a transitional state, kept for ever; the checklist in the docs does the same for free.                                           |
| A visible button with an empty dialog                                 | Rejected by the author.                                                                                                                                           |

### 1.2 One dialog at a time: the settings closes while a question is asked

A question asked from the settings (the "new game" one) never stacks over it. The settings
closes, the confirmation opens, and on "no" the settings opens again.

| Option                                                   | Verdict                                                                                                                                                                                                                                                                                                                      |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Close the settings, ask, reopen on "no"**              | **Chosen.** Keeps the rule "never two `dialog[open]`" (the `review` skill checks it). `ConfirmDialogView` and `GameController` need nothing. Reopening re-renders the controls from the stored settings, so a refused change needs no "revert the radio" code. A "yes" finds no dialog in the way of `returnFocusToBoard()`. |
| A native stack (the confirmation over the settings)      | Works in the platform (the lower dialog is inert) and focus would return to the control on "no", but there would be two `dialog[open]`, two dimmed backdrops, and after "yes" the settings would still have to be closed before the board can take focus. Needs an exception to the native-dialog record.                    |
| The question inside the settings dialog (a second panel) | Rejected by `2026-10-10-confirm-dialog.md`: every confirmation goes through the shared dialog.                                                                                                                                                                                                                               |

The price: the settings pops in again after a "no", and focus lands on its `Close` button,
not on the control that was used (the `autofocus`).

### 1.3 Closing and focus: the opener gets focus back, no `close` listener

`Close` and `Escape` (`cancel`, cancelled and handled) both close the dialog and focus the
settings button: the dialog is opened by a button the player can dismiss, so focus goes back
to it (`2026-10-10-confirm-dialog.md`). The view listens to no `close` event: a late `close`
event of a programmatic close would take focus away from the board after a "yes". A close
forced by the browser (a repeated `Escape`) is accepted as in `2026-10-10-native-dialog.md`;
the platform restores focus itself there.

### 1.4 Only the changes of a setting ask; there is no `requiresNewGame` flag

Every setting planned (board size, win target) starts a new game, so `requestChange` always
treats a change as one. A setting that does not would add a flag to its definition then; a
flag no setting uses is not built now.

### 1.5 The high score reset stays where it is

See the author's answer 1 and the decision record in section 9. It does not enter the
settings; MY-130's statistics reset will, because its numbers live there.

### 1.6 Settings validate field by field, and tolerate a string for a number

`Settings.restore` keeps every valid field and defaults only the broken ones, unlike the saved
game (all or nothing): the settings are independent choices, and a bad `winTarget` must not
cost the player their board size. An allowed value is accepted when it is, or reads as, one of
the allowed values (`'5'` for `5`), because the form gives strings and because a stored `'4'`
is harmless; the next save writes the typed value.

## 2. Where each part lives (`ai/rules/oop.md`)

| Layer / file                                           | Change                                                                                                                                                                                    |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/scripts/constants.js`                             | `STORAGE_KEYS.SETTINGS`, `SETTINGS_VERSION`, `SETTING_DEFINITIONS` (an empty frozen table; one entry per setting).                                                                        |
| `src/scripts/game/Settings.js`                         | **New, model.** The values, their validation and defaults. No DOM, storage or timers (section 3).                                                                                         |
| `src/scripts/ui/SettingsView.js`                       | **New, view.** Owns the dialog, the toolbar button and the `Close` button; `open()`, `close()`, `render(values)`, `onOpen(handler)`, `onChange(handler)` (section 4).                     |
| `src/scripts/SettingsController.js`                    | **New, controller.** Loads and saves the settings, opens the dialog, applies a change and asks before it ends a game (section 5). Depends on `GameController` and `ConfirmDialogView`.    |
| `src/scripts/GameController.js`                        | A getter `isInProgress` (the settings asks it). Nothing else: it does not know about settings until MY-128.                                                                               |
| `src/scripts/main.js`                                  | Looks up the dialog elements, creates the three objects, wires `onOpen` / `onChange`, and calls `settingsController.start()` **before** `controller.start()`.                             |
| `src/index.html`                                       | The hidden toolbar button with a gear icon after the theme toggle, and the `<dialog class="settings-dialog">` after the confirmation (title, `Close`; no section).                        |
| `src/styles/overlays.css`, `controls.css`, `theme.css` | The settings dialog joins the shared card, `[open]` and button rules and the confirmation's light-theme tokens; the section skeleton (section 6). No new colour, nothing in `motion.css`. |
| Storage, input                                         | Unchanged. `SafeStorage` is used as is; `KeyboardInput` already skips keys from `dialog[open]`.                                                                                           |

The model validates, the controller owns the `version` envelope and when to read and write,
`SafeStorage` only reads and writes JSON: the same split as the saved game
(`2026-10-10-saved-game-format.md`).

## 3. The settings model and the stored format

```js
// constants.js
export const SETTINGS_VERSION = 1
// name -> { defaultValue, allowedValues }. MY-128 adds boardSize, MY-129 winTarget.
export const SETTING_DEFINITIONS = Object.freeze({})
```

```js
// game/Settings.js
export class Settings {
  get(name)                 // the current value (the default until set or restored)
  isChange(name, value)     // true when value is allowed and differs from the current one
  set(name, value)          // true and stored when allowed, else false and nothing changes
  toState()                 // a copy: { <name>: <value>, ... }
  restore(state)            // defaults first, then every valid field of state; never throws
}
```

- Stored as one flat JSON object under `settings`: `{ version: 1, boardSize: 4, ... }`.
  The controller adds `version` when it saves and checks it when it loads (another version:
  every default). The model never sees the version.
- `restore(state)` accepts `null`, a number, an array, anything: it starts from the defaults
  and takes only fields that pass `set`. Unknown fields are ignored (and dropped on the
  next save). Fields are read in the order of `SETTING_DEFINITIONS`, so a later one may
  depend on an earlier one: MY-129's `winTarget` is checked against the board size restored
  just before it (the per-size target set), and `Settings.set` of the size adjusts the target
  to the middle one; both are methods of this class, not a table. Not built now.
- Nothing is written until a setting changes, so a player who never opens the dialog has no
  `settings` key. A read of a missing or broken key gives the defaults and writes nothing.
- Adding a field with a default to version 1 is compatible (a stored object without it reads
  as the default). `SETTINGS_VERSION` goes up only when a field's meaning or its allowed
  values change in a way an old object cannot be read.

## 4. `SettingsView` and the markup

```html
<!-- in .toolbar, after .theme-toggle -->
<button
  class="toolbar-button settings-button"
  aria-label="Settings"
  title="Settings"
  hidden
>
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <!-- a gear drawn by hand -->
  </svg>
</button>

<!-- after the confirmation dialog -->
<dialog class="settings-dialog" aria-labelledby="settings-title">
  <h2 id="settings-title">Settings</h2>
  <button class="settings-close-button" autofocus>Close</button>
</dialog>
```

A section, added by its own issue, goes between the title and `Close`:

```html
<section class="settings-section" aria-labelledby="settings-board-size-title">
  <h3 id="settings-board-size-title">Board size</h3>
  <label><input type="radio" name="boardSize" value="3" /> 3x3</label>
  ...
</section>
```

```js
export class SettingsView {
  constructor({ dialog, openButton, closeButton })
  onOpen(handler)        // the settings button
  onChange(handler)      // handler(name, value): a `change` event of a named input in the dialog
  render(values)         // checks the radio whose name and value match; unknown names are skipped
  open()                 // showModal()
  close()                // close()
}
```

- `render(values)` walks the named inputs of the dialog (`input[name]`), so a new section is
  markup only. It supports radio buttons; another control type extends `render` and
  `onChange` when a section needs one.
- `onChange` is one delegated `change` listener on the dialog, so sections need no wiring.
- `Close` and `cancel` (`Escape`) go through one private `#dismiss()`: close the dialog and
  focus the settings button (section 1.3). `cancel` is cancelled, then handled, as
  `OverlayView` does for the win dialog.
- No `style.display`, no manual focus trap, no `role` / `aria-modal`; the view calls
  `showModal()` only for its own dialog.
- The gear is drawn by hand (a toothed outline and a hub), not copied from an icon library,
  and must not look like the theme toggle's sun next to it.

## 5. `SettingsController`

```js
static #CHANGE_PROMPT = Object.freeze({
  title: 'Start a new game?',
  message: 'Changing this setting starts a new game. Your current progress will be lost.',
  confirmLabel: 'New Game',
})

start()   // read STORAGE_KEYS.SETTINGS; version === SETTINGS_VERSION -> settings.restore(saved)
open()    // view.render(settings.toState()); view.open()

async requestChange(name, value) {
  if (!this.#settings.isChange(name, value)) {
    this.#view.render(this.#settings.toState())   // an invalid value: show the stored one again
    return
  }

  const isAsked = this.#gameController.isInProgress

  if (isAsked) {
    this.#view.close()                            // one dialog at a time
    if (!(await this.#confirmDialogView.ask(SettingsController.#CHANGE_PROMPT))) {
      this.open()                                 // "no": back to the settings, old value shown
      return
    }
  }

  this.#settings.set(name, value)
  this.#storage.setJson(STORAGE_KEYS.SETTINGS, { version: SETTINGS_VERSION, ...this.#settings.toState() })
  this.#gameController.restart()
  if (isAsked) this.#gameController.returnFocusToBoard()
}
```

- A "no" needs no `restoreFocus()`: the reopened settings takes focus (`autofocus`). A "yes"
  finds the settings already closed, so the board can take focus.
- With no question the dialog stays open and the new game starts behind it; focus stays on
  the control.
- `restart()` is today's unconditional new game. MY-128 makes it build the game from the
  setting (section 7).
- The wording is a private static frozen prompt next to the use case, like the controller's
  other prompts (`2026-10-10-confirm-dialog.md`), and nothing about it is shared.
- `main.js` calls `settingsController.start()` before `controller.start()`, so the settings
  are known before the first game is drawn. All objects are created first (the settings
  controller takes the game controller; the game controller does not know the settings), so
  there is no construction cycle.

## 6. Styles and the CSS budget

- `overlays.css`: `.settings-dialog` joins the shared selectors (card, `[open]` flex layout and
  animation, heading, paragraph, mobile padding) and gets the confirmation's background and
  shadow; `width: 360px` (max 90vw by the shared rule). The section skeleton: `.settings-section`
  (full width, left-aligned, spaced) and its `h3`.
- `controls.css`: `.settings-close-button` joins the primary (filled) button rules.
- `theme.css`: `.settings-dialog` joins the confirmation's light-theme token block, so it is a
  light card in the light theme. No new colour, no `prefers-color-scheme` block.
- The settings button needs no CSS (`.toolbar-button`). `motion.css` needs nothing: the dialog
  reuses `modal-pop` and the shared `::backdrop` animation, both already covered.
- **Budget.** Baseline `yarn size`: CSS 3.60 kB of 4 (3,597 bytes), JS 5.72 kB of 8. The skeleton
  is about 300 bytes of CSS (about 100 gzipped), so CSS stays near 3.7 kB and JS near 6.5 kB:
  **the limit is not raised here** (author's answer 3). It will not hold for the next three:
  the board size selector and the fitting of 5x5 (MY-128), the target selector (MY-129) and
  the statistics block (MY-130) are estimated at 1 kB together. The issue that crosses 4 kB
  raises `.size-limit.json` to 5 kB with a short decision record. The measured numbers go
  into the report and, if reality differs, into this section.

## 7. How MY-128 / MY-129 / MY-130 plug in

Switching the settings button on and adding the first section (MY-128, "Board size"):

1. `constants.js`: add the definition to `SETTING_DEFINITIONS`:
   `boardSize: { defaultValue: 4, allowedValues: [3, 4, 5] }`. No version bump (a new field
   with a default).
2. `index.html`: add a `<section class="settings-section">` with a heading and
   `<input type="radio" name="boardSize" value="3|4|5">` inside `.settings-dialog`, between the
   title and `Close`. No JavaScript: `SettingsView.render` checks the radio from the model and
   the `change` event reaches `SettingsController.requestChange`.
3. `index.html`: **remove `hidden` from `.settings-button`.** That turns the button on.
4. CSS for the section's controls (tokens only; the section skeleton is already there).
5. Make the game read the setting: `settings.get('boardSize')` where the game and the grid are
   built. `settingsController.start()` already runs before `controller.start()`, and
   `requestChange` already ends in `gameController.restart()` after the confirmation; MY-128
   makes that restart build the new size. (The per-size high score, the saved game's `size`
   and its version, and the fit of 5x5 at 320px are MY-128's.)
6. Docs: `ai/map.md` and `ai/skills/feature.md` (the settings paragraph), a decision record for
   what MY-128 decides.

MY-129 adds `winTarget` the same way (steps 1, 2, 4, 5), with the per-size sets and the
"middle one on a size change" rule inside `Settings`. MY-130 adds a read-only section (numbers
and a reset button that asks through `ConfirmDialogView`: the reset closes the settings,
asks and reopens it on "no", exactly as `requestChange` does, so extract the shared
"close, ask, reopen" step into a private method when the second caller arrives).

## 8. Commits

1. `docs: add spec and plan for MY-127 settings dialog` — these two files.
2. `feat: add the settings model` — `SETTING_DEFINITIONS`, `SETTINGS_VERSION`,
   `STORAGE_KEYS.SETTINGS`, `Settings`. Nothing uses it yet.
3. `feat: add the settings dialog, hidden until the first section` — markup, `SettingsView`,
   styles. Nothing opens it yet and the button is hidden, so the page behaves as before.
4. `feat: load, save and apply settings and ask before a new game` — `SettingsController`,
   `GameController.isInProgress`, `main.js` wiring.
5. `docs: document the settings dialog and how to add a setting` — section 9.
6. `docs: record what building MY-127 found in its plan` — only if reality diverges.

## 9. Docs and decisions

- `ai/decisions/2026-10-11-high-score-reset-stays-in-the-header.md`: the reset stays next to the
  high score. Why: a reset is a one-off action on a value that is on the screen, and a setting
  is a choice that persists and shapes the game; moving it would put a rare, destructive action
  two taps away from the number it changes and fill the dialog with the only thing it can show
  today; MY-128's per-size record is the one shown in that box, so "reset the current size's
  record" stays obvious; MY-117's button is already built, accessible and tested. The statistics
  reset (MY-130) is the one that belongs in the settings. Rejected: moving it, and copying it.
- `ai/decisions/2026-10-11-settings-dialog-and-storage.md`: the dialog is built before its first
  section and the button is hidden until it exists (a narrow exception to "no hidden slot" in
  `2026-10-10-header-toolbar.md`); one dialog at a time (the settings closes while the question
  is asked and reopens on "no"; rejected: a stack, a second panel); the `settings` key and its
  format, validation field by field, written on change only; the controller owns the version,
  the model validates; no `requiresNewGame` flag; the focus rule. Both records go into
  `ai/decisions/README.md`.
- `ai/map.md`: the `index.html` row (the settings dialog, the hidden button), "Adding a toolbar
  button" and the header text (the settings button exists, hidden), the scripts table
  (`Settings`, `SettingsView`, `SettingsController`, `main.js`, `constants.js`,
  `GameController.isInProgress`), the styles rows, the storage table (`SETTINGS`).
- `ai/skills/feature.md`: a new "Settings" step, "how to add a setting and a section" (section 7
  as a checklist), the dialog recipe gets the rule for a question asked from a dialog, and the
  toolbar paragraph now says the settings button is built and hidden.
- `ai/rules/architecture.md`: the three classes in the file responsibilities.
- `ai/skills/review.md`: the Dialogs bullet: a question from the settings closes it first.
- `README.md`: the structure listing (the new files). No feature line: nothing visible changes.
- No decision record for the CSS limit, because it is not raised.

## 10. Verification

`yarn lint`, `yarn format:check`, `yarn build`, `yarn size` (baseline CSS 3.60 kB / 4, JS 5.72 kB / 8).

The settings button is hidden in the committed code, so the dialog is checked with a
**temporary patch that is never committed** (kept outside the repo, applied for the checks and
reverted afterwards; `git status` is checked clean of it before the final commit). It is also the
dry run of section 7: it follows steps 1 to 3 literally.

- The patch adds one definition (`boardSize`, 3 / 4 / 5, default 4), a section with three radio
  buttons, and removes `hidden` from the button. The game does not read the setting: a change
  only restarts the game, which is all the flow needs.

Checks, in headless Chrome over the DevTools Protocol (real key events and touch events,
`Emulation.setEmulatedMedia` for the colour scheme and reduced motion), desktop 1000px and
375px / 320px, both themes. `document.querySelectorAll('dialog[open]').length` is read in every
scenario (never above 1).

- Committed code, no patch: the page looks and behaves as before, the button is not in the
  accessibility tree and not in the tab order, no `settings` key is written, no console error.
- Open: mouse, keyboard (`Tab` to the settings button, `Enter` and `Space`), `Close` has focus;
  `Tab` and `Shift+Tab` stay inside; `Escape` and `Close` give focus back to the settings button;
  arrows and WASD do not move the board while it is open and move between the radio buttons.
- Toolbar: three buttons at 320px, 375px and 1000px, no sideways scroll, header as wide as the
  board; the button has a visible focus ring in both themes.
- Dialog: dark and light theme, 1000px and 320px (screenshots), the card fits at 320px,
  contrast of its text and of the `Close` button in both themes (the confirmation's tokens).
- A change on a fresh game: saved, new game behind the dialog, dialog stays open.
- A change in a game in progress: the settings closes, the confirmation opens with `Cancel`
  focused; `Cancel`, `Escape` and `Enter` on the initial focus give "no": nothing saved, board,
  score and `savedGame` equal to before, the settings is open again with the old value; `New
Game`: saved, new game, focus on the board, arrows move at once. Never two open dialogs.
- Changing to the already selected value does nothing. A reload after a change keeps the setting
  and a game restored from the save is not touched by the question.
- Storage: no key; `not json`; `null`; `[]`; `{"version":99,"boardSize":5}`; `{"version":1,
"boardSize":"huge"}`; `{"version":1,"boardSize":"5"}` (a string that reads as an allowed value);
  `{"version":1,"boardSize":5,"extra":1}`: defaults or the valid fields, no console error. Blocked
  storage (a throwing `localStorage`): the game still starts.
- Reduced motion: the dialog's and the backdrop's animations are off (computed styles).
- Before the final commit: the patch is reverted, the build is rebuilt, and the sizes in the
  report are the committed ones.

## 11. Out of scope

Any section or setting and everything MY-128 / MY-129 / MY-130 own (the board size, the win
target, statistics, the per-size high score, the saved game's `size` and `winTile`, a game that
reads a setting); showing the settings button; the high score reset (it stays); a stacked
confirmation; raising the CSS limit; automated tests.
