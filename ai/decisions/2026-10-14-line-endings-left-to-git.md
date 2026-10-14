# Line endings are left to git and Prettier — no `.gitattributes`

Date: 2026-10-14 · Status: accepted

## Context

The repo forced LF: `.gitattributes` with `* text=auto eol=lf` and Prettier
`endOfLine: "lf"`, because `core.autocrlf=true` on the author's Windows machine turned
every checkout into CRLF and `prettier --check` then failed.

## Decision

- `.gitattributes` is deleted and Prettier's `endOfLine` is `"auto"`: Prettier keeps
  the line ending each file already has, so a CRLF checkout on Windows and an LF
  checkout on Linux (CI) both pass `yarn format:check`. The index stays LF, because
  git normalises on commit under `core.autocrlf`.
- Do not add a `.gitattributes` or set `endOfLine` back to `"lf"` to fix a line-ending
  warning.

## Consequences

- The working copy follows each machine's git configuration. A fresh checkout on
  Windows has CRLF everywhere, `.husky/pre-commit` included, and the hook still runs
  under Git for Windows.
- A file committed with CRLF into the index would be formatted as CRLF by Prettier and
  stay that way: keep an eye on `git diff` for whole-file changes.
