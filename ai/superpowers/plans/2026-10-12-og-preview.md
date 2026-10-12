# MY-131 — Link preview: `og:image`, `og:url`, Twitter card, GitHub social preview

Issue: MY-131 · Branch: `my-131-og-preview` · No spec: nothing a player sees in the game
changes (the page, the board, the controls and the saved data are untouched); what changes is
what a chat or a social network shows for the link, and the tab icon. This plan is the
record.

Blockers MY-122 (tile palette) and MY-123 (light/dark tokens) are `Done` and in the branch
base, so the image can show the final look. MY-128 (board sizes) runs in parallel in another
worktree; this issue touches the `<head>` meta tags, `public/`, `src/favicon.svg`,
`.github/` and docs, so the only expected overlap is a few lines in `ai/map.md`.

## Author's answers (2026-10-12)

Final; copied from the issue's «Решения автора» and the coordinator's follow-up.

- **The image.** The background is cut in half by a diagonal into the dark and the light
  theme. It holds the gold `2048` logo, a short tagline, and a board with tiles in our palette
  (the real hex values from `src/styles/theme.css` and `tiles.css`, Rubik from `src/fonts/`).
  **No toolbar**, so the image does not go stale when the header buttons change. A 1200×630
  PNG for Open Graph / Twitter, and a 1280×640 variant for GitHub's Social preview (the
  author uploads that one by hand; it is not deployed).
- **The diagonal.** It is not a vertical stripe: the background is cut exactly in half by a
  straight line from the **bottom-left corner to the top-right corner** of the image, corner
  to corner, for both 1200×630 and 1280×640. One triangle is the dark theme's page colour, the
  other the light theme's. I pick which triangle is which so the logo, the tagline and the
  board stay readable, and an element that crosses the line must stay legible on both sides.
- **Only the finished PNGs go into the repo**, in `public/`. No generator script, no new
  dependencies. `ai/map.md` says in a few lines how they were made (an HTML template rendered
  and screenshotted in headless Chrome) so they can be remade.
- **Recolour `src/favicon.svg`** to the new palette in this task (the logo gold and the tile
  colours), so the tab icon, the preview and the game match.
- **Meta tags** with absolute URLs on `https://2048-xi-three.vercel.app/`: `og:image`,
  `og:image:width`, `og:image:height`, `og:image:alt`, `og:url`, `twitter:card` =
  `summary_large_image` (plus `twitter:image` if useful). The existing `og:title`,
  `og:description` and `og:type` stay.
- **GitHub Social preview** is uploaded by the author by hand; the task prepares the
  1280×640 variant.
