# MY-130 — Statistics: a summary of each game and all-time numbers (spec)

Issue: MY-130 · Branch: `my-130-statistics` · Plan: `ai/superpowers/plans/2026-10-13-statistics.md`

Today the only thing the game remembers about past games is the high score. This issue adds a
little progress without turning the game into a dashboard: the win and game-over dialogs show a
summary of the game that just ended, and the settings dialog gets a **Statistics** section with four
all-time numbers.

## Author's answers

From the issue («Решения автора», 2026-10-11 to 2026-10-13) and the orchestrator's brief;
translated, nothing added. All are final.

- The summary in the game-over and win dialogs: **score, number of moves, highest tile**.
- All-time statistics are a "Statistics" section in the settings dialog: **games played, wins,
  best score, best tile** — exactly these four, no win percentage. They are shared by all board
  sizes (the high score of each size stays separate, from MY-128).
- **"Played"** is a game that ended by game over, or one that was left by starting a new game (`New
Game`, a board size change or a win target change) after at least one move. Reloading the page
  does not end a game. **"Win"** is a game in which the target was reached (any size, any target),
  counted once per game: `Continue Playing` does not count it again.
- Stored in `localStorage` with a `version`, validated like the settings (invalid → zeros, no
  errors), through `SafeStorage`.
- Reset with a confirmation through the shared `ConfirmDialogView`; no stacked dialogs: the
  settings closes for the question and reopens on Cancel, as in MY-127 / MY-128.
- The move count of the current game is part of the saved game, so a reload does not reset it:
  `SAVED_GAME_VERSION` becomes 4 with the upgrade `3: (saved) => ({ ...saved, version: 4, moves: 0 })`
  (older saves start counting from 0).
- Budget: JS 7.2 / 8 kB, CSS 3.96 / 4 kB gzip. The author approved raising the limits to 10 kB (JS)
  and 5 kB (CSS) in `.size-limit.json` if this task needs it, each with a short decision record.
- README: at most one short line in Features, nothing in Architecture Notes.

From the issue text: done when, after a few test games, every number agrees with what happened;
the summary is in the win and game-over dialogs; the statistics survive a reload and are cleared
only after a confirmation; a reload in the middle of a game does not change the move count.

## What the player sees

### The summary of a game

The win dialog and the game-over dialog get a row of three numbers between the text and the
buttons, each a small label over a bold value:

| Label        | Value                                                                             |
| ------------ | --------------------------------------------------------------------------------- |
| Score        | the score of the game at that moment                                              |
| Moves        | the moves made in the game: a press that changes nothing is not a move            |
| Highest tile | the largest tile on the board (the target, in the win dialog, when it is reached) |

- In the win dialog the numbers are those of the moment of the win; after `Continue Playing` the
  game goes on and the game-over dialog, if it comes, shows the final ones.
- A move that wins **and** ends the game shows the game-over dialog only
  (`ai/decisions/2026-10-10-win-and-game-over-same-move.md`), with the summary in it.
- Nothing else changes in the two dialogs: the same texts, buttons, focus and `Escape` rules.

### The Statistics section

- The settings dialog gets a third section after Win target: the heading **Statistics**, four
  numbers in a 2×2 grid, each a label over a bold value, in this order: **Games played**, **Wins**,
  **Best score**, **Best tile**; below them the button **Reset statistics**.
- The numbers are plain integers, as the score is. A player who has never played sees zeros. The
  numbers are read when the dialog opens: nothing in the game changes them while it is open.
- The reset button is hidden while all four numbers are 0, as the high score reset is: there is
  nothing to reset.
- A new section changes no existing control: the board size and the win target behave as before.

### What counts, and when

