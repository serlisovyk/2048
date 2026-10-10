# JS passes shared numbers to CSS through custom properties

Date: 2026-10-10 · Status: accepted

## Context

The board size and tile animation duration were defined twice: `SIZE` and timing
literals in JS, `repeat(4, …)` and `0.2s` in `board.css`. Changing one silently broke
the other. The rules forbid inline styles.

## Decision

- `src/scripts/constants.js` is the single source. The view that owns the element sets
  the values as CSS custom properties — `GridView` sets `--board-size` and
  `--tile-animation-duration` on `.game-grid`.
- CSS reads them with fallbacks (`var(--board-size, 4)`), so the page still renders
  if JS fails.
- This is the one allowed kind of inline style: numbers passed to CSS. Visual styling
  stays in the stylesheets.

## Consequences

- New shared numbers (e.g. slide duration, board size per mode) follow the same
  pattern instead of being duplicated.
- Custom properties are set on the element that owns them, not on `:root`, unless the
  value is truly page-wide (e.g. a theme).
