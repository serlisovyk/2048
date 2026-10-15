# A missing path answers 404 with the game page through the `vercel.json` routes

Date: 2026-10-15 · Status: accepted · Supersedes `2026-10-15-404-is-the-game-page.md`

## Context

With a `dist/404.html` in the output, the production site still answered `200` with `index.html` for every missing path. The
dashboard showed no source: CDN → Routing Rules empty, Project Routes not configured, Framework Preset "Other". The fallback is
added to the deployment's own routes, after the files, so a `404.html` alone never gets its turn.

## Decision

- **`vercel.json` declares the deployment routes**: `{ "handle": "filesystem" }` serves the real files first, then
  `{ "src": "/(.*)", "status": 404, "dest": "/index.html" }` answers everything else with the game page and status 404.
  Explicit routes replace the ones Vercel would add. The key is deprecated in the schema, but no current key sets a status.
- **No `404.html`**: the route points at `index.html`, so the build emits one page (the second `html-webpack-plugin` output is
  gone) and there is no separate 404 design to keep in step.
- What stays in force: `public/robots.txt` and `public/llms.txt` are served as they are; no ARD catalog, no sitemap, no web app
  manifest.
- Rejected: a routing rule in the dashboard (not versioned, and it cannot tell which files exist, so a list of real paths
  would be kept by hand).

## Consequences

- A new file in `public/` or a new build output is served with no change here: `filesystem` comes first.
- A preview must show `404` in the Status column for a missing path and `200` for `/`; the page looks the same either way.
- The editor flags `routes` as deprecated; keep it until Vercel offers a key that sets a status.
