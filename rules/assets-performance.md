# Assets & Performance Rules

## Assets

- Keep the favicon as source in the project root unless more static assets are
  added later.
- Let Vite hash and copy assets into `dist/` during `yarn build`.
- Do not manually edit generated assets in `dist/`.

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
