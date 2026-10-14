# The board is sized by the window's width and height, up to about 600px; a short landscape window puts the header beside it

Date: 2026-10-14 · Status: accepted

## Context

`2026-10-12-board-geometry-per-size.md` sized the cell by the width only and rejected a height term ("the page
already scrolls on a short window at 4x4"). The UX audit of 2026-10-13 showed the cost: the 4x4 board did not fit
1366×657, 1280×600 or a phone on its side, while on a big screen it stayed at 484px. The author asked that the whole
board be visible there, the GitHub row kept, the board to grow up to about 600px, the header and the footer to follow it.

## Decision

- **`--cell-size` is the smallest of three terms.** The old width preference with a higher ceiling,
  `clamp(60px, 72vw / n, min(128px, 510px / n))` (a 4x4 or 5x5 board is about 600px, a 3x3 keeps the 4x4 cell); the old
  fit-the-width term; and a **height term**, `max(40px, (100svh - rows - (n + 3) * gap) / n)`. `svh`, not `dvh`: a phone's
  address bar hiding must not resize the board. 4x4 below 556px wide is as before unless the window is short.
- **`--rows-height`**, on `.game-layout`, is the height of everything but the board: two page paddings, three header gaps
  and a measured 199px (GitHub row, the header's two rows, the footer, the record badge's clearance). It is a constant that
  must follow the height of those rows; it over-estimates by up to 16px below 510px wide, never the other way.
- **The floor is 40px**, the largest of the author's 40–48px that lets a 5x5 board fit 667×375. A window too short for it
  scrolls, as before. The tile text keeps its share of the cell, no pixel floor.
- **A short landscape window** (`height <= 570px`, `width >= 540px`, landscape) lays the header and the footer in a column
  beside the board: in one column the page around the board is 249px tall, so a 375px window leaves a board of 126px. There
  `--rows-height` is the paddings and the GitHub row, and the width term subtracts `--side-width` (the header's width and
  a gap). The header is then as wide as its own content, not as the board: this ends "exactly as wide as the board"
  of `2026-10-10-header-toolbar.md` for that case only. The GitHub row stays on top.
- Rejected: hiding the footer or the score row on a short window (content lost), a lower floor (24px tiles), accepting the
  scroll at 667×375 (the author's acceptance listed it), `dvh` (a board that resizes while the address bar hides), a
  `ResizeObserver` or JS measurement of the header (CSS reads constants, `2026-10-10-css-custom-properties-from-js.md`).

## Consequences

- At 1366×657 and 1280×600 the 4x4 board is about 370px and 350px and the page does not scroll; at 1440×900 and 768×1024
  it is 594px (3x3: 456px, 5x5: 606px); on a phone it is as before.
- A change to the GitHub row, the header or the footer that changes their height moves `--rows-height`; the board then
  scrolls the page by the difference until it does (`ai/rules/style.md`).
- Not checked without real devices: Safari and Firefox rendering, a phone's address bar, a notched phone on its side.
- Refines `2026-10-12-board-geometry-per-size.md` (the viewport term and the 100px ceiling) and
  `2026-10-10-header-toolbar.md` (the header's width on a short landscape window).
