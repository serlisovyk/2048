# The Vercel build is pinned in `vercel.json`

Date: 2026-10-14 · Status: accepted · Supersedes `2026-10-10-vercel-deploy.md`

## Context

The game is a static site hosted on Vercel through its Git integration. Its build settings lived in the Vercel project
settings and there was no `vercel.json`. With the build on Webpack (`2026-10-14-webpack-instead-of-vite.md`), a leftover Vite
framework preset in those settings could pick another build command or output folder.

## Decision

- **The Git integration stays**: `main` is the production deployment at <https://2048-xi-three.vercel.app/>, other pushed
  branches get preview deployments.
- **`vercel.json` pins the build**: no framework preset (`"framework": null`, the "Other" preset),
  `yarn install --frozen-lockfile`, `yarn build`, output directory `dist`. Per the Vercel docs it overrides the project
  settings for every deployment.
- Rejected: relying on the dashboard's settings (not versioned and not visible in a review).

## Consequences

- Every push to `main` ships to production: `main` must always build and play. A change that can affect the build is checked
  on a branch preview deployment before merging.
- A change of the build command or of the output folder is a change of `vercel.json` in the same commit.
