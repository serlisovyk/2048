# MY-128 — Board sizes: 3x3, 4x4 and 5x5, with a high score for each size (spec)

Issue: MY-128 · Branch: `my-128-board-sizes` · Plan: `ai/superpowers/plans/2026-10-12-board-sizes.md`

Today the board is the classic 4x4 only. A 3x3 board gives short, tense games, a 5x5 one long
and calm ones. This issue makes the size a setting, turns on the settings button with "Board
size" as its first section, and keeps everything that belongs to a size (the high score, the
saved game, the layout) per size.

## Author's answers

From the issue (2026-10-11) and the later notes (2026-10-12); translated, nothing added.

- This issue turns on the ⚙ toolbar button: "Board size" is the first section of the settings
  dialog (MY-127 left the button `hidden`).
- The size picker is a segmented control "3×3 | 4×4 | 5×5" in the style of the header buttons,
  the selected one highlighted. Underneath it stays a radio group, so the keyboard (arrows) and
  screen readers work as they do for radios. Colours only through tokens, both themes.
- The default size is 4x4. A change in the middle of a game asks for confirmation first; that
  flow comes from MY-127 and is reused.
- The high score is kept separately for every size (a storage key per size); the existing record
  becomes the 4x4 record. The header shows and resets the record of the current size.
- The saved game stores its size and its `version` goes up; an old save (no size) loads as 4x4.
- The tile text scales with the cell size, so 4 and 5 digit numbers fit on 5x5 at 320px wide;
  everything fits there with no horizontal scroll.
- Later issues, **not built here**, but the model and the save format have to take them easily:
  - MY-129 adds a win target per size (3x3: 256 / 512 / 1024, 4x4: 1024 / 2048 / 4096,
    5x5: 2048 / 4096 / 8192; the middle one when the size changes);
  - MY-130 adds all-time statistics shared by all sizes and a move counter in the save.
- Budget: CSS 3.68 / 4 kB gzip, JS 6.36 / 8 kB. If this issue crosses 4 kB of CSS, the limit goes
  to 5 kB in `.size-limit.json` with a short decision record (the author approved this).

## What the player sees

### The settings button and the section

- The gear button in the header toolbar is shown: the toolbar holds three buttons (new game,
  theme, settings), which fit exactly at 320px (measured in MY-127).
- The settings dialog has one section, **Board size**: a segmented control with three segments,
  `3×3`, `4×4`, `5×5`. The segment of the current size is filled (the primary button colours of
  the dialog: white on the dark card, ink on the light card), the others are outlined; hover
  tints an outlined one. The group has one name, "Board size", for a screen reader, each segment
  is a radio button named `3×3`, `4×4` or `5×5`.
- Keyboard: `Tab` goes to the checked segment, the arrows move and select (as for any radio
  group), `Space` selects. A focused segment shows the same focus ring as the buttons (white in
  the dark theme, ink in the light one). The page's arrow and WASD keys still do not move the
  board while a dialog is open.
- The dialog fits at 320px (three equal segments, each at least 44px high).

### Changing the size

| Situation                                     | Result                                                                                                                                                          |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pick the size already in use                  | Nothing happens                                                                                                                                                 |
| Pick another size on a fresh or finished game | The new size is saved, a new game starts on it behind the open dialog (the board is redrawn, its two tiles pop in)                                              |
| Pick another size in a game in progress       | The settings closes and the "Start a new game?" question opens (`Cancel` focused). `New Game`: the size is saved, a new game starts, focus goes to the board    |
| ... and `Cancel`, `Escape`, or a forced close | Nothing is saved, the board, the score and the saved game stay as they were, the settings opens again with the old size checked. Never two dialogs open at once |
| Reload                                        | The game comes back at its size (the save holds it); with no game to restore, a new one starts at the saved setting                                             |

The question and its wording are MY-127's, unchanged.

### The high score per size

- The High Score box shows the record of the board on screen. Switching size switches the number
  (`0` and no reset icon for a size that was never played).
- Beating a record beats **that size's** record: the `New record!` badge appears once per game,
  only if that size had a record above 0, exactly as before.
