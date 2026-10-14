# MY-139 — CSS refactor: nesting, token scales, `animations.css`, shared button classes, no comments

Issue: MY-139 · Branch: `my-139-css-refactor` · No spec: the look does not change, except that `:hover` stops
sticking on touch screens (a `@media (hover: hover)` consequence, not a feature).

Runs next to MY-137 (JS) on other files, after MY-138 (docs), before the UX tasks (MY-140, MY-141) and the README
(MY-132). Out of scope here: any layout, size, colour, contrast or text change, JS beyond what a renamed class
requires, the theme head script (MY-137).

## Why

The CSS is flat: separate `@media` blocks, a list of 7 button selectors three times, a list of 4 dialog selectors
six times, `@keyframes` in five files, one `body` and one `.game-container` split between files, a
`transition: all` that forced an `outline-style` trick for the focus ring, and no scales for font sizes, radii,
shadows or durations, so near-identical values drifted apart.

## Author's decisions (2026-10-13, final)

- Nesting, `@media` inside the selector and `animations.css`: yes. Ranges use `<=` only: `(width <= 768px)`,
  `(height <= 600px)`; the build turns them into today's `max-width` / `max-height`, a `<` would become
  `not (min-width…)` with another boundary.
- Scales as custom properties: font sizes (in `rem`), radii, durations (one unit), shadows, the focus ring.
- No `browserslist`. The font file becomes `rubik.woff2`.
- No comments in `src/styles/`; the "why" that matters goes to docs, within `ai/rules/docs.md`. JS-hook classes
  that have no CSS stay in the markup.
- `prefers-reduced-motion` stays one block in `motion.css`, and `motion.css` stays last in `main.css`: the rule
  `.record-badge { animation-name: record-badge-static }` beats the `animation` shorthand of `header.css` by
  import order only. The exception is written in `style.md`.
- Skipped on purpose: primitive colour tokens (CSS-24), grouping all tile rules (CSS-2, +45 B), duplicating
  `--backdrop` on `::backdrop` (CSS-23). `style.md` is edited in its CSS part only (MY-137 edits the JS part).

## Rules of this change

- **The look is the baseline.** Screenshots of `main` (`yarn build && yarn preview`) are taken first; the same
  states and widths are compared after. A token takes the exact value it replaces: three near-identical
  `clamp(14px, Nvw, 18px)` stay three tokens, because merging them changes the size at 350–720px. Merging
  near-duplicates is a visible change, so it is offered to the author, not done here.
- **Specificity is kept.** Nesting must not lower a selector that wins today: `.game-over .game-over-win-note`
  over `p`; in `.segment`, `input:checked + span` over `:hover span`; `.button-outline:hover` over `.button:hover`;
  `.record-badge` in `motion.css` over the `animation` shorthand (so the badge is not nested in `.score-box`);
  `:root[data-theme='light'] .theme-toggle .theme-icon-moon` over the default `display: none`. A `dialog`
  selector is `(0,0,1)`, so nothing that needs to beat it may be written element-only.
- **The build output is checked.** esbuild flattens nesting for the build target, so `dist/` is inspected: the
  `max-width` / `max-height` queries, the prefixes (`-webkit-user-select`…), nothing left as `not (min-width…)`.
- JS-hook classes are never removed (`.new-game-button`, `.settings-button`, `.score-announcement`,
  `.footer-year`, `.win-message`, `.confirm-title`, `.confirm-message`, and the rest `main.js` queries).

## Token scales (`theme.css`, one `:root`)

- **Font** (`rem`, 1rem = 16px): `--font-caption` 13px, `--font-badge` 11–12, `--font-label` 11–13,
  `--font-control` / `--font-text` / `--font-pop` (14–18 at 2.5 / 3 / 4vw), `--font-stat` 20–26,
  `--font-score` 20–28, `--font-title` 24–40, `--font-logo` 26–36.
- **Radius**: `--radius-sm` 6px, `-md` 8px, `-lg` 10px, `-xl` 15px, `-round` 50%, `-pill` 999px.
- **Shadow geometry**: `--shadow-2xs` … `--shadow-2xl` are `0 2px 6px`, `0 4px 8px`, `0 4px 12px`, `0 4px 15px`,
  `0 6px 20px`, `0 8px 32px`, `0 10px 40px`, and `--shadow-glow` is `0 0 20px`. The colour stays its own token:
  `box-shadow: var(--shadow-md) var(--button-shadow)`.
