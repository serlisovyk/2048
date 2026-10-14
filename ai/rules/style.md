# Style Rules

## General

- Prefer readable HTML, CSS, and JavaScript over clever tricks.
- Keep changes close to the feature or file section they affect.
- Avoid unnecessary comments. Add comments only when they explain non-obvious
  reasoning.
- Use existing naming and spacing patterns before introducing new ones.

## HTML

- Use semantic elements for major regions.
- Use buttons for actions. A link is only for going to another address (the GitHub icon):
  one that opens a new tab has `target="_blank"` and `rel="noopener"`.
- Give interactive controls clear accessible names when visible text is not enough. An
  icon-only button or link has an `aria-label` and a `title` with the same text (a link
  that opens a new tab says so: `… (opens in a new tab)`).
- Icons are inline SVG written in the markup: `viewBox`, `stroke="currentColor"` (or
  `fill`), `aria-hidden="true"`, `focusable="false"`. No icon font, icon library, image
  file, or `<use>` sprite.
- A value that changes during play and matters to a screen-reader user (the score) gets a
  live region: a visually hidden `<span aria-live="polite" aria-atomic="true">` that the
  owning view fills after a short debounce (the delay is in `constants.js`). The visible
  number next to it is `aria-hidden="true"`. Always `polite`, never `assertive`; no live
  region on a value that is not worth announcing (the high score).
- A decoration that repeats that value (the score pop, `+N`) sits in its own
  `aria-hidden` container, outside the live region and the visible value. A decoration
  whose meaning must be heard (the `New record!` badge) is `aria-hidden` too and rides on
  the one score announcement that follows (`New record! <score>`). Never a second live
  region for the same event.
- Text that is only for assistive technology uses the `.visually-hidden` class, not
  `display: none` or `hidden`, which also hide it from screen readers.

## CSS

- Keep plain CSS. Do not introduce Less, Sass, or CSS-in-JS unless explicitly requested.
- Keep CSS split by responsibility through the files imported in `src/styles/main.css`.
  Keep responsive rules near the layout or component they affect.
- Use CSS custom properties for values shared inside a component. When CSS needs a number
  from `constants.js` (board size, durations), the owning view sets it as a custom property
  and the CSS reads it with a fallback: `var(--board-size, 4)`.
- **Reduced motion** lives in `src/styles/motion.css`. Its rule sets every
  `animation-duration` to 0.01ms with `!important`. An animation the player must still see
  gets its own override there: the score pop loses its movement (`--score-pop-rise: 0px`)
  and keeps its duration; the record badge keeps its duration and swaps in keyframes that
  change nothing, because `animationend` must still fire. The tiles go the other way:
  `--tile-slide-duration` and `--tile-pop-duration` are set to `0ms !important` on
  `.game-grid`, so the delays built from them collapse and JS knows nothing about reduced
  motion (`ai/decisions/2026-10-10-score-pop.md`, `ai/decisions/2026-10-10-new-record-badge.md`).
- A transient element that JS creates (the score pop) removes itself on `animationend` and
  takes its duration from a CSS custom property, so JS holds no timer for it. One that is a
  `hidden` element in the markup (the record badge) is shown by clearing `hidden` and hidden
  again on `animationend`; it sets no `display`. Both float out of the layout.
- **Colours only through tokens.** Every colour (a hex value, `rgb()` / `hsl()`, a named
  colour, the colours inside a gradient or a shadow) is a custom property defined in
  `src/styles/theme.css` (all of the UI) or `src/styles/tiles.css` (the tiles) and read as
  `var(--name)` everywhere else; `transparent` and `currentColor` stay as keywords. A token
  has its dark value on `:root` and, where the light theme differs, an override under
  `:root[data-theme='light']` in the same file. A new colour is a token in the right file
  with both values, its text contrast checked in **both** themes (4.5:1 for normal text; 3:1
  for large bold text, icons and other UI parts), and no literal anywhere else: a search for
  `#`, `rgb(`, `hsl(` in `src/styles/` outside those two files must find nothing. JS never
  writes a colour either: it reads the token (`ThemeView` reads `--page-bg`).
- A component that looks different in one theme only re-points tokens in a scoped block in
  `theme.css` (`:root[data-theme='light'] .confirm-dialog { … }`); it gets no colour literal.
