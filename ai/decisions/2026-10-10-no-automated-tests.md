# No automated tests

Date: 2026-10-10 · Status: accepted

## Context

Unit tests for the merge logic (e.g. with `node --test`) were proposed during
planning. The author decided against them for this project.

## Decision

- The project has no automated test suite and no test framework.
- Verification is formatting and build checks (later also lint and bundle size) plus
  playing the change in the browser on desktop and at mobile width.

## Consequences

- Do not add tests or a test framework unless the author explicitly asks.
- Do not report the absence of tests as a gap in reviews or reports.
- Manual browser verification is mandatory, not optional — it is the only check that
  exercises gameplay.
