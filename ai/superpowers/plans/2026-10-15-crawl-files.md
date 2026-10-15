# MY-143 — A real 404, `robots.txt` and `llms.txt`

Issue: MY-143 · Branch: `my-143-crawl-files` · No spec: the game, its markup and its behaviour do not change.

Base is `main` at `53defc6`. Lighthouse 13.5 reads the game's HTML as `robots.txt` (SEO), as `llms.txt` (Agentic
browsing) and as the ARD catalog at `/.well-known/ai-catalog.json`, because the live site answers `200 text/html` with
`index.html` to **every** path, `/definitely-not-here` and `/assets/nope-123.js` included.

## Author's decisions (2026-10-15, final)

- A real 404 for a missing path, `public/robots.txt`, `public/llms.txt`.
- No ARD catalog (`ai-catalog.json` / `ard.json`), no sitemap, no `Agentmap` line in `robots.txt`.

## Where the catch-all comes from

Not from the repo. `vercel.json` has no `rewrites`, `routes` or `cleanUrls` and the build emits only `index.html`,
`assets/` and `og-image.png`: no `_redirects`, no routing file, no `404.html`. The Vercel docs agree: the Vite and
"Other" presets define no fallback, so a missing path is a 404 (Vercel's own Vite example answers `404 NOT_FOUND`); a
single page app needs an explicit `/(.*)` → `/index.html` rewrite ([Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite)).
What is left is the Vercel project: a project-level Routing Rule (dashboard, **CDN → Routing Rules**, run before the
deployment's own routes, [docs](https://vercel.com/docs/routing/project-routing-rules)) or a leftover SPA Framework
Preset that `"framework": null` should already override. Both live in the dashboard, so no repo-side change is
documented to work: a `404.html` is only reached when nothing rewrites the path first, so it is not added. The task stops
at the files and the author removes the rule (report).

## Changes

1. `public/robots.txt`: `User-agent: *` and `Allow: /`.
2. `public/llms.txt` per llmstxt.org: an H1, a one-line blockquote, short sections of Markdown links (demo, README,
   `AGENTS.md`, the repository). Truthful, well over the 50 characters and the one link Lighthouse asks for.
3. Both are copied to the root of `dist/` by the existing `public/` copy: no config change. `.size-limit.json` globs
   `dist/assets/` only, and Prettier skips `.txt`.
4. Docs: `ai/rules/assets-performance.md` (the two files exist; still no sitemap, manifest or ARD catalog), one new
   record (served files, no catch-all, no ARD catalog), one line per file in `ai/map.md`, the `public/` line of the README tree.

## Decision records checked

`2026-10-10-vercel-deploy.md` (superseded) and `2026-10-14-vercel-config-in-repo.md`: `vercel.json` pins the build and is
left as it is. `2026-10-14-webpack-instead-of-vite.md`: `public/` is copied unhashed to `dist/`, which is all that is
needed. `2026-10-10-rejected-features.md`, `ai/rules/scope.md`: nothing from the lists; no client-side routing.

## Verification

`yarn lint`, `yarn format:check`, `yarn build`, `yarn size`, `yarn install --frozen-lockfile`. `yarn preview --port 5191`:
`/robots.txt` and `/llms.txt` answer 200 `text/plain`, a missing path and `/.well-known/ai-catalog.json` answer 404, the
game plays with a clean console. Lighthouse 13.5 (SEO and Agentic browsing) from a temporary folder outside the repo, on
that preview. After the deploy: the URLs and types in the report.
