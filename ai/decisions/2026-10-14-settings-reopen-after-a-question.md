# The settings reopen after their questions, with focus on what the player used, and open on the first group

Date: 2026-10-14 · Status: accepted

## Context

A question asked from the settings closes them (`2026-10-11-settings-dialog-and-storage.md`). They came back only on
"no", focused on `Close` (`autofocus`, the last element), and on "yes" the player landed on the board: the same size
change ended in the settings on a fresh board and on the board mid-game, and so did the statistics reset. `Close` as
the first focus also scrolled the dialog to its bottom on a short screen, and `justify-content: center` clipped its
title there (an overflow goes both ways, and what is above the top cannot be scrolled to).

## Decision

- **Both answers reopen the settings.** `SettingsController` closes them, asks, applies the change or the reset on
  "yes", and calls `open()` either way. A change on a fresh board is untouched: no question, the dialog stays open.
  The settings never focus the board.
- **Focus goes to what was used.** After a change: the checked option of the changed group (the saved value after a
  "no", the new one after a "yes"), `SettingsView.focusSetting(name)`. After a refused statistics reset: the
  `Reset statistics` button; after a confirmed one the button is hidden (all zeros) and the first group has the focus.
- **The first focus on opening is the checked option of the first group**, set by `SettingsView.open()`, which also
  sets `scrollTop` to 0 (a closed dialog keeps its scroll position). `Close` has no `autofocus`: the settings are the
  one dialog that does not open on its safe button.
- **No `justify-content: center` on the dialog**: the content starts at the top and scrolls.
- **One line above the sections** says that a change starts a new game; it is the dialog's `aria-describedby`.

## Consequences

- `#askFromSettings` only closes and asks; the caller reopens. A new action inside a section has the same shape.
- Rejected: `autofocus` on an option (it cannot know which of the three is checked), a confirmation stacked over the
  settings (never two dialogs), reopening only after "yes", `scrollTop = 0` alone (the clipped title stayed unreachable).
- The page's own questions keep `2026-10-10-confirm-dialog.md`: back to the opener on "no", to the board on "yes".
