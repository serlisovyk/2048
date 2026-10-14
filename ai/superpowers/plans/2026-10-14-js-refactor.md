# MY-137 — JS refactor: conventions, no comments, `controllers/`, `GameController` split, theme script through Vite

Issue: MY-137 · Branch: `my-137-js-refactor` · No spec: no observable behavior changes (the one exception
a player could meet is that saves older than version 4 and the old `highScore` key are no longer read).

Runs after MY-138 (docs) and beside MY-139 (CSS): it touches `src/scripts/`, `src/index.html`, `vite.config.js`,
`.size-limit.json` and the docs, and only the JavaScript part of `ai/rules/style.md`. Out of scope: swipe
multi-touch and the focus after "No" in the settings (MY-141), any text, layout or UX change, CSS comments
(MY-139), the README rewrite (MY-132).

## Why

Twenty-five tasks by different agents left comments everywhere, a `GameController` with five roles
(a move, confirmations, records per size, saves with upgrades, statistics), duplicated validators, dead
parameters and branches, an uneven API of views and inputs, controllers in the root of `scripts/` and an inline
script in `index.html`. The audit of 2026-10-13 lists the places; every finding was re-checked against `main`
before it was acted on.

## Author's decisions (2026-10-13 and 2026-10-14, final)

- No comments in `src/scripts/` and `src/index.html`; the important "why" goes to the docs within the limits of
  `ai/rules/docs.md`. Nothing that lived only in a comment is lost (the map at the end of this plan).
- Code conventions go into the JavaScript part of `ai/rules/style.md` (same name); no new ESLint rules.
- All controllers move to `src/scripts/controllers/`; `GameController` is split into `GameController`,
  `HighScoreController` and `SavedGameController`; `requestMove` becomes clear steps.
- The migration of old saves (versions 1 to 3) and of the old `highScore` key is removed; the upgrade table stays
  for future versions. Only version 4 saves load. A new decision record supersedes the relevant parts of the old
  ones (their `Status` line only).
- The theme head script moves to its own file in `src/scripts/`; a small Vite plugin inlines it into `<head>` in
  `yarn dev` and `yarn build`, and it imports `STORAGE_KEYS` and `THEMES`, so the key literal and the paired
  comments go. A short decision record (it reverses the "plugin declined" note of the theme record).
- The JS size limit goes to 10 kB gzip, with a short record.
- `ai/skills/feature.md` is cut to at most 12 KB while its paths are updated.

## Design

**Folders.** `scripts/controllers/` holds `GameController`, `HighScoreController`, `SavedGameController`,
`SettingsController`, `StatisticsController`, `ThemeController`. `game/Validation.js` is a static class
(`isCount`, `isTile`) used by `Board`, `Game`, `Statistics` and `HighScoreController`. The head script is
`scripts/themeHead.js`, a third non-class module beside `main.js` and `constants.js`.

**`GameController` split.** The game keeps the move guard, the win pause, new game and restart, confirmations
and focus, and the sequence of a move; it asks two collaborators for the rest.

- `HighScoreController({ scoreView, storage })`: `value`, `showSize(size)` (reads the record of a size the first
  time it comes on screen, validated with `Validation.isCount`), `beginGame()`, `resumeGame(score)`,
  `update(score)` (stores a beaten record and shows the badge once), `reset()`. It owns the `New record` flag.
  `requestResetHighScore` stays in `GameController`, which owns the confirmation.
- `SavedGameController({ storage })`: `read()` (version check and the upgrade steps; `#SAVE_UPGRADES` is empty),
  `save(state)`, `clear()`. Storage must not know the game, so this is a controller, not a storage class.
- `requestMove` = guard, `#renderMove`, `#recordMove`, `#showOutcome` (early returns), `#persistGame`.
  `restart()` takes over what `#startNewGame` did, including the pause reset and closing the dialogs (every new game
  goes through it); `restartAndFocus()` is the one place for "restart, then focus the board".