- **README.md** (the author's note, 2026-10-12): the Features and Architecture Notes
  sections are already too bloated. At most replace the existing "Basic metadata and Open
  Graph title/description" line with one short line (e.g. "Link preview image for social
  networks (Open Graph, Twitter card)") and do not touch Architecture Notes. The details go
  into `ai/map.md`; the full README cleanup is MY-132.

## Decision records checked

None is contradicted.

- `2026-10-10-sources-in-src.md` — it already sets `publicDir: '../public'` and says `public/`
  "is created only when a file needs a stable URL". An Open Graph image is exactly that: a
  crawler needs a fixed absolute URL, and a hashed asset in `assets/` changes at every build.
  `public/` is created here. The favicon stays next to `index.html`, hashed by Vite.
- `2026-10-10-tile-palette.md`, `2026-10-10-theme-tokens-and-head-script.md` — the image
  uses the tokens' values as they are; nothing in `src/styles/` changes, so the rule
  "colours only through tokens" is not touched (the image and the SVG are not stylesheets).
- `2026-10-10-header-toolbar.md` — why the image has no toolbar: the buttons come and go.
- `2026-10-10-self-hosted-font.md` — the image is drawn with the same Rubik file; no
  third-party font and nothing loaded from a CDN, at build time or at run time.
- `2026-10-10-rejected-features.md` — no "share result", no PWA manifest, no `robots.txt` /
  `sitemap.xml` (`ai/rules/assets-performance.md`): only meta tags and an image.

## 1. The image

### 1.1 Geometry and layout

One template, rendered twice (1200×630 and 1280×640) with the same CSS: the layout is flex,
the board has a fixed size, the diagonal is a `clip-path` in percentages, so it runs corner
to corner at any size.

- **Which triangle is dark: top-left dark, bottom-right light.** The logo and the tagline are
  in the top-left, so they sit on the dark triangle and are checked to be entirely above the
  line (every corner of their boxes, with a margin). The board is on the right and the
  diagonal passes through it; it is the one element that crosses the line.
- **The board is cut by the same diagonal.** The whole scene is built twice with the theme
  tokens of each theme (the CSS files are read as they are and scoped to a `.scene` wrapper,
  so the values cannot drift from the game): the light scene fills the image, the dark scene
  is laid over it, clipped to the top-left triangle. So the board's panel, cells and tile
  shadows are dark above the line and light below it. The tiles are the same colours in both
  themes (only the depth shadow and the 2048 glow differ, and those follow the theme too).
  **Found while building:** two clipped copies of a tile leave a one-pixel dark hairline
  along the cut, so a third copy of just the tiles (no shadows, not clipped) is laid over
  both; the line then passes behind the tiles and never through a tile or a number. Every
  tile stays legible on both sides.
- **Logo** — the header's logo scaled up: the `--logo-bg` gold gradient, `--on-gold` text,
  Rubik 700 at 132px, `-0.02em`, the logo's shadow. **Tagline** — Rubik 400 at 48px in
  `--text`, two short lines: `Slide. Merge.` / `Reach 2048.`.
- **Board** — the game's structure at its largest size (cell 100px, gap 12px, two nested
  panels with the game's radii), `.tile` rules from `tiles.css` as they are. The tiles are a
  snake, the way a game ends up: 2048 in the corner, then 1024, 512, 256, 128 … 2, so the
  whole ramp from cream to the 2048 magenta is visible, with a few empty cells.
- Rubik is loaded from `src/fonts/rubik-latin-wght-normal.woff2` (weights 400 and 700).

### 1.2 Files

| File                         | Size     | Where it is used                                                   |
| ---------------------------- | -------- | ------------------------------------------------------------------ |
| `public/og-image.png`        | 1200×630 | `og:image` (and the Twitter card, which falls back to `og:image`)  |
| `.github/social-preview.png` | 1280×640 | GitHub → Settings → Social preview, uploaded by hand, not deployed |

`public/` is copied as it is to the root of `dist/` (a stable URL `/og-image.png`);
`.github/` is not part of the build. The size-limit entries only match `dist/assets/*.js`,
`*.css` and `*.woff2`, so the PNG is outside the budgets. Chrome's PNGs were 125,827 and
119,936 bytes; a throwaway zlib re-encode (RGB, per-row filter search, level 9, lossless,
checked by decoding it back) made them **105,518** and **98,440** bytes. Nothing of it is in
the repo.

### 1.3 How it is made

An HTML template and a small Node script live outside the repo (the session's scratchpad):
the script reads `theme.css`, `tiles.css` and `board.css`, scopes them to `.scene`, inlines
Rubik, writes the page, opens it in headless Chrome (`--headless=new`, an exact viewport) and
saves `Page.captureScreenshot` as a PNG. The recipe (sizes, tile layout, tagline, the three
layers) is written in `ai/map.md`, because the template itself is not committed (the
author's decision).

## 2. Meta tags (`src/index.html`)

After `og:type`:

```html
<meta property="og:url" content="https://2048-xi-three.vercel.app/" />
<meta property="og:image" content="https://2048-xi-three.vercel.app/og-image.png" />
<meta property="og:image:type" content="image/png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="…" />
<meta name="twitter:card" content="summary_large_image" />
```

- `twitter:image` is not added: X/Twitter reads `og:image` when it is absent, so it would
  only repeat the URL. `twitter:title` / `twitter:description` likewise fall back to `og:*`.
- `og:image:type` is a one-line hint some crawlers like; it is true and costs nothing.
- The URLs are absolute and fixed to the production domain, as the issue asks. A branch
  preview deployment points at the production image, which does not exist there until the
  merge, so the first real check of the card is after the merge (section 6).
- The `minify-html` plugin (`removeAttributeQuotes`, `collapseWhitespace`) must keep every
  tag; checked in `dist/index.html`. **Found while building:** all tags survive, but the
  values without a space are written unquoted (`content=https://2048-xi-three.vercel.app/ >`,
  the plugin adds the space so the trailing `/` is not read as `/>`). Valid HTML; Chrome reads
  every value back exactly (checked on `yarn preview`). `vite.config.js` is not touched; a
  crawler with a naive parser is on the list of things to look at in the first real check.

## 3. Favicon (`src/favicon.svg`)

The same four shapes (dark rounded square, `#555555` board, four 16×16 tiles); only the tile
fills change, from the old 2048 colours (`#eee4da`, `#ede0c8`, `#f2b179`, `#edc22e`) to the
new palette: the logo gold `#edc22e` (`--logo-bg`'s end) and three `tiles.css` colours chosen
to stay clearly different from each other at 16px. The dark square is `--page-bg` and the
board `--surface-border`, both unchanged. Seven candidate sets were rasterised at 16 and 32px
on a light and a dark tab strip; the chosen one, in reading order: the 2 tile `#f1ebdb`, the
logo gold `#edc22e`, the 64 tile `#f0621d`, the 2048 tile `#99007a` (the ramp from cream to
the target; the old set had two near-identical creams that merged at 16px).

## 4. Docs

- `ai/map.md`: root files (`public/`, `.github/social-preview.png`), `vite.config.js` row
  (`public/` exists now), the `<head>` meta tags, a new "Link preview" section (the files, how
  they were made, how to remake them, what to re-check when the palette changes), the favicon
  line in "Theme".
- `ai/rules/assets-performance.md`: `public/` exists; the Open Graph image and its URL rule;
  the PNG weight.
- `README.md`: the author said the Features and Architecture Notes sections are already too
  bloated, so this task only replaces the existing line "Basic metadata and Open Graph
  title/description" with one short line about the link preview image, and does not touch
  Architecture Notes (or the structure tree: `public/` and `.github/social-preview.png` are
  not added there). The details live in `ai/map.md`; the README cleanup is MY-132.
- `ai/decisions/2026-10-12-og-preview-image.md` (+ the index): a committed PNG made by hand,
  no generator and no dependency, instead of a build step or a script; the tradeoff is that
  the image goes stale when the look changes and has to be remade by hand. That is why it has
  no toolbar.

## 5. Verification

- `yarn lint`, `yarn format:check`, `yarn build`, `yarn size` (budget numbers unchanged).
- `dist/` has `og-image.png` at the URL the tag points to; `dist/index.html` keeps every meta
  tag after minification; `yarn preview` (port 5195) serves the page, the image with
  `image/png` and the right byte size, and the favicon.
- Both PNGs looked at; the dimensions read back from the files (IHDR); both diagonals go
  corner to corner (the corner pixels and the pixels next to the other two corners are the
  expected theme colours); the logo and the tagline boxes are entirely in the dark triangle.
- The favicon in a tab strip in a light and a dark colour scheme.

## 6. After the merge and the deploy (for the author)

The live preview can only be checked on production.

1. `https://2048-xi-three.vercel.app/og-image.png` opens and is 1200×630.
2. opengraph.xyz (or a similar checker) shows the card with the image, title and description.
3. Telegram: send the link to Saved Messages; if an old, image-less card is cached, use
   `@WebpageBot` to refresh it.
4. LinkedIn Post Inspector (`linkedin.com/post-inspector`): inspect the URL (this also
   refreshes LinkedIn's cache).
5. Slack / X, if wanted: both read the same tags.
6. GitHub → the repository → Settings → Social preview → upload
   `.github/social-preview.png`; then the repository link in a chat shows it.
