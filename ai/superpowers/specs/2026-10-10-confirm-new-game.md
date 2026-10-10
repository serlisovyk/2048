# MY-115 — Confirm `New Game` in the middle of a game (spec)

Issue: MY-115 · Branch: `my-115-confirm-new-game` · Plan: `ai/superpowers/plans/2026-10-10-confirm-new-game.md`

## Goal

One click on the page `New Game` button silently erases the game — easy to hit by
mistake, especially on a phone, and with the saved game (MY-113) the loss is
permanent. Ask for confirmation when there is something to lose, and stay out of the
way when there is not. The confirmation is a reusable dialog: the high-score reset
(MY-117) and the settings (MY-127: board size, win target) use the same one.

## When the question appears

The game is **in progress** when at least one move has been made and the game is not
over.

| Situation when `New Game` is pressed                          | Result                  |
| ------------------------------------------------------------- | ----------------------- |
| Fresh game, no move made yet                                  | New game starts at once |
| At least one move made, game not over                         | Confirmation dialog     |
| Game restored from the saved game after a reload              | Confirmation dialog     |
| After `Continue Playing` on a won game                        | Confirmation dialog     |
| Game over (the game-over dialog was closed by the browser)    | New game starts at once |
| `New Game` inside the win dialog, `Restart Game` in game over | New game starts at once |

- A move that changes nothing (a swipe into a wall) is not a move: it does not turn a
  fresh game into a game in progress.
- A restored game counts as in progress. A save is only written after a successful
  move (`ai/decisions/2026-10-10-saved-game-format.md`), so every restored game has
  had at least one.
- The win and game-over dialogs show their own buttons only when the intent is
  already explicit; their buttons never ask again. Those dialogs are modal, so the
  page `New Game` button behind them cannot be pressed, and the confirmation can never
  open together with them.

## The confirmation dialog

| Part          | Content                                            |
| ------------- | -------------------------------------------------- |
| Title         | `Start a new game?`                                |
| Message       | `Your current progress will be lost.`              |
| First button  | `Cancel` — has the initial focus (the safe answer) |
| Second button | `New Game`                                         |

- A native modal `<dialog>` (`ai/decisions/2026-10-10-native-dialog.md`): the page
  behind is dimmed and inert, `Tab` / `Shift+Tab` stay inside it (`Cancel` ↔
  `New Game`), a click or tap on the dimmed area does nothing.
- Opening focuses `Cancel`. `Enter` / `Space` on it cancels, so a reflex `Enter`
  right after the dialog appears never destroys the game.
- `Cancel` and `Escape` both mean "no": the dialog closes, the game, its score and the
  saved game are exactly as before.
- `New Game` means "yes": the dialog closes and a new game starts (the saved game is
  deleted, the score is reset, the high score stays), exactly as the unconfirmed
  `New Game` does.
- A browser that closes the dialog by force (a repeated `Escape`, the Android "back"
  gesture) is a "no" too: nothing is lost, nothing reopens
  (`ai/decisions/2026-10-10-native-dialog.md`).
- Focus after the dialog closes:
  - `Cancel`, `Escape` and a close forced by the browser ("no") give focus back to the
    element that opened the dialog — the page `New Game` button — so a keyboard user
    carries on with `Tab` from where they were. If that element is gone or cannot take
    focus (a browser that does not focus a button on click), focus goes to the board.
  - `New Game` in the dialog ("yes") puts focus on the board, so the arrows and WASD
    work at once and the player just plays.
  - The win and game-over dialogs are not affected: they still return focus to the
    board whenever they close (MY-114).
- The arrows and WASD do nothing while the dialog is open. Moves, swipes and the page
  buttons are blocked by the modal; `KeyboardInput` ignores keys from `dialog[open]`.
- The dialog pops in with the same short animation as the other dialogs;
  `prefers-reduced-motion` turns it off (and the backdrop's).
- The text is English like the rest of the page. The look follows the other dialogs
  (same shape, padding, text sizes, button row) in a neutral dark panel, with
  `Cancel` as the primary (filled) button and `New Game` as the secondary (outlined)
  one, as in the win dialog.
- At 320px wide the buttons fit or wrap, the dialog is centered, nothing scrolls
  sideways.

## Reusable by design

The dialog is opened with a title, a message and button labels and answers "confirmed"
or "not confirmed". Nothing in it knows about `New Game`; MY-117 asks
`Reset the high score?` with `Cancel` / `Reset` through the same dialog without
touching the view.

## Unchanged

- The saved-game format and `SAVED_GAME_VERSION` (1): "in progress" is derived, not
  stored.
- `Restart Game` and the win dialog's `New Game`, the win and game-over dialogs and
  their rules (one at a time, game over wins over win), the movement guard.
- The page `New Game` button: look, position, label. Without a question to ask it
  leaves focus where it is, as before.

## Out of scope

- Resetting the high score (MY-117), the settings dialog and a confirmation stacked
  over it (MY-127), the toolbar and icon buttons (MY-120).
- The focus ring styles for buttons (MY-116) and `aria-live` on the score (MY-116).
- A `New Game` hotkey (rejected, `ai/decisions/2026-10-10-rejected-features.md`).
- Closing a dialog by clicking the backdrop.
