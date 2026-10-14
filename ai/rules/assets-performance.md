# Assets & Performance Rules

## Assets

- Keep the favicon next to `index.html` (`src/favicon.svg`) so Vite hashes it. Files
  that need a stable, unhashed URL go into `public/` in the repo root
  (`publicDir: '../public'`, copied as they are to the root of `dist/`): today only the Open
  Graph image, `public/og-image.png` (1200×630). The 1280×640 GitHub social preview is not
  kept in the repo: it is uploaded by hand in the repository settings.
- Keep the favicon visually readable at small sizes. Prefer simple tile shapes
  over tiny text. Its tile colours are taken from the palette (the logo gold and
  `tiles.css` values); when the palette changes, change them too.
- The preview PNGs are finished files, not generated: no generator script and no image
  dependency (`ai/decisions/2026-10-12-og-preview-image.md`). Keep each well under 200 kB,
  keep them out of `dist/assets/` and out of every `size-limit` entry, and remake them with
  `ai/skills/og-image.md` when the palette, the logo or a page colour changes.
- Fonts are self-hosted: a Latin-subset woff2 in `src/fonts/`, referenced by a relative
  URL in `@font-face` so Vite hashes it and serves it from the game's own origin. Never a
  font CDN (Google Fonts or any other third-party host). The file keeps its copyright notice
  and license reference in its own metadata, so there is no separate license file: use the
  file as downloaded and do not strip its `name` table. Only the main file gets
  `<link rel="preload" as="font" type="font/woff2" crossorigin>` in `index.html`
  (`crossorigin` is required or the file is fetched twice). Use `font-display: swap`.
  Why: `ai/decisions/2026-10-10-self-hosted-font.md`.
- Let Vite hash and copy assets into `dist/` during `yarn build`. Do not manually edit
  generated assets in `dist/`.

## Metadata

- Keep the page title, description, theme color, favicon, and Open Graph
  title/description in `index.html`. The theme colour is two `theme-color` metas, one per
  `prefers-color-scheme`, and each must equal the `--page-bg` of its theme in
  `src/styles/theme.css` (HTML cannot read CSS, so this is the one duplicated colour);
  `ThemeView` rewrites both with the token value of the theme in force.
- The link preview is `og:site_name`, `og:url`, `og:image` (with `:type`, `:width`, `:height`,
  `:alt`), `twitter:card` and `twitter:title` / `twitter:description` / `twitter:image` in
  `index.html`. Their URLs are absolute, on the production domain
  (`https://2048-xi-three.vercel.app/`): a crawler does not resolve a relative one, and a new
  domain means editing them. The size and the alt text must match the file. Each `twitter:*`
  tag repeats its `og:*` twin: change them together. The build keeps the attribute quotes
  (`removeAttributeQuotes: false`), so every tag reads `content="https://…"` in `dist/index.html`.
- Keep metadata truthful to the visible game and current tech stack.
- Do not add larger SEO infrastructure such as `robots.txt`, `sitemap.xml`, or
  web app manifests unless the user asks for it.

## Performance

- Avoid third-party runtime scripts. The one inline script (the theme, in `<head>`) is ours
  and has to stay tiny: it blocks parsing.
- Keep the game playable without network requests after the initial page load.
- Prefer build-time optimization over runtime JavaScript for static content.
- Compare production output from `yarn build` instead of judging only source
  file sizes.

## Build Output

- Keep HTML, CSS, and JavaScript minified in production.
- CSS is prefixed by Autoprefixer through `postcss.config.js`. The project has no
  `browserslist` config and none is added: Autoprefixer uses its defaults.
- Build for Vite's default `baseline-widely-available` target. No legacy chunks or
  polyfills — see `ai/decisions/2026-10-10-no-legacy-plugin.md`.
- Keep the gzipped bundle within the `size-limit` budget (`.size-limit.json`); raise
  the budget only on purpose, in the change that needs it. The font has its own `Font`
  entry on the raw woff2 (it is already compressed) and never counts against the JS or
  CSS budgets.
- Keep source maps disabled for the production build unless debugging requires
  them.
