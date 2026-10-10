# MY-120 — Header with a toolbar: logo, score boxes, icon actions

Issue: MY-120 · Branch: `my-120-header-toolbar` · Spec: `ai/superpowers/specs/2026-10-10-header-toolbar.md`

Blocker MY-109 (the `src/` structure and the views) is `Done`; so are MY-115 (the
confirmation) and MY-117 (the reset icon) that this header carries. No decision record
is contradicted:

- `2026-10-10-native-dialog.md`, `2026-10-10-confirm-dialog.md` — the dialogs and the
  confirmation flow are untouched; the `New Game` button only moves.
- `2026-10-10-score-live-region-and-focus-ring.md` — the live region markup stays as it
  is; the new buttons rely on the generic `button:focus-visible` rule and set no focus
  styles.
- `2026-10-10-rejected-features.md` — nothing from the list (no `N` hotkey for a new
  game, no hint).

The issue never says "decide in the plan", so the choices below are made here and the
ones that were not dictated by the issue are flagged for the author in the report.

It runs in parallel with MY-122 (tile palette, `tiles.css`): this change does not touch
tile colors. The logo has its own gold gradient and does not read the tile palette; the
theme task (MY-123) tokenises colors later.

## 1. Choices

### This is HTML and CSS only

`main.js` already finds `.new-game-button` and the score elements by class, and
`GameController` / `ScoreView` know nothing about where they sit. The header keeps every
class a script queries, so no JavaScript, constant, or layout-of-objects change is
needed. The OOP layers are unaffected.

### `New Game` is an icon-only button with a plus

The issue lists it among the icon buttons ("row of icon buttons", every icon with
`aria-label` + `title`). The name is `New game`, the same words as the confirmation's
title (`Start a new game?`). The icon is a plus, not a circular arrow: the
reset-high-score button already uses a circular arrow, and two look-alike icons a few
pixels apart, with different consequences, are an invitation to mis-tap on a phone. The
text button under the board and its CSS are removed (no stale code).

### "Reserve room" means layout, not a placeholder

A visible empty or disabled slot would be a stub in the UI for two issues that may land
weeks apart (the same stance MY-127 takes for its sections). Instead the toolbar is a
flex row whose size is verified for three 44px buttons at 320px, and the repo docs say
where a new button goes and what markup it copies. Checked in the browser by injecting
two extra buttons.

### The header is exactly as wide as the board, without knowing the board's width

The board's width is computed from `--cell-size`, `--cell-gap`, and `--board-size`, which
are set on `.game-container` and on the grid by `GridView`. Instead of duplicating that
arithmetic, header and board go into one wrapper (`.game-layout`) that shrink-wraps to
its widest child, and the header opts out of contributing to that width with
`contain: inline-size`. The wrapper then equals the board's width, the header stretches
to it, and a future board size changes the header with it. `contain: inline-size` is in
Vite's default browser target. If it misbehaves in the browser, the fallback is
`width: 0; min-width: 100%` on the header.

### Score box: label above the value, grid inside

A grid `1fr auto` per box: the label spans both columns, the value sits in the first, the
reset icon (when shown) in the second. The icon button keeps its own look (small round
ghost) with negative vertical margins so that it does not make the box taller than the
number. The boxes are two equal `1fr` columns, so the header does not jump when a number
grows. The box looks like today's blocks (`#444444`, `1px #555555`, 8px radius), and the
number keeps its gold.

