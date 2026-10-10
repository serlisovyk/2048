# Saved-game format, and a finished game is not stored

Date: 2026-10-10 · Status: accepted

## Context

A page reload dropped the game in progress; only the high score survived (MY-113).
The saved data outlives the code that wrote it: the "Game modes" (board size) and
"Win target" issues will change the format, and a corrupted, hand-edited, or
outdated save must never stop the game from starting.

## Decision

- One key, `savedGame` (`STORAGE_KEYS.SAVED_GAME`), holds JSON:
  `{ version, board, score, hasWon }`. `SAVED_GAME_VERSION` is `1`. Version 1 has no
  `size` or `winTile`: it means a 4x4 board and the 2048 target. Later versions add
  those fields and bump the version; version 1 keeps loading as 4x4 / 2048.
- Validate or discard: a save with an unknown version or any failed check (board
  size, a cell that is not `0` or a power of two, score, flag) is deleted and a new
  game starts. It is never repaired or applied partially. The model validates what it
  owns (`Game.restore`, `Board.restore`), the controller checks the version, and
  `SafeStorage` only reads and writes JSON without ever throwing.
- A finished game is not stored. A move that ends the game deletes the save, and a
  restored board with no moves left is rejected. Reloading after a game over starts
  a new game. The alternative — storing the game-over board and showing the dialog
  again after a reload — was rejected: there is nothing to resume, and it would
  make dialog state part of the saved data.
- `New Game` and `Restart Game` delete the save. The first save of a game happens
  after its first successful move.
- Flow state is not persisted. A restored game with `hasWon: true` does not show the
  win dialog and is not paused, whether or not `Continue` was pressed before the
  reload.
- The high score keeps its own key and is not part of the saved game.

## Consequences

- Changing the saved shape means a new `SAVED_GAME_VERSION` and either a migration
  for older versions or discarding them; this record is superseded if the rules above
  change.
- Anything that is flow state rather than game data (open dialogs, pending
  confirmations) restores as closed or idle.
- Two tabs of the game overwrite each other's save; the last write wins. Not handled.
