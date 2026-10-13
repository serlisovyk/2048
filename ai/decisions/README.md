# Decisions

Durable project decisions. One decision per file, named `YYYY-MM-DD-<slug>.md`.

How this differs from `ai/rules/`: **rules** state what to do now (current law,
rewritten as it changes). **Decisions** state _why_ a choice was made, with a date —
they are appended, never rewritten. If a decision is reversed, add a new record and
mark the old one `Status: superseded by <file>`; do not delete it.

Format: `Context` → `Decision` → `Consequences`. Short and specific.

The point: an agent (or a human) does not relitigate settled questions or
"helpfully" restore something that was deliberately rejected.

## When to add a record

Propose one **as soon as the decision surfaces** — in conversation or in a change —
without being asked:

- a standing constraint ("we will not do X", "always / never Y");
- a feature the author deliberately rejected;
- a tradeoff accepted over a named alternative;
- a target agreed now, implemented later (`Status: accepted (not implemented)`);
- a convention chosen where an obvious alternative existed.

Not decisions: one-off task details, plain current-state facts, or anything
`ai/rules/` and `ai/map.md` already cover. Do not create noise records.

## Records

- [2026-10-10 — vanilla JavaScript, no UI framework, no TypeScript](2026-10-10-vanilla-js-no-framework.md)
- [2026-10-10 — no automated tests](2026-10-10-no-automated-tests.md)
- [2026-10-10 — deployed on Vercel through its Git integration](2026-10-10-vercel-deploy.md)
- [2026-10-10 — merge locally into `main`, no pull requests](2026-10-10-local-merge-without-pr.md)
- [2026-10-10 — features the author rejected](2026-10-10-rejected-features.md)
- [2026-10-10 — object-oriented architecture](2026-10-10-oop-architecture.md)
- [2026-10-10 — all sources in `src/`, built with Vite `root: 'src'`](2026-10-10-sources-in-src.md)
- [2026-10-10 — JS passes shared numbers to CSS through custom properties](2026-10-10-css-custom-properties-from-js.md)
- [2026-10-10 — license declared in `package.json` only, no `LICENSE` file](2026-10-10-license-in-package-json.md)
- [2026-10-10 — no `@vitejs/plugin-legacy`, Vite's default browser target](2026-10-10-no-legacy-plugin.md)
- [2026-10-10 — no Dependabot, dependencies are updated by hand](2026-10-10-no-dependabot.md)
- [2026-10-10 — keyboard input is matched by `event.code`](2026-10-10-keyboard-by-event-code.md)
- [2026-10-10 — saved-game format, and a finished game is not stored](2026-10-10-saved-game-format.md)
- [2026-10-10 — double-tap zoom is stopped with `touch-action`, not a viewport zoom lock](2026-10-10-no-viewport-zoom-lock.md)
- [2026-10-10 — modal dialogs are native `<dialog>` elements](2026-10-10-native-dialog.md)
- [2026-10-10 — a move that wins and ends the game shows only the game-over dialog](2026-10-10-win-and-game-over-same-move.md)
- [2026-10-10 — one reusable confirmation dialog, answered with a Promise](2026-10-10-confirm-dialog.md)
- [2026-10-10 — the score is announced through a hidden, debounced live region; one focus ring for every button](2026-10-10-score-live-region-and-focus-ring.md)
- [2026-10-10 — one header with an icon toolbar; icons are inline SVG](2026-10-10-header-toolbar.md)
- [2026-10-10 — one tile palette in two ramps, a shared sheen, and a base-rule fallback](2026-10-10-tile-palette.md)
- [2026-10-10 — the score pop is a separate `aria-hidden` element, one at a time, and fades in place under reduced motion](2026-10-10-score-pop.md)
- [2026-10-10 — Rubik, self-hosted, Latin only, with tabular digits](2026-10-10-self-hosted-font.md)
- [2026-10-10 — the New record badge is a transient `aria-hidden` flag; the record is spoken once, inside the score announcement](2026-10-10-new-record-badge.md)
- [2026-10-10 — the theme is a `data-theme` attribute set by a head script, with colour tokens in two files; the head script is the one direct `localStorage` read](2026-10-10-theme-tokens-and-head-script.md)
- [2026-10-10 — the theme reveal is a View Transition, a progressive enhancement over an instant switch](2026-10-10-view-transitions-progressive-enhancement.md)
- [2026-10-10 — tiles are elements over a background grid; a move is animated from the model's result](2026-10-10-tiles-over-the-grid.md)
- [2026-10-10 — a press during a tile animation finishes the animation and is applied at once](2026-10-10-input-during-tile-animation.md)
- [2026-10-11 — the high score reset stays next to the high score; it does not move into the settings](2026-10-11-high-score-reset-stays-in-the-header.md)
- [2026-10-11 — the settings dialog is built before its first section; one dialog at a time; one `settings` object](2026-10-11-settings-dialog-and-storage.md)
- [2026-10-12 — the board size is a setting; a record per size; the saved game stores its size and wins over a disagreeing setting](2026-10-12-board-size-records-and-saved-game.md)
- [2026-10-12 — the cell size follows the board size and the viewport; tile text is a share of the cell; the size picker is a segmented control over radios](2026-10-12-board-geometry-per-size.md)
- [2026-10-13 — the win target is a setting with three choices per board size; the saved game is version 3 and is brought up to date step by step](2026-10-13-win-target-per-board-size.md)
