# The settings dialog is built before its first section; one dialog at a time; one `settings` object

Date: 2026-10-11 · Status: accepted · partly superseded by `2026-10-14-settings-reopen-after-a-question.md` (the reopening after an answer, and the focus)

## Context

Board size (MY-128), the win target (MY-129) and statistics (MY-130) are settings and need one
place (MY-127). The issue asked for a dialog with sections, stored settings and a confirmation
before a change that needs a new game, and said no empty placeholders should show in the UI. Four
choices had an obvious alternative: when the button shows up, how a question asked from inside the
dialog coexists with the dialog, how the settings are stored and checked, and where focus goes.

## Decision

- **The dialog is built, the button is hidden until a section exists.** The dialog, its view, the
  stored settings and the "this starts a new game" flow ship with MY-127 and are checked there with
  a throwaway section; the toolbar button is in the markup with `hidden`, so the page is exactly as
  before. **MY-128 turns it on by removing `hidden`**, together with the first section. The author
  chose this over a visible button and an empty dialog. It is a narrow exception to "no empty,
  disabled, or hidden slot" in `2026-10-10-header-toolbar.md`: that rule was about a stub for a
  feature that does not exist, and here the feature exists and only its first section is missing.
  Rejected: adding the button later from the toolbar recipe (`main.js` would wire a button that may
  not exist), and code that hides the button while the dialog has no `.settings-section` (kept for
  ever for a state that lasts one issue).
- **One dialog at a time.** A question asked from the settings never stacks over it: the settings
  closes, `ConfirmDialogView.ask()` opens, and on "no" the settings opens again, rendered from the
  stored values, so a refused change needs no revert. This settles what
  `2026-10-10-native-dialog.md` and `2026-10-10-confirm-dialog.md` left to this issue.
  Rejected: a native stack (it works, and focus would return to the control, but there would be two
  `dialog[open]`, two backdrops, and the settings would still have to close before the board can take
  focus after a "yes"); a second panel inside the settings (every confirmation goes through the shared
  dialog). The price: the settings pops in again after a "no", with focus on `Close`.
- **One flat object under one key.** `settings` (`STORAGE_KEYS.SETTINGS`) holds
  `{ version, <name>: <value>, … }`, `SETTINGS_VERSION` is `1`. Written through `SafeStorage` only
  when a setting changes, never at start. The layers follow the saved game
  (`2026-10-10-saved-game-format.md`): `Settings` (model) validates, `SettingsController` owns the
  `version` and when to read and write, `SafeStorage` only moves JSON.
- **Each setting is one entry in `SETTING_DEFINITIONS`** (`constants.js`): `{ defaultValue,
allowedValues }`. A value is accepted when it is, or reads as, an allowed one (the form hands over
  strings), and a missing or unknown field is the default.
- **Field by field, not all or nothing.** Unlike the saved game, a broken field costs only itself: the
  settings are independent choices, and a bad win target must not cost the player their board size.
  Another version, a non-object or unreadable JSON gives every default. Fields are read in the order of
  the table, so a later one may depend on an earlier one (MY-129's targets depend on the size; that rule
  is a method of `Settings`).
- **A change starts a new game, and only a game in progress is asked about.** `requestChange` ignores an
  unchanged or invalid value, asks in a game in progress (`game.isInProgress`, the same fact as the
  `New Game` button), then saves and calls `GameController.restart()`. No `requiresNewGame` flag: every
  planned setting does it, and a setting that does not adds the flag then.
- **Focus.** `Close` and `Escape` close the dialog and focus the settings button (the dialog was opened
  by a button the player can dismiss, as in `2026-10-10-confirm-dialog.md`); the view has no `close`
  listener, because a late `close` event of a programmatic close would take focus from the board after a
  "yes". `Close` has the initial focus (`autofocus`, the safe button).
- **Construction.** `SettingsController` takes `GameController` and `ConfirmDialogView`;
  `GameController` does not know the settings until a setting needs it (MY-128). `main.js` calls
  `settingsController.start()` before `controller.start()` so the settings are known before the first game.

## Consequences

- MY-128 / MY-129 / MY-130 add a table entry, a section and (the first one) remove `hidden`; the steps are in
  `ai/skills/feature.md` ("Settings") and `ai/map.md`. An action inside a section (the statistics reset)
  closes the settings, asks and reopens it on "no", as `requestChange` does.
- A forgotten `hidden` removal leaves the dialog unreachable, not broken; the checklists name the step.
- Checked in headless Chrome 154 with a throwaway `boardSize` section (not committed): mouse, keyboard
  (`Tab`, `Enter`, `Space`, `Escape`, focus return), touch at 375px and 320px, both themes, reduced motion,
  corrupted and blocked storage, and the question in a game in progress (cancel changes nothing, never two
  open dialogs). Not checked: Safari, Firefox, a real screen reader.
- The size budget: CSS 3.68 kB of 4 and JS 6.36 kB of 8 after this issue. The issue that crosses the CSS limit
  raises it to 5 kB (the author agreed in principle, 2026-10-11) with its own record.
- Rejected: the high score reset in the settings (`2026-10-11-high-score-reset-stays-in-the-header.md`), a
  settings hotkey (`2026-10-10-rejected-features.md`), a key per setting, a settings object the views read.
- Refined by `2026-10-12-board-size-records-and-saved-game.md` (MY-128): the settings button is on and the
  `GameController` takes the shared `Settings` model to read the board size, as this record said it would.
  CSS ended at 3.87 kB of 4 after MY-128, so the 5 kB limit is still waiting for the issue that crosses it.
- Refined by `2026-10-13-win-target-per-board-size.md` (MY-129): the win target is the dependent setting this record planned, as data (`dependsOn` in the definition) rather than a hard-coded method; `SETTINGS_VERSION` stays 1. CSS stayed at 3.87 kB of 4.
- Refined by `2026-10-13-statistics.md` (MY-130): the statistics reset is the action inside a section this record predicted, and the close-ask-reopen step is now one private method, `SettingsController.#askFromSettings`, that `requestChange` shares. The Statistics section is not a setting (no entry in `SETTING_DEFINITIONS`, no key in `settings`). CSS ended at 4.07 kB of the new 5 kB limit.