- The reset icon in the High Score box resets the record of the current size, after the same
  confirmation. Its text now says which one: it affects this size only, not the others and not
  the game in progress. The other sizes keep their records.
- A win or a loss on one size never touches the record of another.

### Old data

| In storage before the first load of the new version     | Result                                                                                                                                         |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `highScore` = `1234`                                    | The 4x4 record is 1234. The old key is removed once the value is copied, so nothing is migrated twice and a later reset cannot be undone by it |
| `highScore` and a 4x4 record both exist                 | The larger of the two becomes the 4x4 record (an older tab may still have written the old key)                                                 |
| `savedGame` = `{ version: 1, board, score, hasWon }`    | The game is restored as a 4x4 game, board and score intact; the next save is written in the new format                                         |
| `savedGame` of the new version                          | Restored at its own size                                                                                                                       |
| A save with another version, a bad size, or a bad board | Discarded and a new game starts, as before                                                                                                     |

**A save whose size differs from the saved setting** (the settings key was cleared or damaged,
or two tabs disagreed): the **saved game wins**. It is the game the player was in the middle of;
it is restored at its own size and the settings dialog then shows that size. The stored
`settings` is not rewritten until the player changes something. A game is never thrown away
because of a setting.

### The board on each size

The board always fits the screen: no horizontal scroll from 320px up on any size. The cell size
is computed in CSS from the board size and the viewport; the tile text is a share of the cell
size.

| Cell size       | 320px | 375px | 600px and wider                 |
| --------------- | ----- | ----- | ------------------------------- |
| 3x3             | 76.8  | 90    | 100                             |
| 4x4 (unchanged) | 60    | 67.5  | 100                             |
| 5x5             | 47.2  | 58.2  | 80 (60 at 400px, 80 from 555px) |

- 4x4 keeps exactly the cell sizes it has today at every width (measured before and after). 3x3
  is never bigger than 4x4's 100px cell, so it does not become huge on a desktop; 5x5 is capped
  so the board is about as wide as the 4x4 one.
- The tile number is 40%, 35%, 30%, 25% and 20% of the cell for 1-2, 3, 4, 5 and 6 digits (the
  same sizes as today at the 100px cell). On 5x5 at 320px a 4 or 5 digit tile is about 14px and
  12px text and fits its tile.
- The header stays as wide as the board; on 3x3 at 320px it may be a few pixels wider than the
  board if the content needs it (the existing rule: never narrower than its own content).

## Stored data

- `settings` (MY-127): `boardSize` joins the flat object, `3`, `4` or `5`, default `4`. Adding the
  field needs no `SETTINGS_VERSION` bump; a missing or invalid value reads as the default.
- Records: one key per size, `highScore3x3`, `highScore4x4`, `highScore5x5`; a plain number as
  a string, as before. `highScore` is the old key and only exists until it is migrated.
- `savedGame`: version **2**, `{ version, size, board, score, hasWon }`, `size` is `3`, `4` or
  `5` and the board is `size` rows of `size` cells. The version-1 shape is read, never written.
- The settings, the records and the save stay separate keys. A finished game is still not saved.
- MY-129 adds `winTarget` to the settings and the target to the save; MY-130 adds its own
  statistics key and a move count to the save. Each is one more field in a versioned flat
  object that the model validates; the plan (section 10) shows where they go.

## Unchanged

Moves, merges, scoring, spawning (a 2 or a 4 at 10%), game over, the win at 2048 (the target is
2048 on every size until MY-129; on 3x3 the highest reachable tile is 1024, so the win dialog
never appears there until MY-129 lets the target depend on the size), animations and reduced
motion, the keyboard and swipe input, the theme, the confirmations, the high score reset's place
in the header (`ai/decisions/2026-10-11-high-score-reset-stays-in-the-header.md`), the New
record badge's rules, the dialogs' focus rules.

## Out of scope

The win target and anything MY-129 owns; statistics and a move counter (MY-130); a size label on
the High Score box or the board; per-size themes or palettes; a keyboard shortcut for the size;
board sizes other than 3, 4 and 5; automated tests.
