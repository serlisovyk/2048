# Statistics: what is counted and when, the stored numbers, the move count in the save (version 4), and the summary of a game

Date: 2026-10-13 · Status: accepted

## Context

Until MY-130 the only thing the game remembered about past games was the high score of each board size. The issue
adds a summary of the game that just ended (score, moves, highest tile) to the win and game-over dialogs and four
all-time numbers to the settings (games played, wins, best score, best tile). A number is only worth showing if a
player can check it against what happened, so what each one means and when it moves had to be fixed in writing, with
the places where an obvious alternative existed: when a game "counts as played", when a win is counted, whether a
best includes the game in progress, whether the numbers are per board size, where they are stored and how, how the
move count survives a reload, and how the reset asks.

The author's answers (2026-10-11 to 2026-10-13, all final): exactly four numbers and no win percentage; shared by all
board sizes (the high scores stay per size); "played" is a game over, or a new game (`New Game`, a size change, a
target change) after at least one move, and a reload does not end a game; stored in `localStorage` with a `version`,
validated like the settings; reset with a confirmation; the move count is part of the saved game; the JS limit may
go to 10 kB and the CSS limit to 5 kB, each with a record; at most one short line in the README's Features.

## Decision

- **The definitions.**

  | Event                                                                                     | Played | Wins | Best score | Best tile |
  | ----------------------------------------------------------------------------------------- | ------ | ---- | ---------- | --------- |
  | A move that changes the board                                                             |        |      | raised     | raised    |
  | The move that reaches the target, the first time in that game                             |        | +1   |            |           |
  | A move that ends the game (game over)                                                     | +1     |      |            |           |
  | `New Game`, a size change or a target change, **after at least one move**                 | +1     |      |            |           |
  | `New Game` on a fresh board, `Restart Game` after a game over, `Continue Playing`, cancel | -      | -    | -          | -         |
  | Reloading the page                                                                        | -      | -    | -          | -         |

  A game is counted **once**: a game over has been counted, so the `Restart Game` after it adds nothing; a
  restored game counts as in progress (a save is only written after a first move), so `New Game` on it adds one.
  A move that reaches the target and ends the game adds a win and a played game and shows only the game-over
  dialog (`2026-10-10-win-and-game-over-same-move.md`).

- **A win is counted when the target is reached, a played game when the game ends.** So a game that was won and
  goes on has one more win than it has played games until it ends. Counting the win at the end would lose it for a
  player who wins, continues and closes the tab; counting the played game at the win would count `Continue` twice.
  Rejected: counting a win only when the game ends.
- **The bests include the game in progress and are raised by the move**, as the high score is, not at the end of
  the game. A player who closes the tab at 4096 has still reached 4096. Rejected: raising them at the end of a game
  (a left game would not count, and the best tile would disagree with what was on the screen).
- **Shared by every board size and target.** One object under its own key, `statistics`. Rejected: per-size or
  per-target numbers (more than the four the author asked for, and the per-size record is the high score).
- **The "played" count has one place in the code.** `GameController.#startNewGame` is where every way to a new
  game ends (the page button after its question, the win dialog's `New Game`, a changed setting after its question,
  the first start), so it asks `Game.isInProgress` there and tells the statistics. Rejected: counting at each caller
  (it would be missed or doubled the next time a way to a new game is added).
- **A model and a controller of their own.** `game/Statistics.js` holds the four numbers and counts what it is told
  (no DOM, storage, version or timers); `StatisticsController` loads, applies the events the game controller
  reports and saves, and is the only writer of the key; it is not folded into `GameController` (which is already the
  largest class) or into `SettingsController` (the numbers are not settings, and the game controller needs them
  before the settings dialog exists). The controller writes only when something changed (most moves change
  nothing); a reset writes zeros instead of removing the key, so there is one write path and a missing key reads
  as the same four zeros.
- **The stored format: `{ version: 1, played, wins, bestScore, bestTile }` under `STORAGE_KEYS.STATISTICS`.**
  Another version, a missing key, a non-object or unreadable JSON gives four zeros and no error; a field that is
  not a non-negative safe integer (the best tile: 0 or a power of two) costs only itself, as in `Settings.restore`.
  The key is never written at start. A new number is a field with a zero default and needs no bump; changing what a
  number means does. Rejected: validating by throwing and catching (every value of the stored blob is safe by
  construction), and a migration of the high scores into the statistics (they are different data).
- **The saved game is version 4: `{ version, size, winTile, board, score, moves, hasWon }`.** `Game` counts the
  moves that changed the board (a press that changes nothing is not a move), exports them and validates them on
  restore (a non-negative safe integer; a missing, negative or fractional `moves` in a version 4 save discards the
  save, as for any bad field). The upgrade is one entry in `GameController.#SAVE_UPGRADES`:
  `3: (saved) => ({ ...saved, version: 4, moves: 0 })`, so a version 3 (or 2, or 1) save loads and counts its
  moves from the reload on. A game saved before this change therefore shows fewer moves than were really made: the
  number cannot be recovered, and a lower number is better than discarding the game.
- **`Game.isInProgress` keeps its own flag and does not become `moves > 0`.** A restored version 3 save has 0 moves
  and still is a game that has had moves; the confirmation before `New Game` and the "played" count both need that.
  This supersedes the remark in `2026-10-10-confirm-dialog.md` that a move counter "instead of a flag" was
  rejected because nothing needed the number: the number is needed now, and the flag is still needed beside it.
