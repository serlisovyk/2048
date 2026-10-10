# MY-116 — Score live region and one focus ring (spec)

Issue: MY-116 · Branch: `my-116-a11y-score-focus` · Plan: `ai/superpowers/plans/2026-10-10-a11y-score-focus.md`

## Goal

A screen-reader user hears the new score after a move, but not a stream of numbers
during a burst of fast moves. A keyboard user sees the same clear focus ring on every
button, on the page and in the dialogs; a mouse click shows none, and neither does the
board.

## What is wrong today

- The score changes silently. Nothing tells a screen-reader user what a move did.
- Buttons use the browser's default focus outline. On the dark page and on the purple
  and brown dialogs it is thin and easy to lose, and it looks different per browser.
  The hover styles (`transform`, `box-shadow`) differ per button, so nothing says the
  focus state should look alike.
- After a dialog closes the board is focused from script (`tabIndex = -1`). After a
  keyboard interaction the browser then draws its default ring around the whole grid.

## Behavior

### Score announcement

- After a move that changes the score, a screen reader says the new score once, as a
  polite announcement: it waits for the current speech to finish and never interrupts
  it.
- The announcement is the bare number (`128`). The visible `Score:` label next to it is
  still read when the user browses the header (`Score: 128`).
- A burst of moves is announced once, with the last score. The announcement is sent
  after the score has stopped changing for `SCORE_ANNOUNCEMENT_DELAY_MS` (500 ms). The
  visible score is **not** delayed: it still changes with every move.
- Nothing is announced when the score did not change: a slide without a merge, or
  `New Game` at a score of 0.
- `New Game` after a score of 128 announces `0`.
- The score shown when the page loads (0 or the restored game's score) is not
  announced; it is the starting value, not a change.
- The high score has no live region, so a move that sets a new record does not announce
  two numbers.
- While a dialog is open the page behind is inert, so a score change from the move
  that opened the dialog is not announced. That is fine: the dialog's own title is
  read instead.

### Focus ring

- Every `<button>` gets the same ring on `:focus-visible`: a white 3px outline with a 3px
  gap. White has at least 3.6:1 contrast on every background it sits on: the page
  `#333333`, the page button `#555555`, the win dialog gradient, and the game-over
  dialog.
- The ring appears for keyboard focus only: `Tab` and `Shift+Tab` through the page and
  through both dialogs, and for a dialog's `autofocus` button when the dialog was
  opened after a keyboard move. A mouse click or a tap shows no ring.
- The ring is not clipped, does not shift or distort on hover (the buttons only
  translate up by 2px, and the ring moves with them), and stays visible next to the
  neighbouring button in the win dialog.
- Any button added later (the confirmation dialog, the reset-high-score icon button)
  gets the ring with no extra CSS.
- The board (`.game-grid`) is focused from script so the arrows keep working after a
  dialog closes; it never shows a ring.

### Unchanged

- Moves, scoring, the saved game, the dialogs and their focus handling, the `+N`
  score pop (MY-124, out of scope: visual only, hidden from screen readers).
- Hover and active styles of the buttons.

## How it will be checked

No screen reader is available in the working environment, so the announcement is checked
through the accessibility tree and the DOM: the attributes on the live region, the
hidden visible number, and how many times the live text changes during a simulated
burst of moves. A real NVDA / VoiceOver pass is still needed and is reported as such.
The focus ring is checked by tabbing through the page and both dialogs and reading the
computed `outline`, and by a mouse click.
