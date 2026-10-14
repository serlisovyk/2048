# Saves older than version 4 and the old `highScore` key are no longer read; the upgrade table stays

Date: 2026-10-14 · Status: accepted · Supersedes parts of `2026-10-10-saved-game-format.md`,
`2026-10-12-board-size-records-and-saved-game.md`, `2026-10-13-win-target-per-board-size.md` and
`2026-10-13-statistics.md`

## Context

From MY-113 to MY-130 the game wrote saves of versions 1 to 4 and moved a single `highScore` key to the per-size
keys. Each task kept the older data loading: three upgrade steps in the game controller, a migration of the old
record and the constants behind both. The author decided (2026-10-13) that nobody needs the old data any more;
the code that keeps it alive cannot be exercised and sat in the middle of `GameController`.

## Decision

- **Only a version 4 save loads.** Any other version is no save: a new game starts and its first move writes a
  version 4 save. `SavedGameController` reads the save, checks the version and runs it through the upgrade table,
  which is **empty and stays as the mechanism** for the next version: a new field of the save is a version bump
  and one entry, keyed by the version the step starts from (`ai/skills/feature.md`).
- **The old `highScore` key is ignored:** not read, not moved, not removed. A record of a size lives under
  `highScore<size>x<size>` only, and a record read from storage must be a count or it counts as 0.
- **Still in force from the superseded records:** validate or discard, a finished game is not stored, a save wins
  over a disagreeing setting, versions are upgraded by steps (no `if` per version), a record per size, and the
  model's "in progress" as a flag of its own (`Game.#hasBeenPlayed`), not `moves > 0`.
- Rejected: keeping the steps "just in case" (dead code nobody can check) and removing the old key (a write for
  data nobody reads).

## Consequences

- A player who still has a version 1 to 3 save or only the old `highScore` loses that game or record once.
- The settings and the statistics keep their own versions and are not touched.
- Superseded: the migration of the old record and of version 1 saves, the upgrade steps 1 to 3 (once
  `GameController.#SAVE_UPGRADES`) and "version 1 keeps loading".
