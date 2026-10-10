# No Dependabot — dependencies are updated by hand

Date: 2026-10-10 · Status: accepted

## Context

MY-112 planned weekly Dependabot pull requests for npm and GitHub Actions. For a
single-author project with a handful of dev dependencies, the author found that
overkill.

## Decision

- No `.github/dependabot.yml`. Dependencies (npm and GitHub Actions) are updated by
  hand, deliberately, when needed.
- CI triggers on `push` only; there is no `pull_request` trigger, since nothing opens
  pull requests. This supersedes the note about bot pull requests in
  `2026-10-10-local-merge-without-pr.md`.

## Consequences

- When updating a dependency, check its `engines.node` against ours — yarn 1 refuses
  to install outside it. Known limits today: `size-limit` 13+ and `lint-staged` 17+
  need a narrower Node range.
- Do not add Dependabot or Renovate unless the author asks; a new dated record is
  needed if that changes.
