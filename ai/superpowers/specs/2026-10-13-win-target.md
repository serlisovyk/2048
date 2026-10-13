# MY-129 — Win target: the player picks the winning tile, a set of choices per board size (spec)

Issue: MY-129 · Branch: `my-129-win-target` · Plan: `ai/superpowers/plans/2026-10-13-win-target.md`

The winning tile is 2048 on every board. That is too far on 3x3 and too near for a good player on
5x5. This issue makes it a setting: the settings dialog gets a second section, **Win target**, and
every board size has its own three choices.

## Author's answers

From the issue («Решения автора», 2026-10-11 and 2026-10-12) and the orchestrator's brief;
translated, nothing added. All are final.

- The choices depend on the board size and replace the single 1024 / 2048 / 4096 list:
  3x3: 256 / 512 / 1024, 4x4: 1024 / 2048 / 4096 (default 2048), 5x5: 2048 / 4096 / 8192.
- When the board size changes, the target becomes the middle choice of the new size. This also
  settles the issue's item 5 (what to do on 3x3).
- The picker is the same segmented control as the board size (same style, same code), a second
  section after "Board size".
- The current target is visible only in the settings and in the win dialog text
  ("You've reached 512!"). The header and the main screen do not change.
- Changing the target in the middle of a game asks for confirmation (the MY-127 / MY-128 flow);
  cancelling changes nothing.
- The saved game stores the target; an older save (version 1 or 2, no target) loads with the
  default target of its size. The version bump is decided in the plan and recorded.
- README: at most one short line in Features, nothing in Architecture Notes; details go to
  `ai/map.md` and the decision records.
- This issue runs before MY-130 (statistics), not in parallel with it: both change the save and
  the settings. MY-130 adds a move counter to the save later, so the format must make that easy.
- Budget: CSS 3.87 / 4 kB gzip, JS 6.67 / 8 kB. If CSS crosses 4 kB, `.size-limit.json` goes to
  5 kB with a short decision record (the author approved this); this issue owns that change.

From the issue text: the win check and the win dialog text use the chosen target, not a constant;
"Done when": the win dialog appears exactly on the chosen target and its text matches, the target
survives a reload together with the game, a change in the middle of a game asks first, and 3x3 is
clear to the player.

## What the player sees

### The section

- The settings dialog has two sections, **Board size** and **Win target**, in that order, above
  `Close`. Win target is a segmented control of three segments, built exactly like the board size
  one: a filled segment for the current choice, outlined others, hover tint, the shared focus ring,
  44px tall, one radio group named "Win target" for a screen reader.
- The segments show the choices of the **current board size**:

| Board | Segments           | Default (middle) |
| ----- | ------------------ | ---------------- |
| 3x3   | 256 / 512 / 1024   | 512              |
| 4x4   | 1024 / 2048 / 4096 | 2048             |
| 5x5   | 2048 / 4096 / 8192 | 4096             |

- Keyboard: as for the board size: `Tab` to the checked segment, arrows move and select, `Space`
  selects, `Escape` and `Close` close the dialog.
- Picking another board size in the first section makes the choices of the second one change at
  once (the dialog stays open on a fresh game), with the middle one checked.

### Changing the target and the size

| Situation                                       | Result                                                                                                                                            |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pick the target already in use                  | Nothing happens                                                                                                                                   |
| Pick another target on a fresh or finished game | The target is saved, a new game starts at once behind the open dialog                                                                             |
| Pick another target in a game in progress       | The settings closes and "Start a new game?" opens (`Cancel` focused). `New Game`: the target is saved, a new game starts, focus goes to the board |
| ... and `Cancel`, `Escape` or a forced close    | Nothing is saved, the game, the score and the save stay as they were, the settings opens again with the old target checked                        |
| Pick another board size                         | As before, and the target becomes the middle choice of the new size (saved with the size, the question is the one question)                       |

The question and its wording are MY-127's, unchanged: one question covers a size change and the
target reset that comes with it.

### The win and game-over dialogs

- A move that creates a tile equal to the target opens the win dialog: `You Won!` and
  `You've reached <target>!`, `Continue Playing` / `New Game`, as today. Nothing opens one move
  earlier or later; a bigger tile than the target cannot appear before the target does.
- A move that wins **and** ends the game still shows only the game-over dialog, with the line
  `You've reached <target>!` between the title and the text
  (`ai/decisions/2026-10-10-win-and-game-over-same-move.md`). That line follows the target too.
- After `Continue Playing` the game goes on with no second win dialog, as today.

### Reload and old data

| In storage before the first load                                         | Result                                                                                 |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `savedGame` version 3 with its `winTile`                                 | Restored with that target                                                              |
| `savedGame` version 2 (`size`, no target)                                | Restored, the target is the middle choice of its size (3x3: 512, 4x4: 2048, 5x5: 4096) |
| `savedGame` version 1 (no `size`, no target)                             | Restored as 4x4 with 2048                                                              |
| A version 3 save whose `winTile` is not a choice of its size, or missing | Discarded and a new game starts (validate-or-discard, as for any bad field of a save)  |
| `settings` = `{ version: 1, boardSize }` (written before this issue)     | Loads; the target is the middle choice of that size                                    |
| `settings` with a `winTile` that is not a choice of its size             | That one field falls back to the middle choice of the size; the size is kept           |

**A save that disagrees with the stored settings wins**, for the target as for the size
(`ai/decisions/2026-10-12-board-size-records-and-saved-game.md`): the game is restored with its own
size and target and the settings dialog then shows them; the stored `settings` is not rewritten
until the player changes something.

## Stored data

- `savedGame`: version **3**, `{ version, size, winTile, board, score, hasWon }`. Versions 1 and 2
  are read, never written; the next save is version 3.
- `settings`: `winTile` joins the flat object. It is a number from the choices of the saved
  `boardSize`. No `SETTINGS_VERSION` bump: a missing or invalid field reads as its default.
- Records stay one key per size and do not depend on the target.

## Unchanged

- The game rules, scoring, the records, the `New record!` badge, the animations, the header, the
  main screen and the theme. The win tile is still the one a merge creates; the win pause,
  `Continue Playing` and the "win and game over on the same move" rule behave as before.
- No new colour, and (expected) no new CSS: the control and the section already exist.

## Out of scope

- Showing the target on the main screen or in the header (the author said no).
- A custom target, targets other than the three per size, a hint text for 3x3.
- The move counter and statistics (MY-130), which will add a field to the save later.
