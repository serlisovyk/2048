# Assets & Performance Rules

## Assets

- Keep the favicon next to `index.html` (`src/favicon.svg`) so Vite hashes it. Files
  that need a stable, unhashed URL (e.g. an Open Graph image) go into `public/` in
  the repo root (`publicDir: '../public'`); the folder is created when the first such
  file appears.
- Keep the favicon visually readable at small sizes. Prefer simple tile shapes
  over tiny text.
- Fonts are self-hosted: a Latin-subset woff2 in `src/fonts/`, referenced by a relative
  URL in `@font-face` so Vite hashes it and serves it from the game's own origin. The file
  keeps its copyright notice and license reference in its own metadata (OFL §2 allows that),
  so there is no separate license file; use the file as downloaded and do not strip its
  `name` table. Never a font CDN (Google Fonts or any other
  third-party host). Only the main file gets
  `<link rel="preload" as="font" type="font/woff2" crossorigin>` in `index.html`;
  `crossorigin` is required or the file is fetched twice. Use `font-display: swap`. Why:
  `ai/decisions/2026-10-10-self-hosted-font.md`.
- Let Vite hash and copy assets into `dist/` during `yarn build`.
- Do not manually edit generated assets in `dist/`.

## Metadata

- Keep the page title, description, theme color, favicon, and Open Graph
  title/description in `index.html`. The theme colour is two `theme-color` metas, one per
  `prefers-color-scheme`, and each must equal the `--page-bg` of its theme in
  `src/styles/theme.css` (HTML cannot read CSS, so this is the one duplicated colour);
  `ThemeView` rewrites both with the token value of the theme in force.
- Keep metadata truthful to the visible game and current tech stack.
- Do not add larger SEO infrastructure such as `robots.txt`, `sitemap.xml`, or
  web app manifests unless the user asks for it.

## Performance

- Avoid third-party runtime scripts. The one inline script (the theme, in `<head>`) is ours,
  about 200 bytes minified, and has to stay tiny: it blocks parsing.
- Keep the game playable without network requests after the initial page load.
- Prefer build-time optimization over runtime JavaScript for static content.
- Compare production output from `yarn build` instead of judging only source
  file sizes.

## Build Output

- Keep HTML, CSS, and JavaScript minified in production.
- Keep CSS autoprefixing tied to `browserslist`.
- Build for Vite's default `baseline-widely-available` target. No legacy chunks or
  polyfills — see `ai/decisions/2026-10-10-no-legacy-plugin.md`.
- Keep the gzipped bundle within the `size-limit` budget (`.size-limit.json`); raise
  the budget only on purpose, in the change that needs it. The font has its own `Font`
  entry on the raw woff2 (it is already compressed) and never counts against the JS or
  CSS budgets.
- Keep source maps disabled for the production build unless debugging requires
  them.
