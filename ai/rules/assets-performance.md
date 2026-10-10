# Assets & Performance Rules

## Assets

- Keep the favicon as source in the project root unless more static assets are
  added later.
- Keep the favicon visually readable at small sizes. Prefer simple tile shapes
  over tiny text.
- Let Vite hash and copy assets into `dist/` during `yarn build`.
- Do not manually edit generated assets in `dist/`.

## Metadata

- Keep the page title, description, theme color, favicon, and Open Graph
  title/description in `index.html`.
- Keep metadata truthful to the visible game and current tech stack.
- Do not add larger SEO infrastructure such as `robots.txt`, `sitemap.xml`, or
  web app manifests unless the user asks for it.

## Performance

- Avoid third-party runtime scripts.
- Keep the game playable without network requests after the initial page load.
- Prefer build-time optimization over runtime JavaScript for static content.
- Compare production output from `yarn build` instead of judging only source
  file sizes.

## Build Output

- Keep HTML, CSS, and JavaScript minified in production.
- Keep CSS autoprefixing tied to `browserslist`.
- Keep legacy chunks enabled for non-modern browsers unless bundle size becomes
  a real problem.
- Keep source maps disabled for the production build unless debugging requires
  them.
