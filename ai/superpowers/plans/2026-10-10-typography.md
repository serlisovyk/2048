# MY-121 — Typography: a self-hosted font and tabular digits

Issue: MY-121 · Branch: `my-121-typography`

No spec: nothing about the game's behavior changes (moves, scoring, input, saved data,
dialogs). It is a visual change of the type: a different face, tabular digits. No
JavaScript changes either, so `ai/rules/oop.md` is not involved.

Blocker MY-109 is `Done`. MY-124 (the score "+N" pop: `ScoreView`, `GameController`, a
little `header.css` / `motion.css`) runs in parallel in its own worktree; this plan
touches none of those files (see section 4, step 5). No decision record is contradicted:
`2026-10-10-rejected-features.md` lists i18n as not planned, which matches the
Latin-only subset below.

**This issue says "compare with screenshots and choose one", so work stops after this
commit until the author picks the font (section 6).** Section 4 is written for the
recommended font (Rubik) and names what changes for each of the others.

## 1. What is wrong today

- `src/styles/base.css` sets `font-family: Arial, sans-serif` on `body` and nothing else
  (`button { font: inherit }`). On every system the game looks like an unstyled page.
- The project uses two weights only: normal (body text, labels) and `bold` (logo, scores,
  tiles, buttons, dialog headings). There is no italic and no other weight.
- Numbers matter in this UI (score, high score, tiles), and the face decides whether they
  keep their width: Arial's digits happen to be tabular, but any proportional face would
  make the score box "tremble" on every move.
- Fonts also decide box heights wherever `line-height` is `normal` (the score labels, the
  buttons, the dialog text): the fallback and the real face differ by up to 4px in the
  header (measured below), which is the layout jump the issue wants gone.

## 2. Decisions the author has already made

- **Latin only** (plus digits and basic punctuation). The UI is English, so no Cyrillic.
  This changes the issue's "латиница + кириллица"; the Fontsource Latin subset (Basic
  Latin, Latin-1 Supplement, general punctuation, `€`, `™`, minus) covers every string in
  the UI, including the apostrophe in "You've reached 2048!".
- **Self-hosted woff2, no CDN.** The font file lives in the repo and is served from the
  game's own origin. Official source: the `@fontsource/*` npm packages (v5.3.0), which ship
  ready Latin-subset woff2 files taken from the font projects. The file is copied into the
  repo; no runtime or dev dependency is added just to ship a font. Everything in this plan
  was measured on the files from those packages.
- **License travels with the font.** The font's license text goes next to the woff2 file
  (`src/fonts/OFL.txt`); no README license section (MY-110 removed it). OFL 1.1 asks for
  the license text and the copyright notice to accompany the font files, which this does.
  None of the candidates declares a Reserved Font Name, so subsetting needs no renaming.
- **The font has its own `size-limit` entry** and does not count against the JS budget.
- `font-display: swap` and a `<link rel="preload">` for the one file (from the issue).

## 3. The four candidates, compared on the real game

All four were injected into the unchanged game running in `yarn dev` (header and a board
with tiles 2 … 32768, then 1024 / 16384 / 65536 / 131072 and a 7-digit score and high
score, at 1000px and 320px) with `font-variant-numeric: tabular-nums` applied to the
score boxes and tiles, next to the current Arial. Screenshots are kept outside the repo,
in the session scratchpad, folder `my121/shots/`:

- `compare-fonts.png` — one image, five columns (Arial, Clear Sans, Inter, Rubik, Nunito),
  three rows (1000px; 320px with the widest tiles; 320px with tiles 2 … 32768);
- `closeup-fonts.png` — header and the 512 … 32768 tiles at 2x, per font;
- `digits-specimen.png` — `1111111` / `8888888` / `1234567` with and without `tabular-nums`;
- per-font crops: `<font>-d1000.png`, `<font>-m320a.png`, `<font>-m320b.png`.