- **The summary is read from the game, after the move**, so the dialogs and the statistics see the same numbers:
  `score`, `moves` and the highest tile on the board (`Board.getHighestTile()`; a tile only ever merges into a larger
  one, so it is the highest the game has reached). In the win dialog they are those of the moment of the win; after
  `Continue Playing` the game-over dialog shows the final ones. The markup is a `<dl class="game-summary">` in each of
  the two dialogs (two small copies: a view that moves one element between dialogs would be more code than the
  repeat), its `<dd data-summary="…">` empty and written by `OverlayView` before `showModal()`. Nothing else in the
  two dialogs changed.
- **One colour token for the summary: `--summary-bg`, `rgba(0, 0, 0, 0.2)`, the same in both themes.** White on the
  win card's gradient is 3.66:1 at its lightest corner, below the 4.5:1 that small text needs, and lowering the
  label's opacity would make it worse; the summary sits on a dark tint instead, which gives 5.33:1 there (8.59:1 at
  the darkest corner, 12.3 to 13.6:1 on the game-over card over either page colour). The tint is the same in both
  themes because the win and game-over cards are (`theme.css`). The plan had said no new colour; this is the one.
- **The Statistics section is not a setting.** It is markup in the settings dialog (a `<dl class="statistics">`, a
  2×2 grid of a label over a bold value, the same look as the summary) and two `SettingsView` methods
  (`renderStatistics`, `onResetStatistics`); no entry in `SETTING_DEFINITIONS`, no key in `settings`, no new game.
  The numbers are rendered each time the dialog is opened or redrawn; nothing changes them while it is open. The
  reset button is hidden while all four are 0, as the high score's is.
- **The reset follows the rule of every action from the settings.** `requestResetStatistics()` closes the settings,
  asks through `ConfirmDialogView` (`Reset the statistics?`, "High scores and your current game are not affected"),
  reopens the settings on "no" (`Cancel`, `Escape` or a forced close) and on a "yes" zeroes the four numbers,
  saves, and moves focus to the board. The close-ask-reopen step that `requestChange` had inline is now the private
  `SettingsController.#askFromSettings(prompt)`, used by both: the second caller the skill said to wait for. Never
  two dialogs open at once (`2026-10-11-settings-dialog-and-storage.md`). The reset touches nothing else: not the
  high scores, not the current game or its save.

## Consequences

- **Budget.** JS 7.92 kB of 8 (the model, the controller, the summary and the section together: about 0.7 kB), CSS
  4.07 kB of 5 after raising its limit (`2026-10-13-css-size-limit-5-kb.md`; 3.96 kB before). The JS limit was
  **not** raised: the author's 10 kB was a ceiling for the case that the issue crossed 8, and it did not, so no
  `…-js-size-limit-10-kb.md` exists. It leaves 0.08 kB: the next change that adds JavaScript has to raise the limit
  (to the 10 kB the author named) with its own record.
- **After a reset in the middle of a game** the numbers start from 0, and the next move raises the best score and
  the best tile to the values of the game in progress.
- Two open tabs overwrite each other's statistics and save (the last write wins), as for the save before; not
  handled.
- A win is counted when the target is reached and a played game when the game ends, so wins can be one ahead of
  played games for a game that is won and continued.
- The summary and the section have no animation and no live region: the dialogs are read in order by a screen
  reader (a dialog named by its heading, then the `<dl>` as term and definition pairs), and the settings numbers do
  not change while the dialog is open.
- Not done, by decision: a win percentage, averages, streaks, charts, per-size breakdown, history, sharing
  (`2026-10-10-rejected-features.md`).
- Refines `2026-10-10-saved-game-format.md` (version 4), `2026-10-12-board-size-records-and-saved-game.md` and
  `2026-10-13-win-target-per-board-size.md` (both said the move counter would be one more field and one more
  upgrade step), `2026-10-11-settings-dialog-and-storage.md` (the statistics reset is the action inside a section it
  predicted; the shared step is extracted), `2026-10-11-high-score-reset-stays-in-the-header.md` (the statistics
  reset does belong in the settings), `2026-10-10-confirm-dialog.md` (above) and
  `2026-10-10-win-and-game-over-same-move.md` (the summary is in the game-over dialog of that move).
- Checked in headless Chrome 155 (dev server and production build): 14 natural games in a row on all sizes and
  targets (game over, `New Game`, target and size changes with their questions, `Cancel` on each, a fresh board's
  `New Game`, `Restart Game`), after each the four numbers and the summary compared with an independent oracle (the
  tiles on screen, the header's score, the number of presses that changed the board); the win dialog and the game-over
  dialog with the summary, a win and `Continue Playing` then a game over, a win and the dialog's `New Game`, a win and
  a game over on one move; a reload in the middle of a game (moves kept, the next move +1, a press that changes nothing
  adds none) and after a win (nothing counted twice); saves of versions 1, 2 and 3 (moves 0, still in progress) and a
  version 4 save with a missing, negative, fractional, string or null `moves` (discarded); the statistics key
  missing, `null`, an array, a string, a number, corrupted, an empty string, another or a non-numeric version,
  negative, fractional, string, unsafe and non-power-of-two fields (zeros or only that field zero, no console error,
  the game starts); blocked storage (counted and reset in memory); the reset with `Cancel`, `Escape` and a confirm
  (one dialog open at any time, focus on `Close` after a "no", on the board after a "yes", high scores and the save
  untouched); keyboard in the settings (`Tab` order over the two radio groups, the reset button and `Close`,
  `Enter` and `Space` on the reset button, `Escape` returning focus to the gear); the accessibility tree; contrast
  of the labels in both themes and on both cards; both themes at 1000, 375 and 320px (the settings fits at
  320×568 and scrolls inside the dialog at 320×480 and 568×320, `Close` reachable); six- and seven-digit numbers
  at 320px. Not checked: Safari, Firefox, a real screen reader.