The label colour must reach 4.5:1 on `#444444`; `#b0b0b0` (the reset icon's colour) gives
about 4.5 and no more, so the label is `#c4c4c4`.

### Toolbar buttons: `.toolbar-button` in `controls.css`

One shared look for toolbar buttons (the score boxes' surface, 44px target, hover
brightens the surface). Transitions list `background-color` only, never `all`, so the
focus ring from `base.css` cannot animate in. The reset icon stays on its own class; the
two buttons differ in size, shape, and role.

Where the files go: a new `src/styles/header.css` holds the header (layout, logo, score
boxes, toolbar row); `layout.css` loses the old `h1` and `.score-container` rules; the
button look is in `controls.css` with the other buttons; the old `.new-game-button` rules
are deleted.

### Order of the toolbar

`New Game`, then (later) the theme switch, then the settings: as the issues name them.
The DOM order is the visual order, so the `Tab` order matches what is seen.

### Icons are inline SVG: a rule and a decision record

Recorded in `ai/rules/style.md` (HTML section) and `ai/skills/feature.md` (controls), and
in a short decision record: the alternatives (an icon font or library, a `<use>` sprite)
cost more than they give for four icons.

## 2. Where each part lives

| File                      | Change                                                                                                                                                                                                                                                                       |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/index.html`          | `<div class="game-layout">` wrapping `<header class="game-header">` (the `<h1 class="logo">2048</h1>`, the `.toolbar` with the `New Game` icon button, the `.score-container` with two `.score-box`es) and the `<main class="game-container">`. The bottom text button goes. |
| `src/styles/header.css`   | New: `.game-layout`, `.game-header`, `.logo`, `.toolbar`, `.score-container`, `.score-box`, `.score-label`, the values, the reset icon's position, the narrow-screen sizes.                                                                                                  |
| `src/styles/layout.css`   | Drop the `h1` and `.score-container` rules and their breakpoint overrides; `body` and `.game-container` stay.                                                                                                                                                                |
| `src/styles/controls.css` | Add `.toolbar-button`; remove the `.new-game-button` rules; the reset icon's rule is kept (margins adjusted for the box).                                                                                                                                                    |
| `src/styles/main.css`     | Import `header.css` after `layout.css`.                                                                                                                                                                                                                                      |
| `src/scripts/*`           | No change.                                                                                                                                                                                                                                                                   |
| Docs                      | `README.md`, `ai/map.md`, `ai/rules/style.md`, `ai/skills/feature.md`, `ai/decisions/`.                                                                                                                                                                                      |

To keep merges with MY-122 clean, the docs edits avoid the tile rows and the table
cells stay no wider than the widest existing cell (Prettier re-pads a whole table when a
cell grows).

## 3. Commits

1. `docs:` spec + plan (this commit, before any code).
2. `feat:` the header: the layout wrapper, the logo, the score boxes with the reset icon
   inside (`index.html`, `header.css`, `layout.css`, `main.css`). `New Game` is still the
   old button below the board.
3. `feat:` the toolbar: the `New Game` icon button moves into it, `.toolbar-button`, the
   old button's CSS is removed (`index.html`, `header.css`, `controls.css`).
4. `docs:` `README.md`, `ai/map.md`, `ai/rules/style.md`, `ai/skills/feature.md`, the
   decision record and its index entry.

If the browser shows that the plan was wrong somewhere, this file is updated in the same
commit as the fix.

## 4. Verification

`yarn lint`, `yarn format:check`, `yarn build`, `yarn size` (CSS budget 4 kB gzip,
currently 2.13 kB; JS untouched at 4.25 kB), then `yarn dev --port 5191 --strictPort` in
a tab of its own in the browser pane, as in the spec:

- widths 320, 375, tablet 768, 1024, and a wide desktop: screenshots, and a script that
  checks `scrollWidth <= clientWidth` and that no element's right edge passes the
  viewport (the body has `overflow-x: hidden`, so a plain scroll check would hide an
  overflow);
- the header and the board have the same width at each size;
- `New Game`: fresh game (no dialog), mid-game (confirmation, `Cancel` focused, `Escape`
  and `Cancel` return focus to the toolbar button, confirm resets the score and keeps
  the high score), after game over;
- the reset icon in the box (appears at a high score above 0, confirmation still works,
  hidden at 0), a seven-digit score and high score at 320px;
- two extra toolbar buttons injected at 320px, and again on a wide desktop;
- `Tab` order and the ring through the header; the accessibility tree for the banner, the
  heading, and the button names; the live region still changes after a move;
- the pane is hidden-prone (no frames): DOM and layout checks run in the pane with
  timeouts, real keyboard and screenshot checks in the pane where it renders.
