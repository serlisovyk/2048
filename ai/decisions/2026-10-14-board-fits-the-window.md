# The board is sized by the window's width and height, up to about 600px; a short landscape window puts the header beside it

Date: 2026-10-14 · Status: accepted

## Context

`2026-10-12-board-geometry-per-size.md` sized the cell by the width only and rejected a height term. The UX audit of
2026-10-13 showed the cost: the 4x4 board did not fit 1366×657, 1280×600 or a phone on its side. The author asked for the
whole board in view there, the GitHub row kept, the board up to about 600px, the header and the footer growing with it.

## Decision

- **`--cell-size` is the smallest of three terms:** the old width preference with a higher ceiling,
  `clamp(60px, 72vw / n, min(128px, 510px / n))` (a 4x4 or 5x5 board is about 600px, a 3x3 keeps the 4x4 cell); the old
  fit-the-width term; and a height term, `max(40px, (100svh - rows - (n + 3) * gap) / n)`. `svh`, not `dvh`: a phone's
  address bar hiding must not resize the board. The 40px floor is the largest of the author's 40–48px that lets a 5x5
  board fit 667×375; a window too short for it scrolls.
- **`--rows-height`**, on `.game-layout`, is the height of everything but the board: two page paddings, three header gaps
  and a measured 199px (GitHub row, header, footer, the record badge's clearance). It must follow the height of those
  rows; it over-estimates by up to 16px below 510px wide, never the other way.
- **A short landscape window** (`height <= 570px`, `width >= 540px`, landscape) lays the header and the footer in a column
  beside the board (in one column the page around the board is 249px: a board of 126px at 375px tall). There
  `--rows-height` is the paddings and the GitHub row, and `--side-width` is what the window leaves beside a board as tall
  as the height allows, 286px to 360px; the header's column is that less a gap (a 5-digit record needs more than the
  header's own 274px). The header is then not "exactly as wide as the board" (`2026-10-10-header-toolbar.md`), there only.
- **A constant, not container queries.** Tried: the board's area as a size container (`container-type: size`, `flex: 1`
  between the header and the footer, `cqh` for the cell). It gives the same board sizes without the 199px, but a size
  container has no intrinsic width, so the header and the footer, which take the board's width by shrink-wrapping around it,
  cannot follow it (594px above a 371px board at 1366×657); `aspect-ratio` does not pass the width on either. It would
  also need a fallback below Firefox 110, inside Vite's target (104).
- Rejected: hiding the footer or the score row on a short window, a lower floor, `dvh`, JS measuring the header
  (`2026-10-10-css-custom-properties-from-js.md`).

## Consequences

- A change to the GitHub row, the header or the footer that changes their height moves `--rows-height`; the board then
  scrolls the page by the difference until it does (`ai/rules/style.md`).
- Not checked without real devices: Safari and Firefox rendering, a phone's address bar, a notched phone on its side.
- Refines `2026-10-12-board-geometry-per-size.md` (the viewport term, the 100px ceiling).