| Font       | License    | Latin woff2                                            | `tnum` feature           | Digits without `tabular-nums` (em, bold) | Tile text / cell at 320px: 1024, 16384, 32768, 131072 | Widest tile at 1000px | `line-height: normal` | Header height at 320px / 1000px |
| ---------- | ---------- | ------------------------------------------------------ | ------------------------ | ---------------------------------------- | ----------------------------------------------------- | --------------------- | --------------------- | ------------------------------- |
| Arial      | system     | none                                                   | not needed               | all 0.556                                | 0.59, 0.65, 0.56, 0.67                                | 0.70                  | 1.15                  | 108.0 / 130.2                   |
| Clear Sans | Apache-2.0 | 41.8 kB (static 400 20.8 + 700 21.1)                   | no (`liga` and `kern`)   | 0.588 to 0.625, near-tabular, 6% spread  | 0.66, 0.70, 0.60, 0.74                                | 0.75                  | 1.34                  | 112.0 / 133.2                   |
| Inter      | OFL-1.1    | 48.3 kB variable `wght` 100–900 (static 400+700 48.0)  | yes                      | proportional: `1` 0.431, `0` 0.674       | 0.69, 0.75, 0.65, 0.78                                | 0.81                  | 1.21                  | 110.0 / 131.2                   |
| Rubik      | OFL-1.1    | 35.3 kB variable `wght` 300–900 (static 400+700 38.0)  | yes                      | proportional: `1` 0.497, `0` 0.680       | 0.71, 0.77, 0.66, 0.79                                | 0.83                  | 1.19                  | 109.0 / 130.2                   |
| Nunito     | OFL-1.1    | 39.1 kB variable `wght` 200–1000 (static 400+700 32.5) | no, digits already equal | all 0.600                                | 0.64, 0.70, 0.60, 0.72                                | 0.75                  | 1.36                  | 111.0 / 133.2                   |

Reading the table:

- **Fit.** At 320px the cell is 60px and the tile font is 16px (4 digits), 14px (5 digits
  in 16384) and 12px (the fallback: 32768 has 5 digits, 131072 has 6). Every candidate
  fits with room to spare: the worst case, Rubik's 131072, is 47.7px in a 60px tile. At
  1000px the cell is 100px and the widest is Rubik's 16384 at 82.8px. No font-size change
  is needed for any of them.
- **Tabular digits.** `tabular-nums` is a real fix for Inter and Rubik (their default
  digits differ in width by 27% and 36%) and does nothing for Nunito (digits are already equal, the
  feature is absent) and Clear Sans (no `tnum`; its digits stay within 6% of each other,
  at most about 1px per digit at the 28px score, but it is not a guarantee). Measured in
  Chrome with the real glyphs, not assumed.
- **Size.** A variable file is the smaller choice for Rubik (35.3 vs 38.0 kB static) and
  gives the weight axis for free; for Nunito two static weights (32.5 kB) beat the
  variable file (39.1 kB). The project uses 400 and 700 only, so static pairs are a
  valid option wherever they are smaller.
- **Vertical metrics.** With the Arial fallback the header is 130.2px tall (1000px) and
  108.0px (320px). Rubik changes it by 0px (1000px) and 1px (320px), Inter by 1 and 2px, Clear Sans by 3
  and 4px, Nunito by 3px at both, because of `line-height: normal` (step 3 below pins it).
- **Letterforms** (see `closeup-fonts.png`): Clear Sans is the closest to the original
  2048 but a light humanist; Inter is the neutral modern UI face; Rubik is a rounded
  geometric with heavy bold digits that suit the glossy tiles; Nunito is the softest, with
  the lightest bold.
- **Licenses.** Inter, Rubik and Nunito are OFL-1.1. Clear Sans is Apache-2.0, not OFL: it
  is as permissive, but it asks for the license text next to the files and for a notice
  on files that were changed, and a subset counts as changed.

### Recommendation: Rubik

- Smallest file of the variable candidates, 35.3 kB, with a working `tnum` and a weight
  axis the game can use later without another request.
- Its bold digits are the most game-like next to the gradient tiles and the gold score.
- Closest to Arial's box heights (0 / 1px difference), so the swap from the fallback
  moves the least.
- OFL-1.1, no Reserved Font Name, no extra obligations beyond `OFL.txt` next to the file.
- Cost: the widest digits of the four. They still fit (0.83 of the cell at worst) but the
  big tiles look tighter than with Arial or Nunito, and 700 is heavy; the weight can be
  lowered to 600 for tiles if the author wants it lighter (one declaration).

