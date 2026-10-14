# Style Rules

## General

- Prefer readable HTML, CSS, and JavaScript over clever tricks.
- **No comments in `src/`** (HTML, CSS, JavaScript). Names and structure say what the code does; a
  durable "why" goes to a rule, a skill or a decision record (`ai/rules/docs.md`).
- Use existing naming and spacing patterns before introducing new ones.

## HTML

- Use semantic elements for major regions.
- Use buttons for actions. A link is only for going to another address (the GitHub icon):
  one that opens a new tab has `target="_blank"` and `rel="noopener"`.
- Give interactive controls clear accessible names when visible text is not enough. An
  icon-only button or link has an `aria-label` and a `title` with the same text (a link
  that opens a new tab says so: `… (opens in a new tab)`).
- **Texts are sentence case** (`New game`, `Game over`, `High score`; CSS capitalises a label, the markup does
  not), and one action has one name wherever it shows: the toolbar, the confirmation, the dialogs.
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

- Plain CSS with native nesting; no Less, Sass or CSS-in-JS unless explicitly requested. States and
  children go inside their rule (`&:hover`, `&[open]`, `.is-sliding &`). Nesting adds the parent's
  specificity: keep what has to win (`input:checked + span` over `:hover span`,
  `.button-outline:hover` over `.button:hover`, `.game-over .game-over-win-note` over `dialog p`).
- Keep CSS split by responsibility through the files imported in `src/styles/main.css`; every
  `@keyframes` is in `animations.css`. A media query sits inside the selector it changes, as a
  range with `<=` only (`(width <= 768px)`, `(height <= 600px)`): the build makes it `max-width`,
  while a `<` becomes `not (min-width: …)` with another boundary. Read the built CSS in `dist/`.
- **Scales** at the top of `theme.css`: font sizes (`--font-*`, `rem`), radii, shadow geometry
  (`--shadow-*`, then the colour token: `var(--shadow-md) var(--button-shadow)`), durations
  (`--duration-*`, `ms`) and the focus ring (`--focus-ring-width`, `--focus-ring-offset`). Other
  files hold no literal for them. A token is one exact value; merging near-duplicates changes the
  look, so it is decided with the result in front of you
  (`ai/decisions/2026-10-14-css-token-scales.md`).
- When CSS needs a number from `constants.js` (board size, durations), the owning view sets it as a
  custom property and the CSS reads it with no fallback; a default needed before the view runs is
  declared once where it is used (`--board-size: 4` on `.game-grid`).
- **Hover and buttons.** `:hover` only inside `@media (hover: hover)`, so a tap leaves no hover look
  on a touch screen; the toolbar buttons add `:active`. A dialog button is `.button` (the secondary
  one also `.button-outline`) next to its hook class for `main.js`; every dialog gets its look from
  the `dialog` selector, and its own class adds only what differs (background, shadow colour, width).
- **Reduced motion** is one `@media (prefers-reduced-motion)` block in `motion.css`, imported last (its
  `.record-badge` `animation-name` beats the `animation` shorthand of `header.css` by order only). It
  sets every `animation-duration` to 0.01ms with `!important`; an animation the player must still
  see gets its own override: the score pop loses its movement (`--score-pop-rise: 0px`) and keeps
  its duration, the record badge keeps its duration and swaps in keyframes that change nothing,
  because `animationend` must still fire. The tiles go the other way: `--tile-slide-duration` and
  `--tile-pop-duration` are `0ms !important` on `.game-grid`, so the delays built from them collapse
  and JS knows nothing about reduced motion (`ai/decisions/2026-10-10-score-pop.md`,
  `ai/decisions/2026-10-10-new-record-badge.md`).
- A transient element that JS creates (the score pop) removes itself on `animationend` and
  takes its duration from a CSS custom property, so JS holds no timer for it. One that is a
  `hidden` element in the markup (the record badge) is shown by clearing `hidden` and hidden
  again on `animationend`; it sets no `display`. Both float out of the layout.
- **Colours only through tokens.** Every colour (also inside a gradient or a shadow) is a custom
  property in `theme.css` (the UI) or `tiles.css` (the tiles): the dark value on `:root`, the
  light override under `:root[data-theme='light']` in the same file; `transparent` and
  `currentColor` stay keywords. A new colour has both values and its contrast checked in **both**
  themes (4.5:1 text; 3:1 large bold text, icons, UI parts); `#`, `rgb(`, `hsl(` appear nowhere
  else in `src/styles/`. JS never writes a colour: it reads the token (`ThemeView`, `--page-bg`).
- A component that looks different in one theme only re-points tokens in a scoped block in
  `theme.css` (`:root[data-theme='light'] .confirm-dialog { … }`); it gets no colour literal. The
  win and game-over cards keep one look in both themes; the confirmation and the settings follow
  the theme.
- The theme is the `data-theme` attribute on `<html>`, always set (`themeHead.js`, inlined
  into `<head>` at build, then `ThemeController`). The stylesheets have no `prefers-color-scheme`
  block: that would be a second place deciding the theme. The theme switch's circle is a
  View Transition, a progressive enhancement feature-detected in `ThemeView` and skipped
  under reduced motion; its rules live in `theme.css`
  (`ai/decisions/2026-10-10-theme-tokens-and-head-script.md`,
  `ai/decisions/2026-10-10-view-transitions-progressive-enhancement.md`).
