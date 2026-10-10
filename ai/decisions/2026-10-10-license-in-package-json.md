# License declared in `package.json` only, no `LICENSE` file

Date: 2026-10-10 · Status: accepted

## Context

MY-110 added an MIT `LICENSE` file together with `"license": "MIT"` in
`package.json`. The author found the file redundant next to the `package.json`
field.

## Decision

- The project's license is MIT, declared only through `"license": "MIT"` in
  `package.json`.
- There is no `LICENSE` file in the repo.

## Consequences

- GitHub detects licenses from a `LICENSE` file only, so the repo's About box shows
  no license. This is accepted.
- Do not add a `LICENSE` file back unless the author asks; a new dated record is
  needed if that changes.
