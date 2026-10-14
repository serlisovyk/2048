# Font sizes, radii, shadows and durations come from scales in `theme.css`, one exact value each

Date: 2026-10-14 · Status: accepted; the near-duplicates it kept apart were merged afterwards (one `--font-text`, one `4px 12px` shadow step, the shadow scale renamed `xs` to `xl`)

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
- **Numbers from JS** still come from `constants.js`, set by the view on the element that owns them
  (`2026-10-10-css-custom-properties-from-js.md`), but CSS reads them with no `var()` fallback: the
  tile slide and pop durations exist only after `GridView` set them. The one value drawn before the
  view runs, **`--board-size`, has its default `4` once on `.game-grid`**, so the empty board does not
  collapse and then jump.

## Consequences

- Rejected: one token per number (`--radius-8` names nothing), merging the near-duplicates now, and
  `px` for type (it ignores the reader's font size).
- Merging two near-duplicates later is one line in `theme.css`, checked at 350 to 720px.
