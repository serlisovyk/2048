# robots.txt and llms.txt are served, a missing path is a 404, no ARD catalog

Date: 2026-10-15 · Status: superseded by `2026-10-15-404-is-the-game-page.md`

## Context

Lighthouse 13.5 (SEO and Agentic browsing) failed three audits. The live site answered `200 text/html` with `index.html` to
every path, so a crawler read the game's markup as `robots.txt`, as `llms.txt` and as the agent catalog at
`/.well-known/ai-catalog.json`. The game is a single page with no client-side routes, so nothing needs such a fallback, and
the repo defines none (`vercel.json` has no rewrites, the build emits no routing file).

## Decision

- **`public/robots.txt`**: `User-agent: *` and `Allow: /`. No `Sitemap` (one page) and no `Agentmap` line.
- **`public/llms.txt`** per llmstxt.org: an H1, a one-line blockquote and Markdown links to the demo, the README,
  `AGENTS.md` and the repository. Both files are copied unhashed to the root of `dist/` and a static file wins over a rewrite.
- **A missing path answers 404.** No catch-all in `vercel.json` and none in the Vercel project's routing rules (dashboard,
  not versioned). No custom 404 page: the default one has the right status and a stray URL has nothing to offer.
- **No ARD catalog** (`ai-catalog.json`, `ard.json`): the game exposes no agent resources, and the standard is moving to
  `ard.json`. With a 404 at the well-known path, no `Agentmap` line and no `ai-catalog` link tag or header, the Lighthouse
  audit is "not applicable".
- Rejected: a sitemap (one URL), a web app manifest (the PWA is rejected, `2026-10-10-rejected-features.md`), an SPA fallback.

## Consequences

- The links in `llms.txt` are absolute, on the production domain and the GitHub repository: a new domain or repository means
  editing the file, and so does a change to what the game does.
- If a crawler file is HTML again, look first at the routing rules in the Vercel dashboard (CDN, Routing Rules): the repo
  cannot show them.
- Adding any of the three ARD signals makes Lighthouse fetch and validate a catalog.