Second choice: **Inter**, if a neutral face is preferred: the best `tnum`, 48.3 kB.
**Clear Sans** only if "the same face as the original 2048" matters more than a working
`tabular-nums` and an OFL license. **Nunito** if the softest look is wanted; its digits are
tabular by default and two static weights are 32.5 kB.

## 4. How the change is made (for the chosen font)

1. **Files.** `src/fonts/rubik-latin-wght-normal.woff2` (35,348 bytes, from
   `@fontsource-variable/rubik@5.3.0`, `files/rubik-latin-wght-normal.woff2`) and
   `src/fonts/OFL.txt` (the package's `LICENSE`: copyright line and the OFL 1.1 text).
   Static candidates: two files, `…-latin-400-normal.woff2` and `…-latin-700-normal.woff2`.
2. **`@font-face` in `base.css`**, above the reset, written by hand:

   ```css
   @font-face {
     font-family: 'Rubik';
     font-style: normal;
     font-weight: 300 900;
     font-display: swap;
     src: url('../fonts/rubik-latin-wght-normal.woff2') format('woff2');
   }
   ```

   and `body { font-family: 'Rubik', Arial, sans-serif }`. No `unicode-range` (one subset,
   nothing to split). Vite hashes the file into `dist/assets/` and rewrites the URL.

3. **Pin the box heights.** `body { line-height: 1.15 }`, Arial's `normal`, so heights no
   longer depend on which face is active and the layout stays what it is today. Kept only
   if the measurement in section 5 shows it removes the 0 to 4px shift; elements that
   already set their own `line-height` (logo 1.1, scores 1.2) are unchanged.
4. **Preload in `index.html`**, next to the favicon link:
   `<link rel="preload" href="./fonts/rubik-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin />`.
   `crossorigin` is required (font fetches are CORS-mode even on the same origin; without
   it the preload is not reused and the file is downloaded twice). Checked on a throwaway
   build before this plan: Vite rewrites the preload `href` and the CSS `url()` to the same
   hashed file (`/assets/rubik-latin-wght-normal-<hash>.woff2`), so there is one request.
5. **Tabular digits: one declaration on `body`** (`font-variant-numeric: tabular-nums`,
   in `base.css` with the font). It is inherited, so it covers the score, the high score,
   the tiles and the dialogs' "2048", and it covers MY-124's "+N" pop for free. The issue
   asked for "score, high score and tiles"; every number in this UI is one of those, and
   a body-level rule keeps `header.css`, `board.css`, `tiles.css` and `motion.css` out of
   this change (MY-124 edits two of them). Rejected: separate rules per element, which
   duplicate the same line in three files and miss the next number added.
6. **Size budget.** `.size-limit.json` gets a third entry, `Font`:
   `dist/assets/*.woff2`, `"gzip": false, "brotli": false` (the woff2 is already Brotli,
   so the raw size is what travels), limit `40 kB` for Rubik (35.35 kB now). For another
   candidate: the file size rounded up to the next 5 kB. The JS and CSS entries do not
   match `*.woff2`, so the font never counts against them; the CSS grows by about 0.1 kB.
7. **Fallback metrics: conditional.** If the throttled run in section 5 shows the logo
   tile jumping by more than about 2px when the font arrives (Arial's "2048" at 36px is
   narrower than Rubik's), add a metric-adjusted fallback face named `Rubik Fallback`,
   put after `'Rubik'` in the stack, with numbers measured, not guessed. Otherwise not
   added: preload makes the swap rare, and it is more CSS to maintain. (Both conditions
   were met; see "What was measured" at the end for the result and for how the face
   differs from this sketch.)
8. **Tiles.** The digit ladder (40, 35, 30, 25px, fallback 20px, each a `clamp()`) stays
   as it is. If a different candidate than Rubik is chosen, the fit numbers above say it
   fits as well.

## 5. Docs, verification, and the Definition of Done

Docs in the same change:

- `ai/decisions/2026-10-10-self-hosted-font.md` (new, plus a line in
  `ai/decisions/README.md`): the chosen font and why; why self-hosted (one origin, no
  third-party domain, no extra DNS/TLS round trip, nothing to go wrong offline once the
  page is cached); Latin only and why (the author's decision, UI is English, i18n not
  planned); the license handling; swap + preload; `tabular-nums` on `body`; the separate
  budget; the rejected alternatives (CDN, system stack only, a custom subset below Latin).
- `ai/map.md`: `src/fonts/` (the file and `OFL.txt`), `base.css` row (`@font-face`, the
  font stack, `line-height`, `tabular-nums`), the `index.html` preload, the
  `.size-limit.json` row, the "What this project does NOT have" list (no third-party
  fonts).
- `ai/rules/style.md` (the typography rules: one family, weights 400 and 700, digits
  tabular on `body`, a new weight or face is a decision) and `ai/rules/assets-performance.md`
  (fonts: self-hosted woff2 in `src/fonts/` with its license, preload only the main file,
  `font-display: swap`, Latin only, its own budget, never a font CDN).
- `ai/skills/feature.md` (Avoid: a font from a CDN, a number that is not tabular) and
  `ai/skills/review.md` (a Typography check).
- `README.md`: one Features line and `fonts/` in the project structure. No license
  section: the license text sits next to the font.

Verification (`yarn lint`, `yarn format:check`, `yarn build`, `yarn size`, then the
browser, in headless Chrome over the DevTools Protocol on `yarn dev` (port 5191) and
`yarn preview` (port 5195)):

- Desktop and 320px: the font is applied (`getComputedStyle`, `document.fonts` is
  `loaded`), tiles 1024, 16384, 32768, 65536 and 131072 fit (text width / cell width),
  a 7-digit score and high score with the reset button fit the score boxes, no
  horizontal scroll, the header is as wide as the board.
- Network tab: the woff2 is requested once, from the game's own origin; every request on
  the page has that origin; `dist/` contains no `fonts.googleapis.com` / `gstatic`.
- Throttled network (Slow 4G, then Slow 3G via `Network.emulateNetworkConditions`, plus a
  case with the font request blocked): header, score boxes, board and tile rectangles
  before and after the swap. Expected: nothing but the logo may move, by at most a few px;
  the board never moves.
- Score does not tremble: put `1111111` and `8888888` in a saved game (and play moves
  that change the digits) and compare the score box's content width.
- Dialogs (win, game over, confirmation) and their buttons render in the font.
- `yarn size`: JS, CSS and Font numbers go in the report.

Then the Definition of Done is walked point by point, and the `review` skill is run over
the diff.

## 6. Open questions for the author

1. **Which font?** Recommendation: Rubik (section 3). Alternatives: Inter, Clear Sans,
   Nunito.
2. Anything else is decided in this plan with a default the author can overturn: Latin
   only (the author's decision), `OFL.txt` next to the file and not served from `dist/`
   (webfont practice, nothing in the OFL requires serving it), tabular digits as one
   declaration on `body`, pinned `line-height`, no fallback-metric face unless the
   measurement asks for it.

## Author's answers (2026-10-10)

1. The font is **Rubik**: the variable Latin woff2 copied into the repo as
   `src/fonts/rubik-latin-wght-normal.woff2` with `src/fonts/OFL.txt` next to it (the
   `OFL.txt` was dropped later, see 4), loaded through `@font-face` with
   `font-display: swap` and a preload link, exactly as in section 4.
2. The defaults of section 6 are accepted: `OFL.txt` only in the repo next to the woff2,
   `tabular-nums` once on `body`, `line-height` pinned on `body` only if the measurement
   shows it helps, the `size-adjust` fallback only if the throttled run shows a jump of
   more than 2px (it was added, then dropped, see 5), a separate `Font` entry in
   `size-limit` at 40 kB raw.
3. If the tile weight of 700 looks too heavy on the screenshots, it is reported to the
   author and not changed without them.
4. Second round, after the implementation was reported: **remove `src/fonts/OFL.txt`.**
   The woff2 carries the copyright notice (`name` table ID 0, "Copyright 2015 The Rubik
   Project Authors (https://github.com/googlefonts/rubik)") and the license reference (ID
   14, `https://scripts.sil.org/OFL`) in its own metadata, the way Google Fonts and Fontsource
   serve it, and OFL 1.1 section 2 allows that in place of a separate file. This replaces
   the "license text next to the woff2" of section 2. The file must stay as downloaded.
5. Second round: **remove the `Rubik Fallback` faces** (Arial with `size-adjust: 119%`) and
   go back to the stack `'Rubik', Arial, sans-serif`; the author finds them unclear and
   extra and accepts a small horizontal change for a moment on the first, uncached load.
   `line-height: 1.15` stays on `body`, because it still removes the vertical shift (see
   the last measurement below). This replaces step 7 of section 4.

## What was measured, and how the result differs from the sketch (2026-10-10)

Measured in headless Chrome over the DevTools Protocol on the `yarn preview` build, with
the cache off and the network throttled (Slow 4G: 150ms, 1.6 Mbps; Slow 3G: 400ms,
400 kbps), sampling every animation frame.

- **The jump was real.** With the plain Arial fallback the font arrived 100ms (Slow 4G)
  to 600ms (Slow 3G) after the first paint, and at that moment the logo widened by 15.2px
  at 1000px and 11.0px at 320px (the score text by 18 to 21px inside its fixed box), and
  at 320px the header grew by 1px (`line-height: normal`: Arial 108.0px, Rubik 109.0px).
  Both optional steps were therefore taken.
- **`line-height: 1.15` on `body`** removes the vertical shift. The page is 0.64px
  taller than the old Arial page at 320px (11px labels: 12.65px against Arial's rounded
  12px) and identical at 1000px.
- **`Rubik Fallback`** (built, then removed by answer 5) was two faces, not one: the regular `local('Arial')` and the real
  bold `local('Arial Bold'), local('Arial-BoldMT')` (the page uses 400 and 700), both
  with `size-adjust: 119%`, the ratio of Rubik's bold tabular digit (0.662 em) to Arial's
  (0.556 em). There is no `ascent-override` / `descent-override`: with the pinned
  line-height they would move the baseline by 0.15px at 36px and nothing else. The
  fallback state was forced with `font-family: 'NoSuchFont', 'Rubik Fallback', …` and
  confirmed to use `Arial-BoldMT` (`CSS.getPlatformFontsForNode`): the logo is 116.44px
  wide against Rubik's 116.45px at 1000px, 90.75 against 90.78 at 320px.
- **With the face:** the throttled runs showed no element moving at the swap; only glyph
  shapes changed inside the same boxes. (Blocking the woff2 request cannot reproduce the
  fallback here: the machine has Rubik installed, and Chrome then falls back to the system
  copy.)
- **Without the face, as shipped** (stack `'Rubik', Arial, sans-serif`, `line-height: 1.15`),
  throttled `yarn preview`, cache off: the font ends 40 to 60ms (Slow 4G) and about 600ms
  (Slow 3G) after the first paint. At that frame the logo widens by **15.2px at 1000px and
  11.0px at 320px**; the score text grows by 17.8px and the high score text by 20.8px at
  1000px (12.7px and 14.8px at 320px) inside their fixed boxes; at 320px the high score
  element also grows by 5.7px (its own grid track). Nothing moves vertically: no
  `y` or height of any element changes, the board does not move. Without the pinned
  `line-height` the same swap at 320px also makes the header 1px taller and moves the
  board by 0.5px, so the pin is kept.
- Other numbers, `yarn preview`: one font request, `/assets/rubik-latin-wght-normal-<hash>.woff2`,
  200, 35,348 bytes, from the page's own origin, started by the preload link; no request
  to any other origin; no `http(s)://` string anywhere in `dist/`. The widest tile of
  all widths from 320px to 1280px is 0.83 of its cell (16384 at 1000px); at 320px
  131072 is 0.79. A 7-digit score and high score with the reset button fit the boxes at
  every width from 320px.
- `yarn size`: JS 4.25 kB, CSS 2.52 kB (both gzip), Font 35.35 kB raw; CSS 2.47 kB after the
  fallback faces were removed.