- **Focus.** One `button:focus-visible, a:focus-visible` rule in `base.css` draws the ring for
  every button and link: an `outline` of `--focus-ring-width` and `--focus-ring-offset` in
  `--focus-ring-color` (the dialogs set it to `--dialog-text`). No per-button focus styles and no
  `outline: none` on a button or a link: a new one gets the ring with no CSS, and a control next
  to another element leaves room for it (the GitHub link's bottom margin keeps the ring off the
  header). An `outline`, not a `box-shadow` (hover rules set their own). A `transition` names its
  properties, never `all`, so the ring does not animate in. An element focused only from script
  (`tabindex="-1"`, the board) gets `:focus-visible { outline: none }`
  (`ai/decisions/2026-10-14-plain-focus-ring.md`).
- **Tiles.** Tile colours live in `tiles.css` and nowhere else: every colour is a custom
  property on `:root` (`--tile-<value>`, `--tile-fallback`, text, sheen, glow, shadow) and the
  rules only read tokens, so a theme overrides tokens and touches no selector. `board.css`
  keeps the structure of a tile and its move animations.
- A tile is a `.tile` element over the background `.grid-cell`s, placed by the custom
  properties `--row` and `--col` that the view writes; its `translate` is built from them
  and the inherited `--cell-size` and `--cell-gap`, so a resize needs no JS. Use `translate`
  and `scale`, not `transform`. The slide `transition` lives only on `.is-sliding .tile` (a
  standing one makes tiles trail the grid while the window is resized). A tile never changes
  its `data-value`; a merge makes a new tile. `.new-tile`, `.merged-tile` and `.retired-tile`
  start after CSS delays, in the order slide, merge pop, new tile.
- The base rule `.tile[data-value]` is the first rule in `tiles.css` and the fallback for
  every value without a rule of its own; the per-value rules come after it and win by order.
  Never write the fallback as a `:not()` chain.
- Adding a tile value is a token plus one rule after the base rule, in value order:
  `background-color`, `color` (`--tile-text-dark` or `--tile-text-light`) and `font-size`
  as a share of the cell, `calc(var(--cell-size) * x)`: 1-2 digits 0.4, 3 digits 0.35,
  4 digits 0.3, 5 digits 0.25, the fallback 0.2. No pixel floor: it overflows a small tile
  on the 5x5 board (`ai/decisions/2026-10-12-board-geometry-per-size.md`).
- A new tile colour keeps the order of the two ramps and stays clearly different from its
  neighbours; its text reaches 3:1 against **both** ends of the gradient, computed with the
  WCAG formula (axe does not check gradients) (`ai/decisions/2026-10-10-tile-palette.md`).
- **Typography** lives in `base.css`: one family, set once on `body` (Rubik with an Arial
  fallback) and inherited (buttons through `font: inherit`); no `font-family` on other
  elements. Two weights, normal (400) and `bold` (700). `font-variant-numeric: tabular-nums`
  is set once on `body`, so every number keeps its width as it changes. `body` pins
  `line-height: 1.15` so box heights do not depend on which face is active. A new weight, an
  italic, another script or another face needs a decision record
  (`ai/decisions/2026-10-10-self-hosted-font.md`).
- The swipe surface is the whole page: `SwipeInput` listens on `document` and `html`, `body` carry
  `touch-action: pinch-zoom` (no single-finger pan, pinch zoom stays); nothing else sets it, and never
  `none` or a viewport zoom lock (`ai/decisions/2026-10-14-swipe-on-the-whole-page.md`).
- Avoid one-off visual effects that do not improve the game UI.

## JavaScript

- Follow `ai/rules/oop.md`: ES classes, one per file, private state, layers,
  constructor-injected dependencies.
- Imports include the `.js` extension.
- Keep game logic simple and event-driven.
- An empty `catch {}` fails ESLint `no-empty` (comments are gone): let it return a fallback.
- **A clean `return`:** a name, a literal, one call or a boolean of names (`return isNewBest || isOver`). A
  ternary, `??`, a chain or a call inside an object literal is computed into a `const` first.
- **Named conditions.** A long or compound condition is a `const` (`canMove`) or early returns; no nested
  ternaries; no side effect (an `await`, a call that changes something) inside a condition.
- **Booleans** are `is`, `has` or `can` (fields, results, options too): `hasMoved`, `isOver`, `canAnimate`.
- **Early `return`** instead of `if` / `else` when a branch ends the method.
- **Handlers.** A private arrow-function field only for a function that is both added and removed; any other
  handler is a private method called from an inline arrow: `addEventListener('click', () => this.#handleClick())`.
- **Blank lines group steps** (guards, work, result). A guard block of one or two lines has none inside it.
- **Parameter names say what they are** (`isConfirmed`, `spawnedTiles`, `size`), not a bare `result` or `x`.

## Formatting

- Use Prettier (`.prettierrc`); `yarn format` applies it.
