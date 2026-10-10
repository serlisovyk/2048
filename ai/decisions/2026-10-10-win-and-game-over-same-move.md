# A move that wins and ends the game shows only the game-over dialog

Date: 2026-10-10 · Status: accepted

## Context

A single move can create the win tile and leave no moves. Before MY-114 the
controller showed the win dialog and then the game-over dialog, so both were open at
once. The issue asked for one dialog and left the choice to the plan; the author
decided.

## Decision

- Game over takes precedence: only the **game-over** dialog opens, with one extra line
  `You've reached 2048!` between the title `Game Over!` and the text
  `No more moves available`, and the single button `Restart Game`. The win dialog is
  not shown and the win pause is not set. The game over deletes the saved game as
  usual.
- The line shows only when the game-over move is itself the winning move
  (`justWon`). A game over after `Continue Playing` has the usual text.
- If the browser closes this dialog by force (`2026-10-10-native-dialog.md`), that is
  accepted: the game stays over and `New Game` starts a new one.
- Rejected alternatives:
  - game over with no mention of the win — the achievement looks lost;
  - the win dialog with only `New Game` — it needs a second mode (no `Continue`, and
    `Escape` must not continue), plus a "You Won!" title over a finished board;
  - the win dialog first, game over after `Continue Playing` — two dialogs in a row,
    and `Continue Playing` leads to a dead board.
- It is also how the original 2048 resolves it: game over takes precedence over won.

## Consequences

- Celebration effects (confetti, "new record", MY-125) hang on the win event
  (`justWon`), not on which dialog is shown.
- The dialog copy says `2048` literally, like the win dialog. When the win target
  becomes configurable, both texts follow it.
