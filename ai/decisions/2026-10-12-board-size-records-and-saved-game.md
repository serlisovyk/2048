# The board size is a setting; each size has its own record; the saved game stores its size and wins over a disagreeing setting

Date: 2026-10-12 · Status: accepted

## Context

MY-128 makes the board 3x3, 4x4 (the default) or 5x5. Everything that belonged to "the" board had a
single copy until now: one `highScore` key, a saved game that was always 4x4 (`version: 1`), one
`BOARD_SIZE` constant. Four things had an obvious alternative: where the records live and what happens
to the old one, what the saved game looks like, which of the saved game and the stored setting wins when
they disagree, and how the game learns the size.

## Decision

- **The size is read from `Settings` where a game starts.** `GameController` takes the same `Settings`
  model as `SettingsController` (`main.js` creates one) and starts a game with
  `game.start(settings.get(SETTING_NAMES.BOARD_SIZE))`; `Game` owns its size (`size`, `start(size)`, the
  state), `GridView.resize(size)` rebuilds the background cells and sets `--board-size`.
  `BOARD_SIZE` is deleted: `BOARD_SIZES` (3, 4, 5) feeds `SETTING_DEFINITIONS` and the saved game's
  validation, and the default is the definition's `defaultValue`. A change still goes through
  `requestChange` → `restart()`, so the new size is just the next game. Rejected: a game object per size
  (it needs a factory and a rewire of every caller), and a second constant for the default.
- **One record per size, one key per size.** `highScore3x3`, `highScore4x4`, `highScore5x5`
  (`STORAGE_KEYS.HIGH_SCORE_PREFIX` and the size), a number as a string, as before. A size's record is read
  when the size comes on screen and kept for the session; the larger of the session's and the stored value
  is used, so a record still stands when storage is blocked and another tab's higher record is not
  overwritten. The header shows, beats and resets the record of the size on screen; the New record badge is
  derived from that record (`2026-10-10-new-record-badge.md`), and the reset prompt says it affects this size
  only. Rejected: one JSON object of records under a key (a write in one tab would lose another size's value
  written in another), and a size label on the High Score box (not asked for).
- **The old record becomes the 4x4 record, once.** On `start()`, if the old `highScore` key exists, the 4x4 key
  gets the larger of the two values and the old key is **removed**. The removal is what makes it "once" and
  what stops a stale old key from undoing a later reset of the 4x4 record; the `max` covers an older tab that
  wrote the old key after the new one existed. A garbage old value counts as 0 and is removed too. The
  migration is in `GameController` (a use case), not in `SafeStorage` (it knows no game).
- **The saved game is version 2: `{ version, size, board, score, hasWon }`.** `Game.restore` validates the
  size (`BOARD_SIZES.includes`), then a board of `size` rows of `size` cells, and adopts the size only when
  everything passed. The controller owns the envelope: `#readSavedGame` reads version 2 as it is, version 1
  (`LEGACY_SAVED_GAME_VERSION`) as the same object with `size: LEGACY_BOARD_SIZE` (4), anything else as no
  save. A version 1 save is read, never written: the next move rewrites it as version 2. Validate-or-discard
  of `2026-10-10-saved-game-format.md` stays (a bad size, a board of the wrong shape or no moves left discards
  the save and starts a new game). Rejected: a migration step in the model (it never knew versions), discarding
  version 1 saves (players would lose games for an upgrade).
- **A save that disagrees with the stored setting wins.** The game restored is the one the player was in the
  middle of, so it is restored at its own size and `GameController` sets the **in-memory** setting to it (the
  settings dialog renders from the model and so shows the size on the board). The stored `settings` key is not
  rewritten until the player changes something. How it can happen: the `settings` key was cleared or damaged
  while the save stayed, or a second tab changed the size; a normal change cannot cause it, because it ends in
  `restart()`, which deletes the save. Rejected: discarding the save (a game lost for a mismatch the player
  cannot see and did not cause); keeping the setting and the save apart (the dialog would show 4x4 over a 5x5
  board and choosing "4x4" would do nothing because it is "unchanged"); writing the settings from the game
  controller (`SettingsController` stays the only writer of that key).
- **How MY-129 and MY-130 extend it.** The win target is another setting; its allowed values depend on the size
  (a method of `Settings`, fields are read in table order) and `Game` takes it the way it takes the size. It is
  one more field of the saved game, so the version goes to 3 and `#readSavedGame` gives a version 2 save the
  default target of its size. The statistics are shared by all sizes and live under a key of their own; the move
  counter is one more field of the game state and the save (a version bump, default 0 for older saves). The
  records per size stay as they are.

## Consequences

- The win target is still 2048 on every size, so a 3x3 game cannot be won until MY-129 (its highest tile is
  1024); games there end in the game-over dialog.
- A player who goes back to an older build finds the old `highScore` key gone and the new saves unreadable (the
  old build discards version 2); there is no downgrade path. Accepted, as with any versioned save.
- Records, the save and the settings stay three separate keys, so none of them can break another; clearing one
  has a defined result (a missing `settings` key is the default size, a missing record is 0, a missing save is a
  new game).
- Refines `2026-10-10-saved-game-format.md` (the version 2 it promised and the version 1 rule it kept),
  `2026-10-11-settings-dialog-and-storage.md` (the game now reads the settings) and
  `2026-10-11-high-score-reset-stays-in-the-header.md` (the reset hits the current size's record, as it said it
  would).
- Checked in headless Chrome 155 (dev server and production build): the old record and a version 1 save in storage
  before the first load, the larger-value rule, a garbage old record, a version 1 save against `settings` = 5,
  a version 2 save with no settings key, bad sizes and boards, corrupted settings, blocked storage (the game
  starts, records stand in the session), a reload on each size, the badge per size and the reset per size. Not
  checked: Safari, Firefox, a real screen reader.
