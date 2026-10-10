# Merge locally into `main`, no pull requests

Date: 2026-10-10 · Status: accepted

## Context

The repo has a single author. Pull requests were considered as the merge path (with
required CI checks on `main`), and the author chose to merge locally instead.

## Decision

- Each task is developed on a `my-<n>-<slug>` branch (in its own worktree when tasks
  run in parallel).
- After the author approves, the branch is rebased onto `main`, fast-forward merged
  locally, checked again, and `main` is pushed. No pull requests.
- GitHub Actions CI (when added) runs on pushes to `main` as a post-push signal, not
  as a merge gate. The pre-merge gate is the local checks and the pre-commit hook.
- `main` protection, if enabled, only blocks force pushes and branch deletion —
  required status checks are not enabled, because they would reject direct pushes.

## Consequences

- A red CI run on `main` means `main` is broken — fix it right away with a follow-up
  commit.
- Pull requests only come from bots (Dependabot) and are merged deliberately, never
  blindly.
- History stays linear (rebase + `--ff-only`); `main` is never force-pushed.
