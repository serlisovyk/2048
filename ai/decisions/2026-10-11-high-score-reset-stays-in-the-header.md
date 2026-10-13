# The high score reset stays next to the high score; it does not move into the settings

Date: 2026-10-11 · Status: accepted

## Context

MY-117 put a small reset icon in the High Score box, with a confirmation. MY-127 builds the
settings dialog and asked whether the reset should stay there or move in (MY-117 left the
question for it). Two things were coming that touch it: board size (MY-128) makes the record
per size, so the reset has to hit the record of the current size, and the settings dialog
itself has no section yet, so a moved reset would have been the only thing in it.

## Decision

- **The reset stays where MY-117 built it**, the icon in the High Score box, with the same
  confirmation and the same hidden-at-zero rule. It is **not** moved into the settings and not
  copied there (the author's decision, 2026-10-11).
- **Why.** A reset is a one-off action on a number that is on the screen; a setting is a choice
  that persists and shapes the game. Next to the number the player sees what is being reset, and
  after MY-128 the box shows the record of the current size, so "reset the record I am looking at"
  needs no label or size picker. In the settings it would sit two taps away from that number, and
  the question it asks would have to be asked from inside a dialog (the settings closes for it,
  `2026-10-11-settings-dialog-and-storage.md`). It is built, accessible and checked.
- **The statistics reset is a different action** (MY-130) and does belong in the settings, next to
  the numbers it clears.
- Rejected: moving the reset into the settings (more taps, a destructive action away from the value
  it changes, and the settings' only content on day one); copying it there (two entry points to one
  destructive action).

## Consequences

- MY-128 resets the record of the current board size from this same button; nothing moves.
- `ScoreView` keeps `onResetHighScore` and the `hidden` toggle; `GameController.requestResetHighScore`
  keeps its confirmation and its focus rule (back to the button on "no", to the board on "yes").
- Reversing this needs a new dated record.
- Carried out by `2026-10-13-statistics.md` (MY-130): the statistics reset is in the settings, in the Statistics section, and asks through the same confirmation.
