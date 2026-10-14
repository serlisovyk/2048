# Tile text reaches 4.5:1 against both ends of the tile's gradient

Date: 2026-10-14 · Status: accepted

## Context

`2026-10-10-tile-palette.md` asked for 3:1 between a tile's text and both ends of its gradient (the base colour and the
base lit by the 14% sheen). A tile can now be 40px wide, so its text can be 10 to 14px, and small text needs 4.5:1. At
320px on a 5x5 board the text of 128, 256, 8192 and 16384 measured 3.65 to 4.36:1. A bigger minimum font would not fit a
five-digit number in the cell; the sheen is what makes every tile glossy.

## Decision

- **Every tile's text is at least 4.5:1 against the base colour and against the base plus the sheen**, computed with the
  WCAG formula (axe does not check gradients). The text colours (`#2e2620` on light tiles, `#f9f6f2` on dark ones) do not
  change; the tile colours do.
- **Only the tiles that failed moved, in OKLCH, hue and chroma kept, lightness changed**: 128 `#c41d16`, 256 `#ba033d`,
  512 `#ac0157`, 1024 `#9c026a` and 2048 `#8a027c` are darker (the five share the ramp's spacing, so a neighbour had to
  follow 128), 8192 `#9b7be9` is lighter (dark text) and 16384 `#564ac2` is darker. Neighbours in a ramp are still at
  least 0.05 apart in OKLab and the ramps keep their order. 2048 is still the deepest tile of the first ramp and keeps its
  gold glow.
- **Both themes**: the tile colours are the same in both, so one check covers both.
- The favicon's 2048 tile and the link preview picture follow the tokens (`ai/skills/og-image.md`).
- Rejected: a larger minimum font (overflows 5x5 at 320px), a weaker sheen (changes every tile), a different text colour
  (dark text on red is worse).

## Consequences

- A new tile colour has to pass 4.5:1 on both ends (`ai/rules/style.md`).
- The GitHub social preview is not in the repository and shows the old shades until the author uploads the new picture.
- Refines `2026-10-10-tile-palette.md` (3:1 becomes 4.5:1, the listed colours change; its order, sheen and fallback stay).
