# MY-122 — One tile palette and a simpler fallback selector

Issue: MY-122 · Branch: `my-122-tile-palette`

No spec: nothing about the game's behavior changes (moves, scoring, input, saved data,
dialogs). It is a visual change of the tiles; the target palette and its contrast
numbers are in section 2 of this plan.

Blocker MY-109 is `Done`. Related, not blocking: MY-126 (slide animations — tiles become
separate elements, section 4) and MY-123 (light/dark theme — section 4). No decision
record is contradicted: `2026-10-10-rejected-features.md` rejects a `prefers-contrast`
mode, and this is the ordinary palette, not a contrast mode.

**This issue says "decide in the plan: gradients or flat colours", so work stops after
this commit until the author answers the questions in section 5.**

## 1. What is wrong today

`src/styles/tiles.css` has 15 hand-written `linear-gradient(135deg, …)` rules. Each
tile's gradient starts at the previous tile's end colour, so neighbours blend into one
another instead of being different tiles, and the chain breaks in odd places:

- 64 goes from red to yellow, 1024 from gold to dark olive (`#3c3c0c`), 2048 from brown
  to black; 4096, 8192, 16384 and the fallback are purple, pink, blue and teal with no
  link to the rest.
- 128, 256 and 512 are `#edcf72` → `#edcc61` → `#edc850`: almost the same colour.
- The fallback for values above 16384 is a chain of 14 `:not([data-value='…'])`. Its
  specificity is (0,16,0), so it beats any per-value rule: a new value's own rule is
  ignored unless the value is also appended to the chain.
- Text contrast is broken. Light text `#f9f6f2` sits on light yellow and orange. Measured
  with the WCAG formula, **12 of the 15 tile styles fail 3:1 on at least one end** (worst
  1.21:1):

| Tile   | Gradient ends                    | Text      | Contrast at the ends |
| ------ | -------------------------------- | --------- | -------------------- |
| 2      | `#eee4da` → `#ede0c8`            | `#776e65` | 3.98 / 3.83          |
| 4      | `#ede0c8` → `#f2b179`            | `#f9f6f2` | 1.21 / 1.72 FAIL     |
| 8      | `#f2b179` → `#f59563`            | `#f9f6f2` | 1.72 / 2.08 FAIL     |
| 16     | `#f59563` → `#f67c5f`            | `#f9f6f2` | 2.08 / 2.45 FAIL     |
| 32     | `#f67c5f` → `#f65e3b`            | `#f9f6f2` | 2.45 / 2.96 FAIL     |
| 64     | `#f65e3b` → `#edcf72`            | `#f9f6f2` | 2.96 / 1.42 FAIL     |
| 128    | `#edcf72` → `#edcc61`            | `#f9f6f2` | 1.42 / 1.45 FAIL     |
| 256    | `#edcc61` → `#edc850`            | `#f9f6f2` | 1.45 / 1.50 FAIL     |
| 512    | `#edc850` → `#edc53f`            | `#f9f6f2` | 1.50 / 1.54 FAIL     |
| 1024   | `#edc22e` → `#3c3c0c`            | `#f9f6f2` | 1.58 / 10.57 FAIL    |
| 2048   | `#3d2817` → `#000000`            | `#f9f6f2` | 12.87 / 19.49        |
| 4096   | `#667eea` → `#764ba2`            | `#f9f6f2` | 3.40 / 5.91          |
| 8192   | `#764ba2` → `#f093fb`            | `#f9f6f2` | 5.91 / 1.90 FAIL     |
| 16384  | `#f093fb` → `#4facfe`            | `#f9f6f2` | 1.90 / 2.25 FAIL     |
| 32768+ | `#30cfd0` → `#330867` (fallback) | `#f9f6f2` | 1.78 / 14.21 FAIL    |

- Smaller leftovers in the same rules: `font-weight: bold` is repeated in most rules
  although the base `.grid-cell[data-value]` rule in `board.css` already sets it; the
  digit-based font ladder is off (1024/2048 are 30px but 4096/8192 are 25px, and the
  fallback is 12px, so 32768 and 65536 are tiny next to 16384).

"Before" screenshots of every value (2 … 131072, desktop, 375px, 320px) were taken from
the current `main` and are kept outside the repo; the after screenshots will be taken
from the finished implementation and shown next to them.

