---
name: review
description: Use to self-review a diff in the 2048 repo for regressions, scope creep, accessibility, and docs drift before reporting a change done.
---

# Review

## When to use

Self-review pass before handing over any non-trivial change, per `ai/workflow.md`.

## Checklist

- **Gameplay**: moves, merges (no double merge in one move), scoring, spawning, win
  at the target tile, `Continue`, game over, high score — still correct? The New record
  badge shows once per game, only when the record was above 0, and starts over after
  `New Game`, `Restart Game`, and the high score reset.
- **Statistics**: a game is counted as played once (a game over, or a game left by `New Game`, a size or a
  target change after at least one move; a fresh board, a `Restart Game` after a game over and a reload add
  nothing), a win once per game (`Continue Playing` does not count it again; a win that ends the game on the same
  move adds a win and a played game), the bests are raised by the move and include the game in progress; the
  summary in the win and game-over dialogs equals the header's score, the presses that changed the board and the
  largest tile on it; the reset asks first, never shows two dialogs, reopens the settings on "no", and touches
  neither the high scores nor the game.
- **Input**: keyboard and swipe both still go through the single movement guard;
  nothing moves while a dialog is open or after game over; a press during an animation
  is applied at once (no lock, no queue, no dropped move).
- **Tile animation**: the merge pop only on real merges (none after a plain slide or
  after a reload), slide then merge pop then new tile, a tile element never changes its
  value, no tile trails its cell while the window is resized, no stray or hidden tile
  element after a burst of presses, reduced motion changes the board at once, and the
  tiles stay in row-major order in the DOM once a move settles.
- **OOP** (`ai/rules/oop.md`): one class per file in the right layer; state in
  private fields, no internal arrays handed out; dependencies through the
  constructor; no `document.querySelector` outside `main.js`; no speculative base
  classes or factories.
- **Boundaries**: model (`game/`) free of DOM, storage, and timers; views free of
  game rules; no inline styles (custom properties for numbers excepted) or
  handlers; no game state on `window`.
- **Single sources**: no duplicated literals for size, thresholds, timings, storage
  keys, or the target tile; JS timings match CSS durations.
- **Storage**: every read/write wrapped and validated; old saved data still loads or
  is safely discarded. Settings: one `settings` object with a `version`, a broken field falls
  back to its default, a damaged or missing blob never stops the game, nothing is written until
  a setting changes. Board size: a record per size under its own key (the old `highScore` moved
  to the 4x4 one once, then removed), a save that disagrees with the stored setting wins and
  nothing is written for it. Saved game: version 4 with its `size`, `winTile` and `moves`, older versions
  loaded through `#SAVE_UPGRADES` (version 1 as 4x4, version 2 with the middle target of its size,
  version 3 with 0 moves, still a game in progress), an unknown or newer version, a bad size, a
  target the size does not offer and a `moves` that is not a non-negative integer all discard the
  save. Statistics: one `statistics` object with a `version`, four numbers, a broken field costs
  only itself and anything unreadable is zeros, written only when a number changes and never at
  start. Win target: the choices of the current size only, the middle one after a size change, the
  win dialog and the game-over note name the target, and the win fires on the tile equal to it,
  not before.
- **Accessibility**: buttons have names (an icon-only button has an `aria-label` and a
  `title`; its icon is inline SVG with `aria-hidden="true"`), focus is visible and returns to the board
  after dialogs, `prefers-reduced-motion` respected for new animation (including
  `::backdrop`). Every button and link (the GitHub icon: `rel="noopener"`, a label that says
  it opens a new tab) shows the one shared focus ring on keyboard focus and
  none on a mouse click (no per-button `outline` override), the board shows none, and
  a changing value is announced once through a polite live region, not on every
  update. A decoration that repeats that value (the score `+N` pop) is `aria-hidden`,
  outside the live region, and still visible under reduced motion (without movement),
  never gone at once. The `New record!` badge is `aria-hidden` and static under reduced
  motion, never covers a button or shifts the header, and the record is spoken once
  inside the score announcement, not by a second live region.
- **Dialogs**: native `<dialog>` opened with `showModal()`, never two open at once (a question
  asked from the settings closes it first and reopens it on "no", showing the stored value),
  `Escape` does what the dialog's purpose says, the page behind is dimmed and inert. A settings
  section is never an empty placeholder; a choice among a few options keeps real radio inputs
  (arrows, `Tab`, a named group) with a focus ring on the drawn segment.
- **Responsive**: 320px wide to desktop on every board size, no horizontal scroll, swipes work
  on touch; the cell size of 4x4 is unchanged (it is the reference for the others). The GitHub icon
  row and the footer never overlap the header or the board, the footer is as wide as the board,
  and with no spare height the footer follows the board (the page scrolls).
- **Tile colours**: only tokens in `tiles.css` (no literals in the per-value rules),
  the base `.tile[data-value]` rule first and no `:not()` chain, text at least
  3:1 on both ends of the gradient for every value, the widest number (six digits)
  fits its tile at 320px on every board size (5x5 has the smallest cell).
- **Colours and theme**: no colour literal in `src/styles/` outside `theme.css` and
  `tiles.css` and none in JS (grep `#`, `rgb(`, `hsl(`); every new token has a dark value
  and a light value (or a deliberate "same in both"); text contrast checked in both themes
  (4.5:1 normal text, 3:1 large bold text and UI parts); both themes looked at at desktop
  and 320px, including the dialogs, the badge and the `+N` pop; the two `theme-color`
  metas still equal each theme's `--page-bg`; no `prefers-color-scheme` block in the
  stylesheets; the inline head script still only reads, in `try/catch`, with a key equal to
  `STORAGE_KEYS.THEME` (and no other direct `localStorage` use); the switch works with the
  View Transitions API absent and under reduced motion, and shows no wrong-theme frame on
  load.
- **Link preview**: a change to the tile palette, the logo gold, a page colour or the
  author's name means `public/og-image.png` and `src/favicon.svg` were remade (and the GitHub
  social preview re-uploaded) by the recipe in `ai/map.md`; the `og:*` and `twitter:card` URLs in
  `index.html` are absolute, the declared width and height equal the file's, and no image
  went into `dist/assets/` or a `size-limit` entry.
- **Typography**: one family set on `body` only, no `font-family` or per-element
  `tabular-nums` elsewhere, weights 400 and 700 only; the font is the self-hosted woff2
  (no third-party request in the Network tab, one font request from the game's own
  origin); `line-height` is pinned on `body` so the height does not move when the font swaps
  in, digits do not change the width of the score; the font stays inside its own
  `size-limit` entry.
- **Scope**: nothing from `ai/rules/scope.md` or
  `ai/decisions/2026-10-10-rejected-features.md` slipped in; no unrelated rewrites.
- **Dead code**: removed behavior left no unused functions, classes, styles, or
  constants.
- **Docs drift**: `README.md`, `ai/map.md`, `ai/rules/*`, `ai/skills/*` still match
  the code; a new `ai/decisions/` record if a durable decision was made.

## Verification gaps to catch

- Build green but the change was never played in the browser.
- Checked on desktop only — never with swipes at mobile width.
- Animation checked only with motion enabled.

## Report

State what was checked and what was found — fix it or say plainly why a finding is
being left alone, per `ai/workflow.md`'s report step.
