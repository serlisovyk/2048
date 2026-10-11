# One header with an icon toolbar; icons are inline SVG

Date: 2026-10-10 · Status: accepted

## Context

The top of the page was a plain heading and two score blocks, and `New Game` sat under the
board (MY-120). A theme switch (MY-123) and a settings button (MY-127) are coming, and
without one place for them they would be added wherever there was room.

## Decision

- **One header** above the board holds the logo, the score and the high score (with the
  reset icon), and a toolbar of icon buttons. `New Game` is the first toolbar button.
- **The header is exactly as wide as the board**, without knowing its width: header and
  board share a wrapper that shrink-wraps to the board, and the header contributes only
  its minimum width to that size (`width: min-content; min-width: 100%`), so it never
  widens the wrapper beyond the board and is never narrower than its own content.
  Rejected: repeating the board's size arithmetic in the header (it breaks with the next
  board size), a fixed header width, and `contain: inline-size` (the header then ignores
  its own content: a 3x3 board at 320px let the toolbar stick out).
- **Icons are inline SVG written in the markup**: `currentColor`, `aria-hidden`,
  `focusable="false"`. No icon font, library, image file, or `<use>` sprite; there are
  a handful of icons and each is used once. An icon-only button has an `aria-label` and
  a `title` with the same text.
- **The room for the future buttons is the layout, not a placeholder.** The toolbar is a
  flex row; at 320px it holds up to four 44px buttons next to the logo (checked: three
  are planned, a fifth overflows). A new button is one more
  `<button class="toolbar-button">`, with no CSS. No empty, disabled, or hidden slot is
  shipped for a feature that does not exist yet. Rejected: a visible stub for two
  issues that may land weeks apart.
- **`New Game` is a plus icon, not text and not a circular arrow.** The reset-high-score
  icon is already a circular arrow, and two look-alike icons a few pixels apart with
  different consequences invite a mis-tap. The confirmation (MY-115) still guards a game
  in progress.

## Consequences

- MY-123 and MY-127 add their buttons to `.toolbar` and wire them in `main.js`; they
  should not need header CSS. A fifth button does not fit next to the logo at 320px and
  needs a new layout decision.
- The logo has its own gold gradient and does not read the tile palette (MY-122); the
  theme task (MY-123) tokenises its colors with the rest.
- The size budget is unchanged in kind: icons add a few hundred bytes of markup, not a
  dependency.
- Refined by `2026-10-11-settings-dialog-and-storage.md` (MY-127): the settings button is in the markup,
  `hidden`, until the first settings section exists, a narrow exception to "no hidden slot" for a feature
  that is built and only lacks its first section. Measured with it shown: three buttons fit at 320px with
  the header exactly as wide as the board, a fourth makes the header 5px wider, a fifth overflows.