- **Duration** (`ms`): `--duration-fast` 200ms, `--duration-base` 300ms; the existing `--theme-reveal-duration`,
  `--score-pop-duration` and `--record-badge-duration` move next to them.
- **Focus ring**: `--focus-ring-width` 3px, `--focus-ring-offset` 3px; the colour stays `--focus-ring-color`.

The tile slide and pop durations are not here: they come from `constants.js` through `GridView`. Their `var()`
fallbacks (`110ms`, `100ms`) are unreachable, so they go. `--board-size` is different: the board is drawn once
before `GridView` sets it, so its default `4` stays, once, on `.game-grid`, instead of six `var(--board-size, 4)`.

## Changes (one commit each)

1. **Plan** (this file), alone.
2. **No comments in `src/styles/`.** Their "why" is already in `ai/rules/style.md` or a decision record, except a
   few lines (the GitHub link's bottom margin, the sun and moon swap) that go to `style.md` in the docs commit.
3. **`animations.css`.** All 9 `@keyframes` (`theme-reveal`, `pop-in`, `merge-pop`, `tile-retire`, `score-pop`,
   `record-badge`, `record-badge-static`, `modal-pop`, `backdrop-fade`); imported before `motion.css`.
4. **Rules into their files.** `.game-container`, `--cell-gap`, `--cell-size` into `board.css` next to
   `.game-grid`; `.game-layout` and the shared `width: min-content; min-width: 100%` of the header and the footer
   into `layout.css`; one `body` block (in `base.css`, with the font); `.toolbar` next to `.toolbar-button`.
5. **Dead and redundant CSS.** The duplicate `.game-container { padding }` in the media query,
   `backdrop-filter: blur` (a flat page behind: checked in both themes), `*::before, *::after`,
   `animation-iteration-count` and `scroll-behavior` in `motion.css`, `line-height: 1.15` on the badge, the
   unreachable `var()` fallbacks, `--dialog-ring` (always `--dialog-text`).
6. **Nesting and media inside selectors.** `&:hover`, `&:focus-visible`, `&[open]`, `&::backdrop`, `&.after-slide`,
   `.is-sliding &`, `.segment` in `.segmented`, `h3` in `.settings-section`, the light theme in `:root`, the
   theme icons; every `@media` into the selector it changes, as `(width <= 768px)` / `(height <= 600px)`.
7. **Token scales** as above, and the focus ring numbers.
8. **`.button` / `.button-outline`** in `index.html` and `controls.css` (the primary button gets a transparent 2px
   border, so `padding: 10px 22px` disappears), and one `dialog` selector for the shared dialog look.
9. **Focus ring and transitions.** `transition` lists its properties instead of `all`; the ring is a plain
   `:focus-visible { outline: … solid }` (no `outline-style` trick); the segment ring reuses the tokens.
10. **Hover for the mouse only.** Every `:hover` inside `@media (hover: hover)`; `:active` on the toolbar buttons.
11. **Font file** `src/fonts/rubik.woff2`: the preload `<link>`, `@font-face`, the map.
12. **Docs.** `ai/map.md` (the styles list, the font), `ai/rules/style.md` (CSS part), `ai/skills/feature.md`,
    the README file tree, and two decision records: the token scales, and the plain focus ring with explicit
    transitions (the old focus-ring record only gets a pointer in its `Status`).

## Verification

`yarn lint`, `yarn format:check`, `yarn build`, `yarn size` (CSS stays under 5 kB). The built CSS in `dist/` is
read, not trusted. Screenshots before and after (main, win, game over, confirm, settings, 3×3, 5×5 with large
tiles; 1440, 1000, 768, 375, 320px; both themes; once with reduced motion; hover and focus states) are compared
pixel by pixel, and the computed styles of every element are diffed. Then the game is played in `yarn dev` at
1000px and 375px: hovers, keyboard focus rings, button press, dialogs, the theme reveal, tile animations, the
score pop and the record badge, reduced motion; the console has no errors.

Then the Definition of Done point by point, a self-review with the `review` skill, and the report. Stop at the
author-approval gate.
