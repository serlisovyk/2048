# Rubik, self-hosted, Latin only, with tabular digits

Date: 2026-10-10 · Status: accepted

## Context

The game used `Arial, sans-serif`, which looks like an unstyled page. Numbers carry the UI
(score, high score, tiles), so the face also has to keep digits the same width. MY-121 put
four open-licensed candidates on the real game at 1000px and 320px: Clear Sans (the face of
the original 2048), Inter, Rubik and Nunito. Measured, not assumed: file size, `tnum`
support, how wide the digits are, whether the widest tiles fit at 320px.

| Font       | License    | Latin woff2                | `tnum` | Digits by default | Widest tile at 320px (text / cell) |
| ---------- | ---------- | -------------------------- | ------ | ----------------- | ---------------------------------- |
| Clear Sans | Apache-2.0 | 41.8 kB (static 400 + 700) | no     | near-equal        | 0.74                               |
| Inter      | OFL-1.1    | 48.3 kB variable           | yes    | proportional      | 0.78                               |
| Rubik      | OFL-1.1    | 35.3 kB variable           | yes    | proportional      | 0.79                               |
| Nunito     | OFL-1.1    | 39.1 kB variable           | no     | equal             | 0.72                               |

## Decision

- **Rubik**, the variable file (weight axis 300 to 900), **Latin subset only**. The author
  chose it from the comparison. It is the smallest variable file of the four, its `tnum`
  works (its default digits differ in width by 27%), its bold digits suit the gradient
  tiles, and its box heights are the closest to Arial's. The widest tile (131072, 12px)
  takes 0.79 of its cell at 320px and 16384 takes 0.83 at 1000px: everything fits, so the
  tile font sizes did not change.
- **Latin only** is the author's decision: the UI is English and i18n is not planned
  (`2026-10-10-rejected-features.md`). It replaces the issue's "Latin + Cyrillic". The file
  is the ready Latin subset from Fontsource (`@fontsource-variable/rubik@5.3.0`,
  `files/rubik-latin-wght-normal.woff2`: Basic Latin, Latin-1, general punctuation, `€`,
  `™`, minus). It is copied into the repo; no dependency was added to ship a font.
- **Self-hosted, no font CDN.** `src/fonts/rubik-latin-wght-normal.woff2` is hashed by
  Vite into `dist/assets/` and served from the game's own origin, so the page makes no
  request to a third-party domain (no extra DNS and TLS connection, nothing a content
  blocker or a privacy setting can cut, and the game works offline once the page is
  cached). `rules/assets-performance.md` already forbids third-party runtime scripts; this
  extends it to fonts.
- **License travels with the file.** `src/fonts/OFL.txt` (Fontsource's `LICENSE`: the
  copyright line and the OFL 1.1 text) sits next to the woff2. The OFL asks for exactly
  that, and no Reserved Font Name is declared, so the subset needs no renaming. There is
  no README license section (`2026-10-10-license-in-package-json.md`), and `OFL.txt` is
  not copied into `dist/`.
- **Loading.** `@font-face` in `base.css` with `font-display: swap`, and one
  `<link rel="preload" as="font" type="font/woff2" crossorigin>` in `index.html`. The
  `crossorigin` is required (font fetches are CORS-mode even on the same origin), and Vite
  rewrites the preload `href` and the CSS `url()` to the same hashed file, so there is one
  request.
- **The layout does not move when the font arrives.** Before this, on a throttled preview
  build the swap widened the logo by 15px (1000px) and 11px (320px) and made the header 1px
  taller at 320px. Now `body` has `line-height: 1.15` (Arial's `normal`), so box heights do
  not depend on the active face, and a fallback face `Rubik Fallback` (the system Arial,
  regular and bold, `size-adjust: 119%`) stands in until Rubik loads. 119% is the ratio of
  Rubik's bold tabular digit (0.662 em) to Arial's (0.556 em); the digits fix the width of
  the logo, the one element whose width comes from its text. Measured after: nothing moves
  at the swap, only glyph shapes change.
- **Tabular digits** are one `font-variant-numeric: tabular-nums` on `body`. It is
  inherited, so the score, the high score, the tiles and the dialogs get it, and so does
  any number added later (the score "+N" pop of MY-124).
- **Two weights**: 400 and 700 (`bold`). The variable file covers others, but the UI does
  not use them.
- **Budget.** `.size-limit.json` has a `Font` entry for `dist/assets/*.woff2`, 40 kB on the
  raw file (woff2 is already Brotli-compressed). The file is 35.35 kB. It does not count
  against the JS or CSS budgets.

## Consequences

- A new weight inside 300 to 900 needs no new file. An italic, another script (Cyrillic,
  Latin Extended) or another face is a new decision and a new woff2 with its own budget.
- The 119% of the fallback face belongs to Rubik's digit width: if the font is replaced, it
  is measured again. The same goes for the pinned `line-height`.
- Fonts are not a place for third-party hosts: a `<link>` to Google Fonts or any other CDN
  is out, for the reasons above.
- Updating Rubik means replacing the woff2 and `OFL.txt` from a newer Fontsource release
  (the source file name stays the same, Vite hashes it in the build).
- The bold 700 of Rubik is heavy on the big tiles. The author can lower the tile weight (one
  declaration) if it looks too heavy; it was not changed.
- Rejected: Clear Sans (no `tnum`, Apache-2.0 rather than OFL, 41.8 kB for two files);
  Inter (the largest file, 48.3 kB); Nunito (no `tnum` feature, the lightest bold);
  Google Fonts or another CDN (a third-party request and domain); a system font stack only
  (the problem the issue started from); a custom subset narrower than Latin (needs
  subsetting tooling that is not part of the project, for a few kB); separate
  `tabular-nums` rules on the score and the tiles (the same line in three files, and the
  next number added would miss it); `font-display: optional` (a slow first visit would keep
  the fallback for the whole page view).
