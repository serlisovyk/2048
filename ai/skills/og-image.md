---
name: og-image
description: Use when the tile palette, the logo gold, a page colour or the author's name changes — remake the link preview images (public/og-image.png, the GitHub social preview) and the favicon.
---

# Link preview image and favicon

What a chat or a social network shows for the link, and the tab icon. They are finished files, not generated:
no script, no image dependency (`ai/decisions/2026-10-12-og-preview-image.md`). The meta tags and the size rules
are in `ai/rules/assets-performance.md`.

## When to use

Remake the PNG, render and re-upload the GitHub social preview, and recheck the favicon when the tile palette,
the logo gold, a page colour in `theme.css` or the author's name changes. Nothing else tells you they went
stale. A change of header buttons does not: the picture has no toolbar on purpose.

## Files

- `public/og-image.png`, 1200×630: copied as it is to `dist/` and served at `/og-image.png`. Outside every
  `size-limit` entry; keep it well under 200 kB.
- The social preview, 1280×640, for GitHub → Settings → Social preview: the same scene, rendered at that size
  and uploaded by hand. It is not kept in the repo.
- `src/favicon.svg`: hashed by the build, not themed. A dark square (`--page-bg`), the board (`--surface-border`)
  and four tiles in reading order: the 2 tile, the logo gold, the 64 tile and the 2048 tile (`--tile-2`,
  `--tile-64`, `--tile-2048`, the end of `--logo-bg`). An SVG cannot read the CSS tokens, so the literals
  are copies: change them with the palette. Four colours that stay distinct at 16px.

## The picture

The background is cut by a straight line from the bottom-left to the top-right corner into the dark page colour
(top-left triangle) and the light one (bottom-right). The 4x4 board is in the middle, its centre on the image's
centre, so the line crosses it through the middle: half of the panel and of the empty cells are the dark theme,
half the light one (the tiles look the same in both). Top-left, beside the board: the header logo scaled down,
entirely in the dark triangle. At the bottom, centred under the board: `Serhii Lisovyk`, entirely in the light
triangle. No tagline, no toolbar.

## How to make it

One HTML page that holds the same scene twice, scoped to a wrapper, with `theme.css`, `tiles.css` and
`board.css` read from the repo (selectors `:root` to the wrapper, so the values are the real ones) and Rubik
inlined from `src/fonts/`: a `light` copy filling the page and a `dark` copy on top, clipped with
`clip-path: polygon(0 0, 100% 0, 0 100%)`.

- **Board**: the game's own structure with `--cell-size: 92px`, `--cell-gap: 12px` (container and grid padding
  equal to the gap, 452px in all), centred by absolute position, tiles from `tiles.css` as they are. Rows top
  to bottom: `2048 1024 256 64`, `512 128 · ·`, `· · 16 4`, `32 8 2 2`. The tiles run from the dark side to the
  light one in order of their distance from the line; the four empty cells are the ones the line cuts (each
  shows both themes). A third copy of just the tiles, not clipped and without shadows, is laid over both so the
  line passes behind the tiles and never through one (two clipped copies of a tile leave a hairline).
- **Logo**: `--logo-bg`, `--on-gold`, `--logo-shadow`, Rubik 700 at 84px, padding 10px 28px, radius 20px, its
  right edge 50px left of the board and its top level with the board's.
- **Name**: Rubik 500 at 30px, letter-spacing 0.06em, `--text-muted` of the light theme, 24px from the bottom
  edge, drawn in the light copy only.
- **Render** in headless Chrome (`--headless=new`, `--force-color-profile=srgb`) with `Page.captureScreenshot` at
  an exact viewport of 1200×630 and of 1280×640, then re-encode losslessly with `node:zlib` (RGB, per-row
  filter search, level 9).

## Check

Read the pixels: top-left is the dark `--page-bg`, bottom-right the light one; the two page colours 10px either
side of the line away from the board; the dark empty cell (about `#434343`) and the light one (about `#cec4b7`)
in the cells on either side of the line; the logo box stays inside the dark triangle and the name box inside the
light one. The declared `og:image:width` / `height` equal the file's.

## After a deploy

Crawlers cache the card and the file name does not change. Refresh Telegram with `@WebpageBot` and LinkedIn with
its Post Inspector; opengraph.xyz shows what a crawler reads.