- The theme is the `data-theme` attribute on `<html>`, always set (the inline script in
  `index.html`, then `ThemeController`). The stylesheets have no `prefers-color-scheme`
  block: that would be a second place deciding the theme. The theme switch's circle is a
  View Transition, a progressive enhancement feature-detected in `ThemeView` and skipped
  under reduced motion; its rules live in `theme.css`
  (`ai/decisions/2026-10-10-theme-tokens-and-head-script.md`,
  `ai/decisions/2026-10-10-view-transitions-progressive-enhancement.md`).
- **Focus.** One generic `button:focus-visible, a:focus-visible` rule in `base.css` draws
  the ring for every button and link, in `--focus-ring-color` (the dialogs re-point it with
  `--dialog-ring`). Do not add per-button focus styles or `outline: none` / `outline: 0` on a
  button or a link: a new one gets the ring with no CSS. The ring is an `outline`, not a
  `box-shadow` (hover rules set their own); its width, gap and colour sit on the base
  `button, a` rule and only `outline-style` flips on `:focus-visible`, because buttons use
  `transition: all` and would animate the ring in. An element focused only from script
  (`tabindex="-1"`, the board) gets `:focus-visible { outline: none }`.
- **Tiles.** Tile colours live in `tiles.css` and nowhere else: every colour is a custom
  property on `:root` (`--tile-<value>`, `--tile-fallback`, text, sheen, glow, shadow) and the
  rules only read tokens, so a theme overrides tokens and touches no selector. `board.css`
  keeps the structure of a tile and its move animations.
- A tile is a `.tile` element over the background `.grid-cell`s, placed by the custom
  properties `--row` and `--col` that the view writes; its `translate` is built from them
  and the inherited `--cell-size` and `--cell-gap`, so no pixel value is written and a
  resize needs no JS. Use the `translate` and `scale` properties, not `transform`. The
  slide `transition` lives only on `.is-sliding .tile` (a standing one makes tiles trail
  the grid while the window is resized). A tile never changes its `data-value`; a merge
  makes a new tile. The animations are classes (`.new-tile`, `.merged-tile`,
  `.retired-tile`) that start after CSS delays, in the order slide, merge pop, new tile.
- The base rule `.tile[data-value]` is the first rule in `tiles.css` and the fallback for
  every value without a rule of its own; the per-value rules come after it and win by order.
  Never write the fallback as a `:not()` chain.
- Adding a tile value is a token plus one rule after the base rule, in value order:
  `background-color`, `color` (`--tile-text-dark` or `--tile-text-light`) and `font-size`
  as a share of the cell, `calc(var(--cell-size) * x)`: 1-2 digits 0.4, 3 digits 0.35,
  4 digits 0.3, 5 digits 0.25, the fallback 0.2. No pixel floor: it overflows a small tile
  on the 5x5 board (`ai/decisions/2026-10-12-board-geometry-per-size.md`).
- Tile colours are two ramps (2 to 2048 cream to magenta; 4096 and up restart in lavender
  and run to deep blue). A new colour keeps that order and stays clearly different from its
  neighbours. The tile text must reach 3:1 against **both** ends of the gradient (the base
  colour, and the base blended 14% with white, the light end of `--tile-sheen`), computed
  with the WCAG formula because axe does not check gradients. The tile colours, text and
  sheen are the same in both themes, so one check covers both; a theme override of any of
  them redoes it (`ai/decisions/2026-10-10-tile-palette.md`).
- **Typography** lives in `base.css`: one family, set once on `body` (Rubik with an Arial
  fallback) and inherited (buttons through `font: inherit`); no `font-family` on other
  elements. Two weights, normal (400) and `bold` (700). `font-variant-numeric: tabular-nums`
  is set once on `body`, so every number keeps its width as it changes. `body` pins
  `line-height: 1.15` so box heights do not depend on which face is active. A new weight, an
  italic, another script or another face needs a decision record
  (`ai/decisions/2026-10-10-self-hosted-font.md`).
- A swipe surface carries `touch-action: none` and stays as small as the surface;
  `SwipeInput` listens on `.game-container`, so if that surface changes, move `touch-action`
  with it (`ai/decisions/2026-10-10-no-viewport-zoom-lock.md`).
- Avoid one-off visual effects that do not improve the game UI.

## JavaScript

- Follow `ai/rules/oop.md`: ES classes, one per file, private state, layers,
  constructor-injected dependencies.
- Imports include the `.js` extension.
- Keep game logic simple and event-driven.
- Do not add utility-heavy abstractions for one-use logic.

## Formatting

- Use Prettier (`.prettierrc`); `yarn format` applies it.
