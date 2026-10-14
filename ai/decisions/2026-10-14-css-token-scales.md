# Font sizes, radii, shadows and durations come from scales in `theme.css`, one exact value each

Date: 2026-10-14 · Status: accepted

## Context

Font sizes, radii, shadows and durations were literals repeated across eight files, and
near-duplicates had drifted apart: three `clamp(14px, Nvw, 18px)` with 2.5, 3 and 4vw, shadows
blurred 8, 12 and 15px, `0.3s` next to `500ms`. The CSS refactor (MY-139) had to put them in one
place without changing the look.

## Decision

- **The scales are custom properties at the top of `theme.css`**: `--font-*` in `rem`, `--radius-*`,
  `--shadow-*`, `--duration-*` in `ms`, `--focus-ring-width` and `--focus-ring-offset`. Everything
  else reads them; a value that fits no step is a new token, never a literal.
- **A token is exactly the value it replaced.** The three 14-18px clamps stay three tokens
  (`--font-control`, `--font-text`, `--font-pop`): merging them changes the size by up to 4px
  between 350 and 720px, and the same goes for the shadow blurs. Merging is a visible change the
  author decides on screenshots, in its own task, not as a side effect of a refactor.
- **Fonts are in `rem`**: the same at the default 16px root, and they follow the browser's font size.
- **A shadow is a geometry token and a colour token**: `var(--shadow-md) var(--button-shadow)`. The
  colours stay in the theme files, the geometry is shared.
- **The tile slide and pop durations** come from `constants.js` through `GridView`: no CSS token and
  no `var()` fallback. **`--board-size` has one default, `4`, on `.game-grid`**: the board is drawn
  once before `GridView` sets the size, and without a default it would collapse and then jump.

## Consequences

- Rejected: one token per number (`--radius-8` names nothing), merging the near-duplicates now, and
  `px` for type (it ignores the reader's font size).
- Merging two near-duplicates later is one line in `theme.css`, checked at 350 to 720px.
