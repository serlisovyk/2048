# MY-127 — Settings dialog: the skeleton for modes, goal and statistics (spec)

Issue: MY-127 · Branch: `my-127-settings-dialog` · Plan: `ai/superpowers/plans/2026-10-11-settings-dialog.md`

## Goal

Board size, the win target and statistics are settings, and they need one place instead of
a row of buttons on the main screen. This issue builds that place and everything the three
follow-up issues share, and nothing they own:

- **MY-128** — board size (the first section; turns the toolbar button on),
- **MY-129** — win target,
- **MY-130** — statistics.

No settings section exists yet, and the author does not want an empty dialog in the UI
(the issue: a section appears together with its own task). So the dialog, the stored
settings and the "this change needs a new game" flow are built and checked here, and the
settings button in the header stays hidden until the first section lands.

## What the player sees after this issue

**Nothing new.** The header, the board, the dialogs and the high score reset look and
behave exactly as before. The settings button is in the markup, hidden, so it takes no room
and cannot be reached. The rest of this spec is the contract that MY-128 switches on by
adding one section and removing one `hidden` attribute (plan, section 7).

## The settings button

- A `.toolbar-button` after the theme toggle: an inline SVG gear, `aria-label="Settings"`
  and `title="Settings"`, `hidden` until the first section exists.
- Shown, the toolbar holds three 44px buttons (new game, theme, settings). At 320px that
  leaves 57px between the logo and the toolbar and the header is as wide as the board
  (296px, no sideways scroll); at 375px and 1000px there is more room (measured).

## The dialog (once the button is shown)

A native modal `<dialog class="settings-dialog">` (`ai/decisions/2026-10-10-native-dialog.md`):
a title (`Settings`), one `<section>` per setting with its own heading, and a `Close`
button. The page behind is dimmed and inert, `Tab` / `Shift+Tab` stay inside it, a click on
the dimmed area does nothing.

| Action                               | Result                                                            |
| ------------------------------------ | ----------------------------------------------------------------- |
| Press the settings button            | The dialog opens; `Close` has the initial focus (the safe button) |
| `Close`, `Escape`                    | The dialog closes; focus goes back to the settings button         |
| A close forced by the browser        | The dialog stays closed (accepted, as for the other dialogs)      |
| Arrows / WASD while the dialog is up | Do not move the board; arrows still move between radio buttons    |

- The dialog is the neutral card, like the confirmation: dark in the dark theme, a light card
  in the light theme, with the confirmation's tokens. No new colour.
- It pops in with the shared `modal-pop` animation; reduced motion turns it off (and the
  backdrop's), nothing new in `motion.css`.
- The card is 360px wide, at most 90% of the window, so it fits from 320px up; the content
  wraps and nothing scrolls sideways.
- A section is a heading and the controls of one setting (radio buttons named after the
  setting). Each section appears with its own issue; none is shipped here.

## Changing a setting

All settings planned so far (board size, win target) start a new game. The change is applied
the moment a control is used, with one question to protect a game in progress:

| State when a control is used                            | Result                                                                                                                                                           |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The already selected value, or an invalid one           | Nothing changes; the controls show the stored value                                                                                                              |
| A fresh game (no move made), or a finished game         | The setting is saved and a new game starts behind the dialog; the dialog stays open                                                                              |
| A game in progress (at least one move, not over)        | The settings dialog **closes**, and the confirmation opens: `Start a new game?` / `Changing this setting starts a new game. Your current progress will be lost.` |
| ...and the answer is `New Game`                         | The setting is saved, a new game starts, focus goes to the board                                                                                                 |
| ...and the answer is `Cancel`, `Escape`, a forced close | Nothing is saved, the game and its score are as before, the settings dialog **opens again** showing the old value                                                |

- **One dialog at a time.** A question asked from the settings never stacks over it: the
  settings closes first and comes back on "no". `document.querySelectorAll('dialog[open]')`
  is never longer than 1.
- `Cancel` has the initial focus in the confirmation, as everywhere (`ai/decisions/2026-10-10-confirm-dialog.md`).
- "In progress" is the same fact the `New Game` button asks about.

## Stored settings

One key, `settings` (`STORAGE_KEYS.SETTINGS`), holds JSON: `{ version, <name>: <value>, … }`
(flat). `SETTINGS_VERSION` is `1`. Nothing is written until a setting changes, so a player
who never uses the dialog has no `settings` key.

| Stored data                                                | Result at start                                                               |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Missing key, blocked storage, not JSON                     | Every setting has its default; no error                                       |
| A JSON value that is not an object, or another version     | Every setting has its default                                                 |
| A field missing, unknown, or not one of the allowed values | That setting has its default; the others are kept; unknown fields are dropped |
| A valid object                                             | Its values                                                                    |

- The settings are read once at start, before the game starts, and written after every
  accepted change through `SafeStorage` (a failed write never stops the game).
- Each setting has a default and a list of allowed values, in one table in `constants.js`.
  The table is empty today; MY-128 adds `boardSize` and MY-129 `winTarget`.
- The saved game, the high score and the theme keep their own keys and formats.

## Unchanged

- The header, the score, the high score and **its reset button**: the reset stays next to
  the high score where MY-117 put it (the author's decision, 2026-10-11); it is not copied
  into the settings.
- `New Game`, the win and game-over dialogs, `ConfirmDialogView` and `OverlayView`, the
  saved-game format and `SAVED_GAME_VERSION`, the movement guard, the theme.
- The CSS size limit (4 kB gzip): the skeleton fits (plan, section 6).

## Out of scope

- Any section and any setting (MY-128 board size, MY-129 win target, MY-130 statistics),
  including making the game read a setting and the per-size high score.
- Showing the settings button.
- A confirmation stacked over the settings dialog (decided against), a "reset to defaults"
  button, import / export of settings, light dismiss, a settings hotkey (rejected:
  `ai/decisions/2026-10-10-rejected-features.md`).
