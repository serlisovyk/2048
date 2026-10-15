# A missing path answers 404 with the game page; crawler files are served; no ARD catalog

Date: 2026-10-15 · Status: superseded by `2026-10-15-404-through-vercel-routes.md` · Supersedes `2026-10-15-crawler-files-no-catch-all.md`

## Context

Lighthouse 13.5 (SEO and Agentic browsing) failed three audits. The live site answered `200 text/html` with `index.html` to
every path, so a crawler read the game's markup as `robots.txt`, as `llms.txt` and as the agent catalog at
`/.well-known/ai-catalog.json`. The repo defines no fallback (`vercel.json` has no rewrites), the dashboard's CDN → Routing
Rules are empty and the Framework Preset is "Other", so where the catch-all comes from is unknown. Per the Vercel docs a
`404.html` in the output directory is served, with status 404, for a path that matches no file. The game has no client-side
routes, so nothing needs the fallback.

## Decision

- **`dist/404.html` is the game page**: a second `html-webpack-plugin` output on the same template and options, so it is the
  page at `/` byte for byte (the theme script first in `<head>`) and a missing path answers 404 with the working game. Its
  asset URLs are absolute, so it plays at any depth, and the bundle is emitted once. No separate 404 design to keep.
- **`vercel.json` stays the build only**: no `routes` (`handle` is deprecated), no `rewrites`, and no routing rule in the
  dashboard (not versioned).
- **`public/robots.txt`**: `User-agent: *` and `Allow: /`; no `Sitemap`, no `Agentmap`. **`public/llms.txt`** per
  llmstxt.org. Both are copied unhashed to the root of `dist/`; a static file wins over any fallback.
- **No ARD catalog** (`ai-catalog.json`, `ard.json`): the game exposes no agent resources. With a 404 at the well-known path,
  no `Agentmap` line and no `ai-catalog` link tag or header, the Lighthouse audit is "not applicable".
- Rejected: a hand-made 404 page (a look to keep in step with the game), a `routes` table, dashboard rules, a sitemap, a web
  app manifest (`2026-10-10-rejected-features.md`), an SPA fallback.

## Consequences

- `/404.html` itself answers 200 with the game and is linked from nowhere.
- A preview must show that a missing path answers 404. If it still answers 200, the fallback (not built) is in `vercel.json`:
  `"routes": [{ "handle": "filesystem" }, { "src": "/(.*)", "status": 404, "dest": "/index.html" }]`, with the deprecated key.
- If a crawler file is HTML again, look first at the dashboard's routing rules (CDN, Routing Rules): the repo cannot show them.
- The links in `llms.txt` are absolute: a new domain or repository means editing the file. Adding any of the three ARD
  signals makes Lighthouse fetch and validate a catalog.
