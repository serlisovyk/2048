# The score is announced as `Score N`; the board is a named group

Date: 2026-10-14 · Status: accepted

## Context

The live region read the bare number ("16") and `2026-10-10-score-live-region-and-focus-ring.md` left `Score:` to the
markup. Browsing the header that works, but a moment later a screen reader says only "16" with nothing that says what it
is. The board was a `div` with an `aria-label` and no role: a name on a generic element is not exposed, and the board
is where focus returns after every dialog. The author asked for a name with the size and the goal, and for the goal to stay
off the screen (`2026-10-13-win-target-per-board-size.md`).

## Decision

- **The announcement is `Score 16`**, and a record is `New record! Score 104` (the badge's own text, then the score). The
  debounce, the skipped repeats and the silent first render are unchanged. The visible `Score` label is `aria-hidden`:
  otherwise browsing the header reads "Score Score 16". The `High Score` box is unchanged.
- **The board is `role="group"` with the accessible name `2048 board, 4×4, goal 2048`.** `GridView.render` writes it on
  every render from the size and the win target it is given, so a new size or target (a new game) renames it, and a
  restored game names itself. The goal is in the name only.
- Rejected: a name written by `SettingsController` (two writers for what `render` already receives), `aria-live` on the
  board (the tiles are re-appended in reading order for browsing, not announced), and the goal on screen.

## Consequences

- Another value that must be heard follows the same wording rule: the label is part of the announcement and the visible
  label is hidden from assistive technology.
- Not verified without a real screen reader: how NVDA and VoiceOver speak the new text. The accessibility tree, the
  live-region text and the group's name were checked.
- Refines `2026-10-10-score-live-region-and-focus-ring.md` and `2026-10-10-new-record-badge.md` (the wording of the
  announcement; the badge stays `aria-hidden` and spoken once).
