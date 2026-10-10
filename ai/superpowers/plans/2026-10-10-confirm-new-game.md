# MY-115 — Confirm `New Game` in the middle of a game

Issue: MY-115 · Branch: `my-115-confirm-new-game` · Spec: `ai/superpowers/specs/2026-10-10-confirm-new-game.md`

Blocker MY-114 (native `<dialog>`) is `Done` and is in the branch base. Related:
MY-113 (the saved game), MY-117 (reset high score) and MY-127 (settings) reuse the
confirmation; MY-120 (toolbar) may move the `New Game` button later. No decision
record is contradicted:

- `2026-10-10-native-dialog.md` — the new dialog is a native `<dialog>` with
  `showModal()`, `autofocus` on the safe button, `Escape` through `cancel`. Focus after
  closing differs on purpose (section 1.4). Two refinements, both inside what that record leaves
  open (see "Decision record" below): the dialog has its own view class (the record
  and the `feature` skill say to split once a dialog has state of its own), and the
  page `New Game` button now opens a dialog in one case.
- `2026-10-10-saved-game-format.md` — no format change; "in progress" is derived at
  run time, so `SAVED_GAME_VERSION` stays `1`.
- `2026-10-10-win-and-game-over-same-move.md`, `2026-10-10-keyboard-by-event-code.md`
  — untouched.
- `2026-10-10-rejected-features.md` — nothing from the list (no `New Game` hotkey).

The issue and the spec leave nothing to be decided by the author. The choices below
are mine and are final unless the author objects at review.

## 1. Decisions

### 1.1 The dialog resolves a Promise, not a callback

`ConfirmDialogView.ask({ title, message, confirmLabel, cancelLabel })` returns a
`Promise<boolean>`: `true` when the player confirmed, `false` for `Cancel`, `Escape`,
and a forced close.

| Option                                          | Verdict                                                                                                                                                                                                                                                                                               |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onConfirm(handler)` bound once in `main.js`    | Rejected. The one dialog serves several callers (`New Game`, reset high score, settings) with different follow-ups, so one persistent handler cannot know who asked; `main.js` would need a router or the view would need state about the caller.                                                     |
| `ask(options, onConfirm)` — a callback per call | Works, but a "no" has no path (cancel is silence), and every caller nests its follow-up in a callback.                                                                                                                                                                                                |
| **`ask(options)` → `Promise<boolean>`**         | **Chosen.** The question and its answer stay in one place: `if (!(await view.ask(…))) return`. One settle point guarantees the answer arrives exactly once, whichever way the dialog closes (button, `Escape`, the browser). No handlers are left registered per request, and nothing can fire twice. |

This is a deliberate variation on `ai/rules/oop.md` ("views expose user actions as
`on<Action>(handler)`"): the rule fits a view with one fixed meaning per button
(`onContinue`, `onRestart`); a dialog whose meaning is supplied by the caller needs
the answer returned to that caller. The Promise never rejects. There is no timer,
so nothing is left running if the player never answers.

### 1.2 "In progress" is a flag in `Game`, not a move counter and not stored

`Game` gets a private `#hasMoved` and a getter `isInProgress` (`#hasMoved` and not
`#isOver`). `move()` sets the flag on a move that changed the board, `start()` clears
it, and `restore()` sets it.

- A counter was rejected: nothing needs the number (YAGNI); a flag says what the
  rule says.
- A restored game counts as in progress without changing the format: the controller
  saves only after a successful move, so every valid save has had one.
- `isInProgress` is derived at run time and never written, so the saved-game format
  and `SAVED_GAME_VERSION` stay as they are, and a game saved by the previous version
  restores as in progress.
- The model reports the fact; the controller decides what to do with it, per the
  layer table in `ai/rules/oop.md`.

### 1.3 The question's wording lives in `GameController`

The controller owns the use case, so it owns the question: a private static frozen
object `NEW_GAME_PROMPT` (`Start a new game?` / `Your current progress will be
lost.` / `New Game`), passed to `ask`. The view does not know any wording but its
default `Cancel`. The text is not a shared value (nobody else reads it), so it does
not go to `constants.js`; MY-117 adds its own object next to it.

