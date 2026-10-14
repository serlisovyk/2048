# Decisions

Durable project decisions: why a choice was made, with a date. One decision per file,
named `YYYY-MM-DD-<slug>.md`. Format: `Context` → `Decision` → `Consequences`; short and
specific (about 30 lines, `ai/rules/docs.md`), with no check logs and no size budgets.

How this differs from `ai/rules/`: **rules** state what to do now (current law, rewritten
as it changes). **Decisions** state _why_, with a date. A record's text is not rewritten
or deleted; only its `Status` line changes.

The point: an agent (or a human) does not relitigate settled questions or "helpfully"
restore something that was deliberately rejected.

## Changing a decision

A refinement or a reversal is a **new record** that restates what stays in force, so the
reader needs only the newest one. The old record only changes its `Status` line to
`superseded by <file>`. Do not add "Refined by" notes: the ones in older records stay as
they are, and those records can be partly out of date — the newest record wins.

## When to add a record

Propose one as soon as the decision surfaces, without being asked, and only for:

- a standing constraint ("we will not do X", "always / never Y");
- a feature the author deliberately rejected;
- a tradeoff accepted over a named alternative, one a future agent would likely undo.

Not decisions: one-off task details, plain current-state facts, a choice nobody would
reverse, anything `ai/rules/` and `ai/map.md` already cover. Do not create noise records.

## Records

### Project and process

- [Vanilla JavaScript, no UI framework, no TypeScript](2026-10-10-vanilla-js-no-framework.md)
- [No automated tests](2026-10-10-no-automated-tests.md)
- [All sources in `src/`, Vite `root: 'src'`](2026-10-10-sources-in-src.md)
- [Object-oriented architecture](2026-10-10-oop-architecture.md)
- [Merge locally into `main`, no pull requests](2026-10-10-local-merge-without-pr.md)
- [Deployed on Vercel through its Git integration](2026-10-10-vercel-deploy.md)
- [No `@vitejs/plugin-legacy`, Vite's default browser target](2026-10-10-no-legacy-plugin.md)
- [No Dependabot, dependencies are updated by hand](2026-10-10-no-dependabot.md)
- [License in `package.json` only, no `LICENSE` file](2026-10-10-license-in-package-json.md)
- [Features the author rejected](2026-10-10-rejected-features.md)
- [The CSS size limit goes from 4 kB to 5 kB](2026-10-13-css-size-limit-5-kb.md)
- [The JavaScript size limit goes from 8 kB to 10 kB](2026-10-14-js-size-limit-10-kb.md)
- [Line endings are left to git and Prettier, no `.gitattributes`](2026-10-14-line-endings-left-to-git.md)
- [No `browserslist`, Autoprefixer and the build use their defaults](2026-10-14-no-browserslist.md)

### Game, saves and statistics

- [Keyboard input is matched by `event.code`](2026-10-10-keyboard-by-event-code.md)
- [Saved-game format; a finished game is not stored](2026-10-10-saved-game-format.md)
- [A move that wins and ends the game shows only the game-over dialog](2026-10-10-win-and-game-over-same-move.md)
- [Tiles are elements over a background grid, animated from the move result](2026-10-10-tiles-over-the-grid.md)
- [A press during a tile animation finishes it and is applied at once](2026-10-10-input-during-tile-animation.md)
- [Board size is a setting; a record per size; the saved game stores its size](2026-10-12-board-size-records-and-saved-game.md)
- [Win target is a setting, three choices per board size; saves upgraded step by step](2026-10-13-win-target-per-board-size.md)
- [Statistics: what is counted and when, the move count (save version 4), the game summary](2026-10-13-statistics.md)
- [Saves older than version 4 and the old `highScore` key are no longer read; the upgrade table stays](2026-10-14-no-migration-of-old-saves.md)

### Dialogs, controls and accessibility

- [Modal dialogs are native `<dialog>` elements](2026-10-10-native-dialog.md)
- [One reusable confirmation dialog, answered with a Promise](2026-10-10-confirm-dialog.md)
- [Hidden debounced live region for the score; one focus ring for every button](2026-10-10-score-live-region-and-focus-ring.md)
- [The focus ring is a plain `:focus-visible` outline; a transition never uses `all`](2026-10-14-plain-focus-ring.md)
- [One header with an icon toolbar; icons are inline SVG](2026-10-10-header-toolbar.md)
- [The score pop is a separate `aria-hidden` element, one at a time](2026-10-10-score-pop.md)
- [The New record badge is a transient `aria-hidden` flag, spoken once in the score](2026-10-10-new-record-badge.md)
- [Double-tap zoom is stopped with `touch-action`, not a viewport zoom lock](2026-10-10-no-viewport-zoom-lock.md)
- [The high score reset stays next to the high score, not in the settings](2026-10-11-high-score-reset-stays-in-the-header.md)
- [The settings dialog is built before its first section; one dialog at a time; one `settings` object](2026-10-11-settings-dialog-and-storage.md)
- [The footer year is written by a view; the GitHub link is a row of its own](2026-10-13-footer-and-github-link.md)
- [The settings reopen after their questions, with focus on what was used, and open on the first group](2026-10-14-settings-reopen-after-a-question.md)
- [A swipe is read on the whole page; `touch-action: pinch-zoom` keeps pinch zoom](2026-10-14-swipe-on-the-whole-page.md)
- [The GitHub link is last in the DOM and first on screen](2026-10-14-github-link-after-the-game.md)
- [The score is announced as `Score N`; the board is a named group](2026-10-14-score-announcement-and-board-name.md)

### Look: theme, colours, type, geometry

- [JS passes shared numbers to CSS through custom properties](2026-10-10-css-custom-properties-from-js.md)
- [Theme is `data-theme` set by a head script, colour tokens in two files](2026-10-10-theme-tokens-and-head-script.md)
- [The head script is its own file, inlined into `<head>` by a Vite plugin](2026-10-14-theme-head-script-vite-plugin.md)
- [The theme reveal is a View Transition, a progressive enhancement](2026-10-10-view-transitions-progressive-enhancement.md)
- [One tile palette in two ramps, a shared sheen, a base-rule fallback](2026-10-10-tile-palette.md)
- [Rubik, self-hosted, Latin only, with tabular digits](2026-10-10-self-hosted-font.md)
- [Cell size follows board size and viewport; the size picker is a segmented control](2026-10-12-board-geometry-per-size.md)
- [The board is sized by the window width and height, up to about 600px; a short landscape window puts the header beside it](2026-10-14-board-fits-the-window.md)
- [Tile text reaches 4.5:1 against both ends of the tile gradient](2026-10-14-tile-text-contrast.md)
- [Font sizes, radii, shadows and durations come from scales in `theme.css`](2026-10-14-css-token-scales.md)

### Link preview

- [The link preview image is a hand-made PNG in `public/`, no generator](2026-10-12-og-preview-image.md)
- [The link preview also has `og:site_name` and the `twitter:*` tags](2026-10-13-complete-link-preview-tags.md)