**Model.** The move result is `{ hasMoved, scoreGained, slides, merges, spawnedTiles, hasJustWon, isOver }`
(booleans with `is`/`has`/`can`); `Game`'s private flag is `#hasBeenPlayed`. `Game.restore` also rejects an empty
board. `hasTile` goes: a win is `getHighestTile() >= winTile`. `Settings.isChange` becomes `isNewValue`.

**Views and inputs.** `render*` puts state into the DOM, `show*`/`hide*` are transient decorations, `open`/`close`
are dialogs (`OverlayView`: `openWin`, `openGameOver`, `closeWin`, `closeAll`). `GridView.render` takes the size and
the tiles together, so a resize can never be left without a render. Constructors take one options object; the
New Game button gets a view (`NewGameView.onNewGame`) so `main.js` only wires. `SafeStorage` has one private static
`#attempt(action, fallback)`.

**`main.js`.** No `DOMContentLoaded`; objects grouped by feature; the `start()` order is written out (theme,
settings, statistics, game): settings and statistics load before the game reads and counts into them.

**Theme head script.** `vite.config.js` gets `inlineThemeScript()`: `transformIndexHtml` bundles
`themeHead.js` with esbuild (a new explicit dev dependency: Vite already depends on it), minifies it with terser
(already a dev dependency; `Object.freeze` marked pure so the unused constants fall out) and injects it as an
inline `<script>` at the start of `<head>`, in dev and in build. The "only through `SafeStorage`" exception for
this script stays.

## Where the "why" of the comments goes

Most of it is already in a decision record or a skill; the rest gets a line where it belongs.

- Upgrade table contract, "a save wins over settings", the start order, the confirmation focus rule, the late
  `close` of the confirmation, `settle` re-appending tiles, the `ready` rejection of a View Transition,
  `Settings` taking a value that reads as an allowed one: `ai/skills/feature.md` (one line each, or the
  existing one reworded).
- Why `Game` keeps a flag instead of `moves > 0`: the new decision on old saves; the name `#hasBeenPlayed`.
- The head script's rules (reads only, inside `try/catch`, key from `STORAGE_KEYS`): `ai/rules/oop.md` and the new
  theme-script decision.
- Everything else (records per size, statistics counting, theme reveal, footer separator) stays in its decision.

## Commits (logical, each passes the hook)

1. This plan.
2. Move the controllers to `controllers/` (paths only).
3. Remove the migration of old saves and records (`#migrateLegacyHighScore`, steps 1 to 3, `LEGACY_*`).
4. Split `GameController`; break `requestMove` into steps.
5. `Validation`, dead code and repeats in the model, storage, inputs, views and constants.
6. The conventions pass over every file.
7. The API vocabulary: renames, constructor shape, `NewGameView`, `main.js` regrouped.
8. The theme script through the Vite plugin, in its own commit with the dev dependency.
9. Remove the comments from `src/scripts/` and `index.html`.
10. JS limit 10 kB and its record.
11. Docs: conventions and vocabulary (`style.md`, `oop.md`), paths and classes (`map.md`, `architecture.md`,
    `feature.md` cut to 12 KB, `review.md`, README paths), the two other decision records and the index.

## Verification

`yarn lint`, `yarn format:check`, `yarn build`, `yarn size`; `yarn install --frozen-lockfile` after the new
dev dependency. Then play it in headless Chrome (own profile, debugging port 9431) on `yarn dev` (port 5191) and
`yarn build && yarn preview` (port 5195) at 1000, 375 and 320px in both themes: moves and animations, merges,
the win and `Continue`, game over, new game with its confirmation, settings (size and target, confirmations),
statistics and their reset, the record per size and its reset, a save restored after a reload (a version 4 save
loads, an older one does not), the theme toggle, no wrong-theme frame on a reload with the light theme saved (dev
and prod), keyboard and swipes, the console clean. Then the Definition of Done point by point, a self-review with
the `review` skill, and the report. Stop at the author-approval gate.