### 1.4 Focus: back to the opener on "no", to the board on "yes"

The author's rule (it replaces the first draft, which reused MY-114's "focus goes to
the board whenever a dialog closes" through an `onClose` hook): a dialog the player
opened with a button and then dismisses returns focus to that button; a confirmed action
puts focus on the board. The win and game-over dialogs keep MY-114's behaviour.

- `ConfirmDialogView.ask()` remembers the focused element (`ownerDocument.activeElement`,
  ignoring `body`) as the opener. `restoreFocus()` focuses it again and returns whether
  focus really landed there; it returns `false` when there is no opener, when the
  element cannot take focus (hidden, removed), or while the dialog is open again.
- `GameController` owns the flow in one private `#confirm(prompt)`: after the answer, on
  "no" it calls `restoreFocus()` and falls back to `returnFocusToBoard()` when that
  returned `false`. On "yes" the use case acts and then calls `returnFocusToBoard()`
  itself (`requestNewGame`; MY-117's reset does the same), so the view never knows where
  the board is.
- No `onClose` hook any more: `ConfirmDialogView.onClose` and its `main.js` wiring were
  removed as dead. `OverlayView.onClose` stays for the win and game-over dialogs.
- The restore runs where the question is answered (right after the promise resolves, in
  the same microtask checkpoint as the click or the `close` event), never from a later
  `close` event, so a late `close` of an earlier question cannot move focus for a newer
  one; the `close` handler still ignores the event while the dialog is open again.
- The page `New Game` button with nothing to ask (fresh game, game over) opens no dialog
  and leaves focus where it is.

### 1.5 One question at a time, never with the win / game-over dialogs

- `ask()` while the dialog is already open returns `false` at once and leaves the open
  question alone. Not reachable today (the modal makes the page inert), cheap, and it
  keeps the one-pending-answer invariant for MY-117 / MY-127.
- The confirmation is only asked from the page `New Game` button, which is inert
  while the win or game-over dialog is open, and a move (the only thing that opens
  those) cannot happen while the confirmation is open. So no pair of dialogs can be
  open together, and `OverlayView` needs no knowledge of the new dialog.
- A deliberate stack of dialogs (a confirmation over the settings dialog) stays
  MY-127's decision.

## 2. Where each part lives (`ai/rules/oop.md`)

| Layer / file                          | Change                                                                                                                                                                                  |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/scripts/game/Game.js`            | `#hasMoved`, getter `isInProgress` (section 1.2).                                                                                                                                       |
| `src/scripts/ui/ConfirmDialogView.js` | New class: owns one `<dialog>`, its title, message and two buttons. `ask(options)`, `restoreFocus()` (section 3).                                                                       |
| `src/scripts/GameController.js`       | New dependency `confirmDialogView`; new use case `requestNewGame()`; `restart()` is untouched and stays the unconditional path for the win and game-over buttons (section 4).           |
| `src/scripts/main.js`                 | Looks up the dialog elements, creates `ConfirmDialogView`, passes it to the controller; the page `New Game` click calls `controller.requestNewGame()`. No focus wiring for this dialog. |
| `src/index.html`                      | One new `<dialog class="confirm-dialog">` after the game-over dialog (section 3). Nothing else in the page changes.                                                                     |
| `src/styles/overlays.css`             | `.confirm-dialog` joins the shared dialog rules and gets its background and shadow.                                                                                                     |
| `src/styles/controls.css`             | The two new buttons join the existing button rules (primary and secondary look).                                                                                                        |
| Constants, storage, input             | Unchanged. `KeyboardInput` already ignores keys from `dialog[open]`.                                                                                                                    |

## 3. `ConfirmDialogView` and the markup

```html
<dialog
  class="confirm-dialog"
  aria-labelledby="confirm-title"
  aria-describedby="confirm-message"
>
  <h2 id="confirm-title" class="confirm-title"></h2>
  <p id="confirm-message" class="confirm-message"></p>
  <div class="dialog-actions">
    <button class="confirm-cancel-button" autofocus></button>
    <button class="confirm-accept-button"></button>
  </div>
</dialog>
```

`aria-describedby` points to the message so a screen reader reads "Your current
progress will be lost." with the title. Both texts and both labels are filled by
`ask()`; the markup holds no copy to keep in sync.

```js
export class ConfirmDialogView {
  constructor({ dialog, titleElement, messageElement, cancelButton, confirmButton })
  ask({ title, message, confirmLabel, cancelLabel = 'Cancel' }) // → Promise<boolean>
  restoreFocus() // → boolean: focus went back to the element that opened the dialog
}
```

- `ask()` writes the four texts, clears `returnValue`, stores the `resolve` function in
  a private field, and calls `showModal()`. `showModal()` focuses the `autofocus`
  `Cancel` button.
- One private `#settle(isConfirmed)` takes the stored `resolve`, clears it, and calls
  it; a second call finds nothing to resolve. The `Cancel` click calls
  `dialog.close()` then `#settle(false)`; the `Confirm` click calls `dialog.close()`
  then `#settle(true)`; the dialog's `close` event calls `#settle(false)` — that is
  `Escape` and a forced close, and a no-op after a button already settled. So the
  answer does not wait for the `close` event, which a hidden tab delivers late.
- `Escape` is **not** intercepted: the native `cancel` → `close` already means "no"
  here, unlike the win dialog (nothing to dismiss into) and the game-over dialog
  (nothing to continue). A forced close is the same path, so nothing special is
  needed for it.
- The `close` handler ignores the event while the dialog is open again (a late `close`
  event from the previous cycle must not cancel a new question).
- Apart from `restoreFocus()` (and the `autofocus` that `showModal()` honours), no manual
  focus; no `style.display`, no light dismiss, no `role` / `aria-modal`.

## 4. Controller, model, wiring

```js
// Game
get isInProgress() {
  return this.#hasMoved && !this.#isOver
}

// GameController
async requestNewGame() {
  if (!this.#game.isInProgress) {
    this.restart()

    return
  }

  if (!(await this.#confirm(GameController.#NEW_GAME_PROMPT))) return

  this.restart()
  this.returnFocusToBoard()
}

// "no": focus back to the opener, else the board; the caller handles "yes"
async #confirm(prompt) {
  const isConfirmed = await this.#confirmDialogView.ask(prompt)

  if (!isConfirmed && !this.#confirmDialogView.restoreFocus()) {
    this.returnFocusToBoard()
  }

  return isConfirmed
}
```

- `restart()` stays as it is (hide the win / game-over dialogs, reset the pause flag,
  start a new game). It is what the win dialog's `New Game` and `Restart Game` call, so
  those never ask.
- The game cannot change while the question is open (the modal blocks every input and
  `KeyboardInput` skips keys from the dialog), so the answer needs no re-check of
  `isInProgress`.
- `main.js`: `newGameButton` click → `controller.requestNewGame()`;
  `overlayView.onRestart(restart)` is unchanged.

## 5. Styles

- `overlays.css`: `.confirm-dialog` is added to the shared selectors (box, `[open]`
  flex layout and animation, heading, paragraph, mobile padding) and gets its own
  `background-color` (neutral dark, `#444444`, the colour of the score tiles) and
  `box-shadow`. Fixed width is not set; `max-width: 90vw` and wrapping buttons cover
  320px.
- `controls.css`: `.confirm-cancel-button` joins the shared white button rules
  (primary, as `Continue Playing`), `.confirm-accept-button` joins the outlined
  secondary rules (as the win dialog's `New Game`).
- `motion.css`: nothing. The dialog reuses `modal-pop` and the shared `::backdrop`
  animation, both already covered.
- No focus-ring rules: the unified `:focus-visible` styles come from MY-116.

## 6. Commits

1. `docs: add spec and plan for MY-115 confirm new game` — these two files.
2. `feat: track whether a game is in progress` — `Game.isInProgress`.
3. `feat: add a reusable confirmation dialog` — markup, `ConfirmDialogView`, styles.
   Nothing opens it yet, so the page behaves as before.
4. `feat: confirm New Game in the middle of a game` — controller use case, `main.js`
   wiring, and the focus rule of section 1.4.
5. `docs: document the confirmation dialog` — section 7.

## 7. Docs and decisions

- `ai/decisions/2026-10-10-confirm-dialog.md` (+ index line in
  `ai/decisions/README.md`): the confirmation is one shared dialog with its own view
  class, answered through a Promise; the safe button is the default and `Escape` / a
  forced close mean "no"; what "in progress" means (at least one move, not over,
  restored counts) and that it is derived, not stored; no confirmation from the win /
  game-over dialogs; rejected: a per-call callback and a persistent `onConfirm`, a
  move counter, a hand-written copy of the dialog per issue. It also notes what it
  refines in `2026-10-10-native-dialog.md`: the page `New Game` button no longer
  always leaves focus alone (it opens a dialog when a game is in progress), and
  `OverlayView` is not the only view that calls `showModal()` — each dialog's own
  view does. The old record stays untouched (records are appended, not rewritten).
- `ai/map.md`: `index.html` row (third dialog), `main.js`, `GameController`
  (`requestNewGame`), `Game` (`isInProgress`) and `ConfirmDialogView` rows;
  `overlays.css` / `controls.css` rows.
- `ai/skills/feature.md`: the dialog recipe gets the reusable confirmation (when to
  use `ConfirmDialogView.ask`, what the caller supplies, the controller pattern, the
  rule that win / game-over buttons never ask) and the "one view per dialog with its
  own state" rule now has a first example.
- `ai/rules/architecture.md`: `ConfirmDialogView` in the views list.
- `README.md`: the features list (confirmation before `New Game`) and the structure
  line for `overlays.css`.

## 8. Verification

`yarn lint`, `yarn format:check`, `yarn build`, `yarn size` (baseline: JS 3.46 kB / 8,
CSS 1.84 kB / 4 gzip).

Play in `yarn dev --port 5188 --strictPort`, desktop and 375px wide. Each scenario
with its result in the report; `document.querySelectorAll('dialog[open]').length` is
checked in every scenario.

- Fresh game (no move), `New Game`: starts at once, no dialog. A swipe into a wall
  does not count as a move.
- After moves, `New Game`: the dialog opens with `Cancel` focused, the page behind is
  dimmed and inert.
- `Cancel` (click), `Escape`, and `Enter` on the initial focus: the dialog closes,
  the board, the score, and `localStorage.savedGame` are unchanged, focus is back on the
  page `New Game` button, and `Tab` goes on from there.
- `New Game` in the dialog: new game, score 0, the high score kept, the saved game
  gone, focus on the board, and the arrows move tiles without a click.
- Opener gone: with focus on `body` when the question is asked, a "no" puts focus on
  the board.
- A later question is not disturbed by the late `close` event of an earlier one.
- Keyboard only: `Tab` to the page `New Game`, `Enter` → dialog; `Tab` / `Shift+Tab`
  cycle `Cancel` ↔ `New Game` and never leave the dialog; `Enter` / `Space` activate
  the focused button; `Escape` cancels.
- Reload mid-game (restored game), `New Game`: the dialog opens.
- After game over (the game-over dialog closed — by the browser's repeated `Escape`
  or the harness), page `New Game`: starts at once. Inside the game-over dialog,
  `Restart Game`: starts at once. Inside the win dialog, `New Game`: starts at once;
  `Continue Playing` then page `New Game`: the dialog opens.
- A forced close (a repeated `Escape`): treated as "no", nothing lost.
- A click on the dimmed area does nothing; keys pressed then do not move the board.
- Mobile width 375px (and 320px): the two buttons fit or wrap, the dialog is
  centered, taps work, no sideways scroll.
- Reduced motion: the dialog and backdrop animations are off (the media rule checked
  through computed styles, since the setting cannot be toggled from the tools).

Games are reached with prepared `savedGame` values in `localStorage` where a state
needs setting up; no constant is changed.

## 9. Out of scope

The high-score reset (MY-117), the settings dialog and a stacked confirmation
(MY-127), the toolbar (MY-120), focus-ring and `aria-live` changes (MY-116),
confetti (MY-125), light dismiss, a `New Game` hotkey (rejected), and any automated
test.
