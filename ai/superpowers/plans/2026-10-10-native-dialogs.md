# MY-114 — Win and game-over dialogs on native `<dialog>`

Issue: MY-114 · Branch: `my-114-native-dialogs` · Spec: `ai/superpowers/specs/2026-10-10-native-dialogs.md`

Blocker MY-109 (the `src/` structure and the views) is `Done`. No decision record is
contradicted:

- `2026-10-10-keyboard-by-event-code.md` — `KeyboardInput` already ignores keys that
  come from `dialog[open]` / `[role="dialog"]`; that guard stays and now matches the
  native elements.
- `2026-10-10-saved-game-format.md` — flow state is not persisted, so a restored
  `hasWon: true` game shows no win dialog and is not paused. This change must not
  break that.
- `2026-10-10-rejected-features.md` — nothing from the list.

The issue left one thing "to be decided in the plan" — section 0. The author answered
it, and also the question about a dialog the browser closes by force (section 2).

## 0. Decided: a move that wins and ends the game

Today `requestMove` calls the win and the game-over display one after another, so both
dialogs show. Which single dialog, with which buttons? Options that were considered:

| #   | Dialog shown                                     | Buttons                         | Notes                                                                                                                                                                                              |
| --- | ------------------------------------------------ | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Game over, text unchanged                        | `Restart Game`                  | Simplest. The player reached 2048 and is told "Game Over!" with no hint of it. Feels like the win was lost.                                                                                        |
| 2   | Game over **plus a line "You've reached 2048!"** | `Restart Game`                  | **Chosen by the author.** One dialog, one button, the achievement is acknowledged. Costs one hidden paragraph in the markup and a flag passed to the view.                                         |
| 3   | Win (`You Won!`, text "No more moves available") | `New Game` only (no `Continue`) | Celebrates the win, but the win dialog then has two modes: with `Continue` (Escape continues) and without (Escape must not). More state in the view, and a "You Won!" title over a finished board. |
| 4   | Win first, game over after `Continue`            | `Continue Playing` + `New Game` | Rejected: `Continue` leads to a dead board that needs a second dialog right after. It is two dialogs in a row, and the issue asks for one.                                                         |