| Event                                                                                        | Games played | Wins | Best score                    | Best tile                            |
| -------------------------------------------------------------------------------------------- | ------------ | ---- | ----------------------------- | ------------------------------------ |
| Any move that changes the board                                                              |              |      | raised if the score is higher | raised if the highest tile is higher |
| The move that reaches the target (the first time in that game)                               |              | +1   |                               |                                      |
| A move that ends the game (game over)                                                        | +1           |      |                               |                                      |
| `New Game` (page button, win dialog), or a size / target change, **after at least one move** | +1           |      |                               |                                      |
| `New Game` on a fresh board; a settings change on a fresh or finished game; `Restart Game`   |              |      |                               |                                      |
| after game over; `Continue Playing`; cancelling any question; reloading the page             |              |      |                               |                                      |

- A game is counted **once**: a game that is over, or has been left by a new one, has already been
  counted, so `Restart Game` after a game over and a settings change on a finished board add nothing.
- A move that reaches the target and ends the game adds a win and a played game.
- The best score and the best tile are the highest over every game and every size, **including the
  game in progress**; they are raised by the move, not at the end of the game, as the high score is.
- A win is counted when the target is reached, a played game when the game ends. So in a game that has been won
  and goes on, wins can be one ahead of games played until that game ends.
- After a reset in the middle of a game the numbers start from 0 again, and the next move raises the best
  score and the best tile to the values of the game in progress.

### Reset

| Situation                                         | Result                                                                                                                                       |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `Reset statistics`                                | The settings closes and "Reset the statistics?" opens (`Cancel` focused). The wording says high scores and the current game are not affected |
| `Reset`                                           | The four numbers become 0 and are saved; the dialog closes and focus goes to the board (as after any confirmed action)                       |
| `Cancel`, `Escape`, a close forced by the browser | Nothing changes; the settings opens again (focus on `Close`)                                                                                 |

Never two dialogs open at once. The reset does not touch high scores, the current game or its save.

### The move count and reloads

| In storage before the first load                                                              | Result                                                                                                            |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `savedGame` version 4 with its `moves`                                                        | Restored with that move count; the next move makes it `moves + 1`                                                 |
| `savedGame` version 3, 2 or 1 (no `moves`)                                                    | Restored; the count starts at 0 (the game still counts as in progress: a save is only written after a first move) |
| A version 4 save whose `moves` is missing, negative or not an integer                         | Discarded and a new game starts (validate-or-discard, as for any bad field of a save)                             |
| `statistics` missing                                                                          | Four zeros                                                                                                        |
| `statistics` with another `version`, not an object, or unreadable JSON                        | Four zeros, no error                                                                                              |
| `statistics` with a field that is not a non-negative integer (best tile: 0 or a power of two) | That field is 0, the others are kept (as a broken setting costs only itself)                                      |
| Storage blocked or full                                                                       | The game and the statistics work in memory for the session; nothing is saved                                      |

Statistics survive a reload; a reload never changes them (it does not end a game).

## Stored data

- `savedGame`: version **4**, `{ version, size, winTile, board, score, moves, hasWon }`. Versions
  1 to 3 are read, never written; the next save is version 4.
- `statistics`: a new key, `{ version: 1, played, wins, bestScore, bestTile }`, written only when
  one of the numbers changes (a best is raised, a win, a game ends, a reset), never at start.
- `settings`, the records and the theme do not change.

## Unchanged

- The game rules, scoring, the high score of each size and the `New record!` badge, animations,
  the header, the board, the win and game-over flow, the existing sections of the settings, the
  confirmation dialog (its markup and view), the theme.
- No new animation, no new font weight; one new colour token, `--summary-bg` (a dark tint under the summary, the
  same in both themes), because white on the win card's gradient is only 3.66:1 at its lightest corner.

## Out of scope

- A win percentage, averages, streaks, charts, a per-size or per-target breakdown, a history of games,
  a way to share results (rejected: `ai/decisions/2026-10-10-rejected-features.md`).
- Statistics in the header or on the board; a live update of the Statistics section while the
  settings is open (nothing changes the numbers then).
- Syncing two open tabs: the last write wins, as for the saved game.