## 2. The palette — one logic, two ramps

Colours are built in OKLCH (perceptually even steps), then written down as plain hex.

- **Main ramp, 2 → 2048 ("sunset"):** lightness falls steadily (0.94 → 0.46), chroma
  rises (0.02 → 0.20), and the hue turns one way through cream, gold, amber, orange,
  red, rose to magenta (88° → 340°). 2048, the target, is the deepest and most
  saturated tile and keeps its gold glow (`box-shadow`), as today.
- **Senior ramp, 4096 and up:** the same shape started again, so it reads as the same
  system but clearly "past 2048": lightness resets high and falls again (0.76 → 0.44),
  the hue carries on round the wheel from the magenta of 2048 through lavender and
  violet to deep blue (305° → 268°). Every value above 16384 shows the last colour,
  the deep blue, through the fallback.
- **Text:** dark `#2e2620` where the tile's lightness is 0.62 or more, light `#f9f6f2`
  below it. Light text stays the existing `#f9f6f2`.
- Neighbouring tiles differ by at least 0.048 in OKLab inside a ramp (today the end
  colours of 128, 256 and 512 are only 0.012–0.016 apart); the break between 2048 and
  4096 is 0.33.

The same hex values serve both options. **Option A (gradient)** lays one shared sheen
over them, `linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0))`: the
bottom-right end of every tile is the base colour, the top-left end is that colour 14%
lighter. **Option B (flat)** is the base colour alone. So the choice is a single
declaration, `background-image: var(--tile-sheen)` or none, and the contrast needs two
checks for A (both ends) and one for B.

