# The link preview image is a hand-made PNG in `public/`, with no generator

Date: 2026-10-12 · Status: accepted · Refined by `2026-10-13-complete-link-preview-tags.md` (the `twitter:*` tags are added after all)

## Context

A link to the demo opened in Telegram, LinkedIn or Slack showed no picture: the page had
`og:title`, `og:description` and `og:type` and nothing else (MY-131). A crawler needs an
absolute image URL that does not change, a size, and, for X, a card type. The repository
also has a Social preview slot (GitHub → Settings), which takes a 1280×640 picture that is
uploaded by hand.

## Decision

- **`public/og-image.png`, 1200×630**, served at `https://2048-xi-three.vercel.app/og-image.png`.
  It lives in `public/` because that folder is copied unhashed to the root of `dist/`; a
  hashed file in `assets/` would change its URL at every build and the crawlers' caches
  would hold a dead link (`2026-10-10-sources-in-src.md` already planned `public/` for
  exactly this; it is created now). The favicon stays next to `index.html`.
- **Meta tags with absolute URLs:** `og:url`, `og:image`, `og:image:type`, `og:image:width`,
  `og:image:height`, `og:image:alt`, `twitter:card` = `summary_large_image`. No
  `twitter:image` (X reads `og:image` when it is missing), no `twitter:title` or
  `twitter:description` (same fallback).
- **A finished PNG is committed, with no generator.** The author chose this over a build
  step or a script (a headless browser or an SVG renderer as a dev dependency, run at
  build time): the image changes rarely, a dependency and a build stage would cost more
  than redoing it by hand a few times in the life of the project, and `ai/rules/scope.md`
  says to leave out tooling that adds more maintenance than value. How it was made is in
  `ai/map.md` ("Link preview"), so it can be made again.
- **The picture:** the gold `2048` logo (top-left), a board with tiles in the tile palette
  in the middle and the author's name, `Serhii Lisovyk`, at the bottom, on a background cut
  corner to corner (bottom-left to top-right) into the dark and the light theme, the
  top-left triangle dark. The board is centred on the image so the line crosses it through
  its middle: half of its panel and empty cells are dark and half light, with empty cells on
  both sides. **No tagline** (the author dropped it in the review: the name is the only
  text) and **no toolbar**: the header buttons come and go and would make the picture
  stale. The colours are the real token values and the font is the real Rubik file.
- **`.github/social-preview.png`, 1280×640**, the same picture for GitHub's Social
  preview. It is in `.github/` so it is not copied to `dist/` and not deployed; the author
  uploads it in the repository settings (GitHub has no file-based setting for it).
- **The favicon was recoloured in the same change** (the cream 2 tile, the logo gold, the 64
  tile, the 2048 tile on the unchanged dark square), so the tab icon, the preview and the
  game share one palette. It stays unthemed (`2026-10-10-theme-tokens-and-head-script.md`).
- **Weight:** both PNGs are about 70 to 77 kB (re-encoded losslessly, RGB). They are outside the
  `size-limit` entries, which match `dist/assets/*.js`, `*.css` and `*.woff2` only, and
  nobody downloads them while playing: only link-preview crawlers request the file.

## Consequences

- The picture does not follow the code. A change to the tile palette, the logo gold, the
  two page colours or the name makes it stale, and nothing will tell: remake both PNGs
  by the recipe in `ai/map.md`. The picture is meant to need that rarely, which is why it
  has no toolbar and shows no state that moves.
- The URLs are fixed to the production domain. A branch preview deployment points at the
  production image, which does not exist there until the first merge, and a change of
  domain means editing `og:url` and `og:image`.
- Crawlers cache the card. After the image changes, Telegram (`@WebpageBot`) and LinkedIn
  (Post Inspector) have to be asked to refresh it; the file name does not change.
- `publicDir: '../public'` was already set in `vite.config.js`; the only change there is
  `removeAttributeQuotes: false` on the `minify-html` plugin. The minifier used to write
  attribute values without quotes (`content=https://2048-xi-three.vercel.app/ >`), which is
  valid HTML and read back correctly by a browser, but the author does not want a crawler
  with a naive parser to be the thing that breaks the card: every meta tag keeps
  `content="https://…"`. The cost in `dist/index.html` is 271 bytes raw (5,373 to 5,644), 24 bytes gzipped.
- Rejected: generating the image at build time (a dependency and a build stage for a file
  that changes a few times a year); the 1280×640 picture as the only image (Open Graph
  asks for 1.91:1, and 1200×630 is the usual size for it); a vertical
  stripe for the theme split (the author asked for the diagonal); a themed favicon.
