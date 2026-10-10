# One tile palette in two ramps, a shared sheen, and a base-rule fallback

Date: 2026-10-10 · Status: accepted

## Context

The tile colours (MY-122) were 15 hand-written gradients, each starting at the end colour
of the previous tile. Neighbours blended into one another (128, 256 and 512 were barely
different), the ends had no common logic (64 from red to yellow, 1024 to dark olive, 2048
to black, 4096 and up purple, pink, blue and teal), and light text sat on light yellow and
orange: 12 of the 15 styles failed 3:1 on at least one end, the worst at 1.21:1. Values
above 16384 got their look from a chain of 14 `:not([data-value='…'])`, which had a
specificity of (0,16,0) and beat the own rule of any new value.

## Decision

- **Two ramps, one logic.** Colours are chosen in OKLCH and written as hex. 2 to 2048 is
  the "sunset" ramp: lightness falls (0.94 to 0.46), chroma rises, the hue turns one way
  from cream through gold, orange and red to magenta; 2048, the target, is the deepest
  tile and keeps its gold glow. 4096 and up is the same shape started again, so it reads
  as one system but clearly "past 2048": lavender, violet, deep blue. Every value without
  a rule shows the last colour. Neighbours in a ramp differ by at least 0.048 in OKLab.
- **Text** is dark (`#2e2620`) on tiles with OKLCH lightness 0.62 or more, light
  (`#f9f6f2`) below it. Every tile has at least 3:1 against both ends of its gradient;
  the lowest are 4.19 on the base colour and 3.50 on the light end (128).
- **Gradient: one shared sheen, not a pair per tile.** Each tile has one base colour
  token; `--tile-sheen`, a white 14% to 0% diagonal overlay, is laid over all of them.
  The author chose this over flat colours: it keeps the glossy look of the old UI, the
  light end of every tile is a fixed 14% over an already checked base, and the sheen is
  one token a theme can switch off.
- **Tokens.** All tile colours are custom properties on `:root` in `tiles.css`
  (`--tile-<value>`, `--tile-fallback`, `--tile-text-dark`, `--tile-text-light`,
  `--tile-sheen`, `--tile-2048-glow`); the rules only read them.
- **Fallback is the base rule.** `.grid-cell[data-value]` is the first rule in `tiles.css`
  and carries the fallback look; the per-value rules have the same specificity and win by
  coming later. No `:not()` chain. Adding a value is a token and one rule after the base.
- **Font sizes follow the digit count** (40, 35, 30, 25px, fallback 20px for six digits),
  each as the usual `clamp()`. This fixed 4096 and 8192 (25px), 16384 (20px) and the
  fallback (12px, which made 32768 and 65536 hard to read).
- `font-size` moved from the structure rule in `board.css` to `tiles.css`, otherwise the
  base rule would override it for every tile and leave a dead declaration.

## Consequences

- The light theme (MY-123) overrides tokens, not selectors. The palette is tuned for the
  dark page: the cream 2 and 4 will have little contrast with a light board, so it may
  need its own values for them or an outline.
- MY-126 (slide animations) moves tiles to their own elements. If they keep
  `data-value`, the base-first scheme and the tokens carry over with a renamed selector.
- A new colour has to keep the ramp's order and be checked against both ends of the
  gradient by hand; axe does not check gradients.
- Not changed: the win dialog's gradient (`#667eea` to `#764ba2`), which used to share its
  colours with the old 4096 tile.
- Rejected: a hand-written `from` / `to` pair per tile (it brings back the unrelated ends
  and doubles the tokens); `color-mix()` to derive the light end (Chrome 111+, Firefox
  113+, Safari 16.2+, newer than Vite's default `baseline-widely-available` target, and
  it cannot be lowered when the colour is a `var()`); flat colours (valid, one
  declaration away: drop `background-image` from the base rule).