| Tile   | Token             | Text  | Base (B, and A's bottom-right) | A's top-left | Contrast, base | Contrast, A's top-left |
| ------ | ----------------- | ----- | ------------------------------ | ------------ | -------------- | ---------------------- |
| 2      | `--tile-2`        | dark  | `#f1ebdb`                      | `#f3eee0`    | 12.48          | 12.81                  |
| 4      | `--tile-4`        | dark  | `#ecdeb1`                      | `#efe3bc`    | 11.07          | 11.58                  |
| 8      | `--tile-8`        | dark  | `#eec96c`                      | `#f0d181`    | 9.34           | 10.00                  |
| 16     | `--tile-16`       | dark  | `#f2ab35`                      | `#f4b751`    | 7.53           | 8.30                   |
| 32     | `--tile-32`       | dark  | `#f48815`                      | `#f69936`    | 5.92           | 6.74                   |
| 64     | `--tile-64`       | dark  | `#f0621d`                      | `#f2783d`    | 4.57           | 5.32                   |
| 128    | `--tile-128`      | light | `#db392d`                      | `#e0554a`    | 4.21           | 3.50                   |
| 256    | `--tile-256`      | light | `#cf2848`                      | `#d64662`    | 4.81           | 3.97                   |
| 512    | `--tile-512`      | light | `#bd1359`                      | `#c63470`    | 5.73           | 4.72                   |
| 1024   | `--tile-1024`     | light | `#ad0468`                      | `#b8277d`    | 6.51           | 5.38                   |
| 2048   | `--tile-2048`     | light | `#99007a`                      | `#a7248d`    | 7.40           | 5.94                   |
| 4096   | `--tile-4096`     | dark  | `#c0a1e4`                      | `#c9aee8`    | 6.69           | 7.57                   |
| 8192   | `--tile-8192`     | dark  | `#9575e2`                      | `#a488e6`    | 4.19           | 5.12                   |
| 16384  | `--tile-16384`    | light | `#6359d2`                      | `#7970d8`    | 5.01           | 3.81                   |
| 32768+ | `--tile-fallback` | light | `#3049a4`                      | `#4d62b1`    | 7.45           | 5.27                   |

Lowest values: flat **4.19**, gradient **3.50** (the light end of 128). Every tile
clears the issue's 3:1 on both ends, and most clear 4.5:1 too. Before: 1.21.

Other tokens: `--tile-text-dark: #2e2620`, `--tile-text-light: #f9f6f2`,
`--tile-sheen` (the overlay above, or `none` for flat), `--tile-2048-glow:
rgba(255, 196, 60, 0.6)`.

Preview screenshots of both options (the same board, drawn by injecting this palette
into the unchanged page; not committed): before / A / B side by side, desktop and
375px. Both look consistent; A keeps today's glossy character, B is cleaner.

### Recommendation: option A (gradient, shared sheen)

- It keeps the character of the current UI (gradient tiles, the gradient win dialog) and
  fixes what was actually wrong, which was the unrelated, neighbour-chained endpoints,
  not that tiles had a gradient.
- It is one overlay for all tiles: no per-tile gradient pairs, so no 15 more
  hand-picked endpoints and no two-end contrast hunt for each; the lighter end is a
  fixed 14% over a base that is already checked.
- Because the base colour is a `background-color` and the sheen is the same on every
  tile, a colour change after a merge interpolates over the existing 0.1s `transition`
  (an image cannot interpolate, so the old gradients flipped at once). To be looked at in
  the browser; it is a side effect, not a goal.
- The sheen is a token, so the light theme (MY-123) can turn it off or change it in one
  place.
- Cost: light text sits on a slightly lighter end (3.50 at worst, instead of 4.21).
  If that margin is not wanted, option B is a one-line change.

Rejected: a hand-written `from`/`to` pair per tile (it recreates today's problem and
doubles the tokens); `color-mix()` to derive the light end (Chrome 111+, Firefox 113+,
Safari 16.2+, below Vite's default `baseline-widely-available` target, and it cannot be
lowered when the colour is a `var()`).

## 3. How the CSS changes

`src/styles/tiles.css`:

```css
:root {
  --tile-sheen: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.14),
    rgba(255, 255, 255, 0)
  );
  --tile-text-dark: #2e2620;
  --tile-text-light: #f9f6f2;
  --tile-2: #f1ebdb;
  /* … one token per value … */
  --tile-fallback: #3049a4;
  --tile-2048-glow: rgba(255, 196, 60, 0.6);
}

/* Fallback: every value without a rule of its own below (32768 and up). */
.grid-cell[data-value] {
  background-color: var(--tile-fallback);
  background-image: var(--tile-sheen);
  color: var(--tile-text-light);
  font-size: clamp(12px, 2vw, 20px);
}

.grid-cell[data-value='2'] {
  background-color: var(--tile-2);
  color: var(--tile-text-dark);
  font-size: clamp(20px, 4vw, 40px);
}
/* … one rule per value; 2048 adds box-shadow: 0 0 20px var(--tile-2048-glow) … */
```

(The font sizes shown are the proposal of question 3; the sheen line is option A, and
for option B the base rule has no `background-image`.)

- **The `:not()` chain is deleted.** The base `.grid-cell[data-value]` rule comes first
  in the file; the per-value rules have the same specificity (0,2,0), so they win by
  coming later, and any value without a rule falls through to the base. Adding a value is
  a token plus one rule after the base; nothing else is touched.
- **`board.css`:** its `.grid-cell[data-value]` rule keeps the tile structure (bold,
  `transition`, shadow). Its `font-size` line moves to `tiles.css`, otherwise the base
  rule in `tiles.css` (later file, same specificity) would override it for every tile
  and leave a dead line behind.
- The repeated `font-weight: bold` lines in `tiles.css` go (dead: the structure rule
  already sets it).
- Tokens sit on `:root` in `tiles.css`, next to the rules that use them (the focus ring
  token is on `:root` in `base.css` the same way).
- No JavaScript changes. `GridView` still sets `data-value`; the CSS keys on the literal
  values as it does today (the 2048 rule is the only one that is about a game concept).

## 4. Interaction with the other open issues

- **MY-126 (slide animations)** moves tiles to their own elements. The tile elements
  must keep `data-value`; then the base-first scheme and the tokens carry over by
  renaming the selector, and the tile structure rule in `board.css` goes with them.
- **MY-123 (light/dark)** gets the tile colours as tokens it can override under
  `[data-theme='light']`. The palette is tuned for the current dark page: the cream
  tiles 2 and 4 will have little contrast with a light board, so the light theme may
  need darker values for them or an outline; that is MY-123's to decide, together with
  the sheen. The win dialog's gradient (`#667eea` → `#764ba2`, `overlays.css`) used to share
  its colours with the 4096 tile; it is not part of this issue and is left as is.

## 5. Questions for the author

1. **Gradient or flat?** Recommendation: A, the gradient (shared sheen). The same hex
   values for both, so it is one declaration to flip.
2. **Palette:** sunset ramp (cream → gold → orange → red → magenta, 2048 the deepest,
   with the gold glow) and a lavender → blue senior ramp from 4096. Alternatives if
   you do not like it: 2048 as a bright gold tile instead of the end of the ramp, or a
   senior ramp in teal/green. Say so and the numbers are re-run.
3. **Font sizes.** The fallback is being rewritten anyway. Sizes follow the digit count
   (40, 35, 30px, five px less per digit), but 4096/8192 and everything from 16384 up
   break that ladder and are too small; 32768 and 65536 are drawn at 12px. Proposal
   (otherwise today's sizes stay, fallback 12px):

   | Digits | Values            | Now  | Proposal |
   | ------ | ----------------- | ---- | -------- |
   | 1–2    | 2 … 64            | 40px | 40px     |
   | 3      | 128 … 512         | 35px | 35px     |
   | 4      | 1024, 2048        | 30px | 30px     |
   | 4      | 4096, 8192        | 25px | **30px** |
   | 5      | 16384             | 20px | **25px** |
   | 5–6    | 32768+ (fallback) | 12px | **20px** |

   (Each size keeps its existing `clamp()` shape; the 6-digit `131072` at 20px is about
   67px wide in a 100px tile, checked in the browser later.)

## 6. Where each part lives

| File                                                              | Change                                                                                                                                                                                       |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/styles/tiles.css`                                            | Rewritten: tokens on `:root`, base fallback rule, one rule per value. No `:not()`.                                                                                                           |
| `src/styles/board.css`                                            | `font-size` leaves `.grid-cell[data-value]`.                                                                                                                                                 |
| `ai/rules/style.md`                                               | New "Tile colours" bullets: where they live, tokens, text colour rule, the 3:1 rule on both ends, how to add a value, no `:not()` chains.                                                    |
| `ai/map.md`                                                       | `tiles.css` and `board.css` rows.                                                                                                                                                            |
| `ai/skills/feature.md`, `ai/skills/review.md`                     | One line each: a new tile value is a token + a rule; review checks contrast and the absence of an exclusion chain.                                                                           |
| `ai/decisions/2026-10-10-tile-palette.md` + `decisions/README.md` | New record: one OKLCH-derived palette in two ramps, a shared sheen instead of per-tile gradients, base-rule fallback instead of the `:not()` chain; rejected: per-tile pairs, `color-mix()`. |
| `README.md`                                                       | Checked; its structure list line for `tiles.css` stays accurate.                                                                                                                             |

## 7. Commits

1. `docs:` this plan (before any code).
2. `refactor:` replace the fallback `:not()` chain with a base rule (same colours, no
   visual change), move the tile `font-size` into `tiles.css`, drop the repeated
   `font-weight`.
3. `style:` one tile palette from CSS custom properties (the table above, the chosen
   option, the font sizes from question 3).
4. `docs:` rules, skills, map, decision record.

## 8. Verification

`yarn lint`, `yarn format:check`, `yarn build`, `yarn size` (now: CSS 2.13 kB gzip of a
4 kB budget, JS 4.25 kB of 8 kB; this change should not grow the CSS noticeably), then
`yarn dev --port 5192 --strictPort`:

- Put every value on the board through the saved game (`localStorage.savedGame`, one
  empty cell so the game is not "over"): 2 … 32768 on one board, 65536 and 131072 on
  another, plus a value beyond (262144, 524288) to prove the fallback catches anything.
  Desktop width, 375px and 320px (the narrowest supported).
- From the computed styles, check each tile's `background-color`, `background-image`
  (the sheen) and `color` against the table and recompute the contrast from the
  rendered values, so the table and the page cannot drift apart; check the corner
  pixels of a screenshot against the "top-left" column for option A.
- Read the font size of each value and check that the widest text fits in its tile at
  every width (131072 is the widest).
- `grep` that `tiles.css` has no `:not(`.
- Play a few moves: tile colours follow the values when tiles merge and spawn; the
  `new-cell` / `merged-cell` animations still run; with `prefers-reduced-motion`
  nothing breaks (no animation was added).
- Before / after comparison images of the same board.

Not covered by the checks: how the palette looks on a light page (the theme is MY-123).
