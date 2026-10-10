# MY-114 — Win and game-over dialogs on native `<dialog>` (spec)

Issue: MY-114 · Branch: `my-114-native-dialogs` · Plan: `ai/superpowers/plans/2026-10-10-native-dialogs.md`

## Goal

Make the win and game-over dialogs real modal dialogs: the page behind them is dimmed
and inert, focus stays inside, `Escape` does the right thing, focus returns to the
board, and two dialogs never show together. The pattern is reused by the confirmation
and settings dialogs that follow (MY-115, MY-117, MY-127).

## What is wrong today

- The dimming does not work. `.win-overlay` / `.game-over` are centered with
  `transform: translate(-50%, -50%)`, so the `position: fixed` `::before` that should
  cover the window is sized against the dialog instead. The page stays bright, and
  the `New Game` button behind the dialog can be clicked and focused with `Tab`,
  although `aria-modal="true"` says otherwise.
- There is no focus trap and `Escape` does nothing.
- A move that reaches 2048 and leaves no moves shows **both** dialogs at once.
- The win dialog cannot start a new game.

## Behavior

### Both dialogs

- Opened with `showModal()`, closed with `close()`. While one is open the rest of the
  page is inert: nothing behind it can be clicked, tapped, or focused, and the page
  behind is dimmed by the dialog's `::backdrop`.
- `Tab` and `Shift+Tab` stay inside the dialog.
- Opening focuses the dialog's primary button (`Continue Playing` / `Restart Game`).
  `Enter` and `Space` activate the focused button, as does a click or a tap.
- The arrows and WASD do nothing while a dialog is open (the keys come from inside
  the dialog and `KeyboardInput` ignores them; `requestMove` also refuses to move).
- Clicking or tapping the dimmed area does nothing — a dialog is closed only by its
  buttons (and by `Escape` on the win dialog).
- Appearing keeps the short pop-in animation (dialog scales and fades in, the
  backdrop fades in); `prefers-reduced-motion` turns both off.
- When a dialog closes, focus goes to the game board, and the arrows and WASD work
  immediately, without a click.
- Never two dialogs at once: showing one closes the other first.

### Win dialog

Shown when a move creates the win tile (2048) and the game can still continue.

| Control            | Result                                                         |
| ------------------ | -------------------------------------------------------------- |
| `Continue Playing` | Closes the dialog, the game goes on                            |
| `Escape`           | Same as `Continue Playing`                                     |
| `New Game`         | Closes the dialog, starts a new game at once (no confirmation) |

`Continue Playing` is the first button and has the initial focus.

### Game-over dialog

Shown when a move leaves no moves.

| Control        | Result                                                        |
| -------------- | ------------------------------------------------------------- |
| `Restart Game` | Closes the dialog, starts a new game                          |
| `Escape`       | Nothing: the dialog stays open (there is nothing to continue) |

`Escape` is ignored however often it is pressed. Browsers may close a dialog on a
repeated `Escape` or a repeated "back" gesture even when `cancel` is prevented; the
dialog is then shown again.

### A move that wins and ends the game at once

One dialog only: the **game-over** dialog, with an extra line saying the player
reached 2048, and the single button `Restart Game`. The win dialog is not shown.
_Recommended in the plan; to be confirmed by the author before implementation — the
plan lists the alternatives._

Why: there is nothing to continue, so `Continue Playing` would lead to a dead board;
a finished game is what the player has to act on; the original 2048 also lets "game
over" take precedence over "won".

### Unchanged

- `Restart Game`, `New Game`, the win and game-over wording, and the colors of the two
  dialogs stay as they are.
- The saved game (MY-113): a restored game with `hasWon: true` shows no win dialog
  and is not paused; a game over still deletes the save, including the same-move case.
- The movement guard (cooldown, pause after a win, game over) and the keyboard rules
  from MY-118.

## Out of scope

- Confirming `New Game` mid-game (MY-115), resetting the high score (MY-117), the
  settings dialog and a confirmation stacked over it (MY-127).
- Confetti and the "new record" badge (MY-125) — they hang on the win event, not on
  which dialog is shown.
- Closing a dialog by clicking the backdrop.
- Renaming `OverlayView` or the `.win-overlay` / `.game-over` classes.
