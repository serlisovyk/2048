# Deployed on Vercel through its Git integration

Date: 2026-10-10 · Status: superseded by `2026-10-14-vercel-config-in-repo.md`

## Context

The game is a static site: `yarn build` produces `dist/` with no server code. It
needs a public demo link for the portfolio and the GitHub About section.

## Decision

- Host on Vercel through its Git integration: `main` is the production deployment at
  <https://2048-xi-three.vercel.app/>, other pushed branches get preview deployments.
- Build command `yarn build`, output directory `dist/`. Build settings live in the
  Vercel project settings; there is no `vercel.json` yet.

## Consequences

- Every push to `main` ships to production — `main` must always build and play.
- Changes that can affect the build (Vite `root`, `outDir`, file moves) are checked on
  a branch preview deployment before merging.
- If the build output location changes, update the Vercel project settings in the
  same change and record it here with a new dated record.