**Decision: option 2.** The finished game is what the player has to act on, so the
dialog is the game-over one with the single `Restart Game` button; the original 2048
also lets game over take precedence over won. The extra line reads
`You've reached 2048!` (the win dialog's wording) and sits between the title
`Game Over!` and `No more moves available`; the author approved the text as is. Confetti
and the "new record" badge (MY-125) hang on the win event (`justWon`), so they are not
affected by which dialog is shown. Recorded in
`ai/decisions/2026-10-10-win-and-game-over-same-move.md`.

## 1. Where each part lives (`ai/rules/oop.md`)

| Layer / file                     | Change                                                                                                                                                                                                                                                                                                                                                                                                |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/index.html`                 | The two `div role="dialog"` become `<dialog>` (`.win-overlay`, `.game-over`; class names stay, they are the styling contract). Win: `Continue Playing` (first, `autofocus`) + `New Game` (`.win-restart-button`). Game over: the extra line (`hidden`) + `Restart Game` (`autofocus`). The redundant `role` and `aria-modal` go; `aria-labelledby` stays. Only the dialog markup in `<body>` changes. |
| `ui/OverlayView.js`              | Owns both `<dialog>` elements and their buttons. Opens with `showModal()`, closes with `close()`, no `style.display`, no manual `.focus()` (`showModal()` focuses the `autofocus` button). Section 2.                                                                                                                                                                                                 |
| `GameController.js`              | Decides what to show and when: one dialog per move; puts focus back on the board when a dialog closes. Section 3.                                                                                                                                                                                                                                                                                     |
| `main.js`                        | Only the overlay wiring: look up the two dialogs, the three buttons and the extra line, pass them to `OverlayView`; `onRestart` now also binds the win dialog's `New Game`; `onClose` is wired to the controller. DOM lookup stays here.                                                                                                                                                              |
| `styles/overlays.css`            | Section 4.                                                                                                                                                                                                                                                                                                                                                                                            |
| `styles/controls.css`            | Button row for the win dialog and a secondary look for its `New Game`.                                                                                                                                                                                                                                                                                                                                |
| `styles/motion.css`              | `::backdrop` joins the reduced-motion selector list (`*` does not match it).                                                                                                                                                                                                                                                                                                                          |
| Model, input, storage, constants | Unchanged. `KeyboardInput` keeps its `dialog[open]` guard; `Game.move()` already returns `justWon` and `isOver` together.                                                                                                                                                                                                                                                                             |

### Why one `OverlayView`, not one view per dialog

The class already owns both dialogs, and the rule "never two at once" is a property of
the pair, so it is enforced in one place: showing one dialog closes the other first.
Two classes would push that rule into the controller or into a shared helper that has
only these two users. Rename and split are deferred on purpose (`ai/rules/oop.md`: no
abstractions for one implementation). Split when a dialog gets its own state and
logic — the settings dialog (MY-127) is the likely first one. The confirmation dialog
stacked over the settings dialog (MY-127) is a deliberate second dialog; that issue
decides how it relates to the "one at a time" rule, which here covers the win /
game-over pair.

## 2. `OverlayView`

Constructor options: `winDialog`, `gameOverDialog`, `continueButton`,
`winRestartButton`, `restartButton`, `winNote` (the extra line).

```js
onContinue(handler) // Continue button click and Escape on the win dialog
onRestart(handler) // both New Game / Restart Game buttons
onClose(handler) // a dialog closed, however it was closed
showWin() // closes the game-over dialog, then showModal()
showGameOver({ justWon }) // closes the win dialog, shows or hides the extra line, showModal()
hideWin()
hideAll()
```

- **Escape on the win dialog** is the `cancel` event: `preventDefault()` and call the
  continue handler, so the controller closes the dialog the same way as the button.
- **Escape on the game-over dialog**: `cancel` + `preventDefault()`, as the issue
  says — the first `Escape` does nothing.
- **A dialog closed by the browser anyway is accepted.** Chromium has an anti-abuse
  rule: a second `Escape` (or the "back" gesture on Android) without any user
  interaction in between closes the dialog even though `cancel` was prevented — the
  second `cancel` is not cancelable. I confirmed it in the browser build used here.
  The author decided **not to fight the browser**: no reopening from the `close` event,
  no "must stay open" flag. The dialog simply closes, and the state has to stay sane:
  the game is still over and `GameController` still blocks moves (`game.isOver`), the
  pause flag is not set, no other dialog appears, focus goes to the board (through
  `onClose`, below), and the page `New Game` button starts a new game.
- **At most one open**: `showWin()` closes the game-over dialog and `showGameOver()`
  closes the win dialog before `showModal()`. Closing a closed dialog is a no-op.
- **`onClose(handler)`** listens to the `close` event of both dialogs. It fires for
  every way a dialog goes away — a button, `Escape`, or the browser — which is what
  "focus returns to the board after closing" needs.
- Light dismiss (click on the backdrop) is not added.

## 3. `GameController`

```js
requestMove(direction) {
  // ... guard, move, render ...
  if (result.isOver) {
    this.#overlayView.showGameOver({ justWon: result.justWon })
  } else if (result.justWon) {
    this.#isPausedAfterWin = true
    this.#overlayView.showWin()
  }
  this.#persistGame()
}

returnFocusToBoard() {
  this.#gridView.focus()
}
```

- `main.js` wires `overlayView.onClose(() => controller.returnFocusToBoard())`. This
  is the only route that puts focus back: `continueAfterWin()` loses its own
  `gridView.focus()` call, `restart()` gets none. Focus follows the closing of a
  dialog, so it also works when the browser closes the dialog by force, and the page
  `New Game` button (no dialog involved) does not touch focus — the plan's earlier
  idea of focusing the board in `restart()` is dropped for that reason. _Small
  judgment call, delegated by the author._
- `continueAfterWin()` otherwise unchanged: unpause, `hideWin()`. It also serves
  `Escape`.
- Same-move case: `isOver` wins; `#isPausedAfterWin` stays `false`, `game.isOver`
  already blocks moves, `#persistGame()` deletes the save as for any game over.
- Saved game: `start()` is untouched — it never shows a dialog, so a restored
  `hasWon: true` game opens without one and is not paused.
- The pause flag stays even though the modal dialog makes the board unreachable: a
  click on the dimmed area can leave focus on `body`, where a key press would reach
  `KeyboardInput`, and `requestMove` is the single movement guard.

## 4. Styles

`overlays.css` (shared by `.win-overlay` and `.game-over`):

- Drop `display: none`, `position`, `top` / `left`, `transform`, `z-index` and the
  `::before`. Show only `dialog[open]` as `display: flex` — an author `display` on the
  bare class would override the UA `dialog:not([open]) { display: none }` and show the
  closed dialog.
- `margin: auto` explicitly: the reset `* { margin: 0 }` in `base.css` beats the UA
  `dialog { margin: auto }`, which would pin the dialog to a corner. Remove the mobile
  `margin: 0 20px` (it breaks vertical centering); `max-width: 90vw` stays.
- `border: none`; keep padding, radius, colors, shadows, text sizes.
- `modal-pop` loses its `translate(-50%, -50%)`: scale + opacity only.
- `::backdrop { background-color: rgba(0, 0, 0, 0.5) }` with a short fade-in
  (`backdrop-fade`), replacing the `::before`.

`controls.css`: a `.dialog-actions` row (flex, centered, `gap`, wraps on narrow
screens); `.win-restart-button` shares the button base and gets a secondary look
(outline on the dialog's gradient), so `Continue Playing` stays the primary action.
`overlays.css` also tightens the gap under the extra game-over line
(`.game-over .game-over-win-note`, smaller `margin-bottom`).
`motion.css`: add `::backdrop` next to `*::before` / `*::after` — checked in the
browser: `*, *::before, *::after` leaves the backdrop animation at `0.3s` under the
reduced-motion rule, the explicit `::backdrop` brings it to `0.01ms`.

## 5. Commits

1. `docs: add spec and plan for MY-114 native dialogs` (these two files; this update
   is a follow-up commit, `docs: record the author's answers in the MY-114 plan`).
2. `feat: show the win and game-over dialogs with native <dialog>` — `index.html`
   markup (without the extra line), `OverlayView`, `main.js` wiring, `overlays.css`,
   `controls.css`, `motion.css`. The view, markup and styles go together so every
   commit leaves a working page.
3. `fix: show one dialog when a move both wins and ends the game` — the extra line
   (markup, its small CSS rule, `winNote` option, `showGameOver({ justWon })`) and the
   `requestMove` branch.
4. `feat: return focus to the board whenever a dialog closes` — `onClose`,
   `returnFocusToBoard`, the wiring, and the focus call removed from
   `continueAfterWin()`.
5. `docs: document the native dialogs` — section 6.

## 6. Docs and decisions

- `ai/decisions/2026-10-10-native-dialog.md`: native `<dialog>` + `showModal()` instead
  of a hand-made overlay and focus trap (why: the old `transform` centering broke the
  fixed backdrop and nothing trapped focus); `Escape` = `Continue` on the win dialog,
  ignored on game over; a dialog the browser closes by force (repeated `Escape`,
  Android back) is accepted and not reopened; no light dismiss; focus returns to the
  board on any close; win / game over are never open together. Index entry in
  `ai/decisions/README.md`.
- `ai/decisions/2026-10-10-win-and-game-over-same-move.md`: the rule chosen in
  section 0, with the rejected alternatives and the link to MY-125 (celebration hangs
  on `justWon`); mentions that a forced close of the game-over dialog is accepted.
- `ai/map.md`: `index.html` row, `main.js`, `GameController`, `OverlayView` rows,
  `overlays.css` / `controls.css` rows; drop the "overlays toggle `style.display` and
  both can show at once (MY-114)" coupling.
- `ai/skills/feature.md`: step 5 becomes the reusable dialog recipe for MY-115, MY-117
  and MY-127 (markup, `OverlayView` methods, `autofocus`, `cancel`, focus back to the
  board, the CSS gotchas above). `ai/skills/review.md`: the accessibility line names
  the native dialog. `ai/rules/architecture.md`: one bullet under Boundaries — no
  hand-made modals or focus traps.
- `README.md`: the two dialog feature lines (focus trap, `Escape`, New Game in the win
  dialog) and the `overlays.css` line in the structure list.

## 7. Verification

`yarn lint`, `yarn format:check`, `yarn build`, `yarn size` (JS 8 kB, CSS 4 kB gzip —
the CSS budget is the one to watch).

Play in `yarn dev --port 5185 --strictPort` with the browser tools, desktop and 375px
wide. Dialogs are reached with prepared `savedGame` values in `localStorage`; no
constant is changed. Boards checked against the real `Game` (200 random spawns each),
all played with one `left` move:

| Case            | Board (rows)                                                         |
| --------------- | -------------------------------------------------------------------- |
| Win only        | `[1024,1024,0,0]`, three empty rows                                  |
| Win + game over | `[1024,1024,8,16]`, `[32,64,32,8]`, `[64,32,64,32]`, `[32,64,32,64]` |
| Game over only  | the same with `512,512` instead of `1024,1024`                       |

Scenarios, each with its result in the report:

- Behind an open dialog: the page is dimmed (the `::backdrop` covers the window), the
  page `New Game` button cannot be clicked or reached with `Tab`.
- `Tab` / `Shift+Tab` never leave the dialog; the focus order is
  `Continue Playing` → `New Game` in the win dialog.
- `Escape` on the win dialog continues; on game over the first `Escape` does nothing.
- **Forced close of the game-over dialog** (a second `Escape` in a row): the dialog
  closes, `document.querySelectorAll('dialog[open]').length` is 0, arrows and WASD do
  not move the board, focus is on the board, nothing is paused, no other dialog
  appears; the page `New Game` button starts a new game, and a later game over shows
  the dialog again.
- After closing, `document.activeElement` is the board and the arrows / WASD move
  tiles without a click, for `Continue`, `Escape`, the win dialog's `New Game`, and
  `Restart Game`.
- Buttons by mouse click, `Enter` and `Space`.
- Never two dialogs: win + game over in one move shows only the game-over dialog with
  the extra line; check `document.querySelectorAll('dialog[open]').length` in every
  scenario; the save is deleted.
- Restore: reload with the win dialog open and with `hasWon: true` — no dialog, the
  board moves.
- A click on the dimmed area does nothing, and keys pressed then do not move the board.
- Mobile width 375px: two buttons fit or wrap, the dialog is centered, taps work, the
  page is not scrollable sideways.
- Reduced motion: the dialog and backdrop animations are off (the media rule checked
  through computed styles, since the setting cannot be toggled from the tools).

## 8. Out of scope

Confirmations (MY-115, MY-117), the settings dialog (MY-127), confetti and the "new
record" badge (MY-125), tile animation (MY-126), the mobile polish (MY-119), light
dismiss, renaming `OverlayView` or the CSS classes, and any automated test.
