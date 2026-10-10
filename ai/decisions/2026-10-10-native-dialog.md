# Modal dialogs are native `<dialog>` elements

Date: 2026-10-10 · Status: accepted

## Context

The win and game-over overlays were `div role="dialog" aria-modal="true"` centered
with `transform: translate(-50%, -50%)`. A transformed element becomes the containing
block of its `position: fixed` children, so the `::before` that was meant to dim the
window was sized against the dialog instead (MY-114). The page stayed bright, the
`New Game` button behind the dialog could be clicked and focused, nothing trapped
focus, and `Escape` did nothing. Fixing that by hand (a focus-trap script, `inert`,
key handlers) would copy what the platform already does, and the next dialogs — the
`New Game` confirmation, the high-score reset, the settings — would need it again.

## Decision

- Every modal dialog is a `<dialog>` opened with `showModal()` and closed with
  `close()`. No overlay `div`, no hand-written focus trap, no `style.display`
  toggling, no `role="dialog"` / `aria-modal` on it. The platform provides the top
  layer, the inert page behind, the `Tab` trap, `::backdrop`, and the `cancel` event
  on `Escape`.
- The dimming is `dialog::backdrop`. Only `dialog[open]` gets an author `display`,
  and centering is `margin: auto`.
- The view that owns a dialog (`OverlayView`) is the only code that calls
  `showModal()` and `close()`; `GameController` decides when.
- `Escape` on the win dialog is cancelled and treated as `Continue Playing`. On the
  game-over dialog `cancel` is cancelled and nothing happens, because there is
  nothing to continue. Clicking the backdrop closes nothing (no light dismiss).
- A dialog the browser closes by force is **accepted, not fought**. Chromium (and the
  Android "back" gesture) closes a dialog on a repeated `Escape` without any user
  interaction in between even though `cancel` was prevented. The view does not reopen
  it and keeps no "must stay open" flag. For the game-over dialog the state stays
  sane: the game is still over and `GameController` blocks moves, nothing is paused,
  no other dialog appears, and the page `New Game` button starts a new game.
- Focus goes back to the board whenever a dialog closes — a button, `Escape`, or the
  browser. `OverlayView.onClose` fires from the `close` event and
  `GameController.returnFocusToBoard()` focuses the grid; the page `New Game`
  button, which opens no dialog, leaves focus alone.
- The win and game-over dialogs are never open together: showing one closes the other.
  A deliberate stack of dialogs (a confirmation over the settings dialog, MY-127)
  would be an explicit exception decided in that issue.

## Consequences

- New dialogs follow the recipe in `ai/skills/feature.md`: markup in `index.html`,
  methods on the view, `autofocus` on the primary button, `cancel` for `Escape`.
- CSS gotchas found on the way: the reset `* { margin: 0 }` beats the browser's
  `dialog { margin: auto }`, so set `margin: auto`; an author `display` on the bare
  class shows a closed dialog, so use `[open]`; the reduced-motion selector
  `*, *::before, *::after` does **not** match `::backdrop`, so list it explicitly.
- `KeyboardInput` keeps ignoring keys that come from `dialog[open]`
  (`2026-10-10-keyboard-by-event-code.md`), and `requestMove` stays the single
  movement guard.
- Rejected: a hand-made focus trap and overlay, and reopening the game-over dialog
  after a forced close.
