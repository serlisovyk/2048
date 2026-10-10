# One reusable confirmation dialog, answered with a Promise

Date: 2026-10-10 · Status: accepted

## Context

`New Game` silently erased the game in progress (MY-115), and with the saved game
(MY-113) that loss is permanent. The same question is coming back: resetting the high
score (MY-117) and changing the board size or the win target in the settings
(MY-127). Each issue would otherwise write its own dialog, its own focus rules, and
its own "no" handling.

## Decision

- **One confirmation dialog**, one view class: `ConfirmDialogView` owns a single
  native `<dialog class="confirm-dialog">` and is opened with
  `ask({ title, message, confirmLabel, cancelLabel = 'Cancel' })`. It knows nothing
  about the caller; every confirmation in the game goes through it. A new issue
  passes new texts, it does not add markup, a view, or styles.
- **`ask()` returns a `Promise<boolean>`**: `true` only for the confirm button; the
  cancel button, `Escape`, and a close forced by the browser all give `false`. The
  caller writes `if (!(await view.ask(…))) return`. Rejected: a persistent
  `onConfirm(handler)` (the one dialog serves many callers, so a handler bound in
  `main.js` cannot tell who asked) and a callback per call (a "no" has no path and
  follow-ups nest). The promise never rejects and nothing is left running. This is a
  deliberate variation on "views expose user actions as `on<Action>(handler)`" in
  `ai/rules/oop.md`: that fits a button with one fixed meaning, not a dialog whose
  meaning the caller supplies.
- **The safe answer is the default.** The cancel button comes first and carries
  `autofocus`, so a reflex `Enter` or `Space` cancels. `Escape` is not intercepted:
  the native `cancel` → `close` already means "no". The confirm button is the
  secondary (outlined) one.
- **Focus: back to the opener on "no", to the board on "yes".** The author's rule,
  chosen over reusing the board-on-any-close rule of `2026-10-10-native-dialog.md`: a
  dialog opened by a button that the player dismisses returns focus to that button
  (the ARIA dialog pattern), so a keyboard user continues with `Tab` from where they
  were; a confirmed action puts focus on the board, so the player just plays.
  `ConfirmDialogView.ask()` remembers the focused element and `restoreFocus()` gives
  it back (it reports `false` when there is no usable opener, e.g. a browser that does
  not focus a button on click); `GameController` falls back to the board then, and
  calls `returnFocusToBoard()` itself after a "yes". The restore runs where the
  question is answered, never from a later `close` event, so the late `close` of an
  earlier question cannot move focus for a newer one. The view has no `onClose` hook.
  The win and game-over dialogs keep the board-on-any-close rule: they are not opened
  by a button the player can return to.
- **One question at a time.** `ask()` while the dialog is open answers `false` and
  leaves the open question alone. The confirmation opens only from page buttons, which
  are inert while the win or game-over dialog is open, and a move cannot happen while
  it is open, so it is never open together with those. A deliberate stack (a
  confirmation over the settings dialog) stays MY-127's call.
- **The wording belongs to the use case**, not the view: the controller keeps the
  prompt for each question (`GameController`'s private `NEW_GAME_PROMPT`). The view's
  only default text is `Cancel`.
- **"A game in progress"** means at least one move was made and the game is not over.
  A move that changes nothing does not count. A game restored from the saved game
  counts, because a save is only written after a first move. `Game.isInProgress`
  derives it from a private flag; it is never stored, so the saved-game format and
  `SAVED_GAME_VERSION` are untouched (`2026-10-10-saved-game-format.md`).
- **When `New Game` asks**: only in a game in progress. A fresh game, a finished
  game, and the buttons inside the win and game-over dialogs (where the intent is
  already explicit) restart at once through `GameController.restart()`.
  `requestNewGame()` is the page button's use case.

## Consequences

- MY-117 (reset high score) and MY-127 (settings) call `ask()` with their own texts;
  they should not need to touch `ConfirmDialogView`. If one needs a second kind of
  answer (three buttons, a checkbox), that is a new decision, not a quiet extension.
- It refines `2026-10-10-native-dialog.md` without reversing it: `OverlayView` is the
  only code that calls `showModal()` for the win and game-over dialogs, and
  `ConfirmDialogView` is for its own dialog (the record and the `feature` skill
  already say a dialog with state of its own gets its own view). The page `New Game`
  button no longer always leaves focus alone: with a game in progress it opens the
  confirmation, and closing that returns focus to the button on "no" and to the
  board on "yes". "Focus goes to the board whenever a dialog closes" there now holds
  for the win and game-over dialogs only.
- Nothing is stored for a pending question: a reload while the dialog is open just
  restores the game, as before.
- Rejected: a confirmation from the win and game-over buttons, a move counter instead
  of a flag (nothing needs the number), and a separate confirmation dialog per issue.
