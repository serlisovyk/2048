# Task session prompt template

Fill in `{ISSUE}` and send it as the session's first message. The orchestrator
(`ai/prompts/orchestrator.md`) sends the same prompt to each subagent, with the
worktree already chosen.

---

Pick up Linear issue MY-**{ISSUE}** in the 2048 repo.

First, set up the environment:

- Fetch the issue from Linear. Check its "blocked by" relations — if a blocker is not
  `Done`, stop and say so. Read its «Решения автора» section if there is one — those
  answers are final.
- Work on branch `my-{ISSUE}-<slug>` off the latest `main` — lowercase issue id,
  your own short English slug (do not use Linear's `gitBranchName`: it prepends a
  username and transliterates the Russian title).
- If you were given a worktree, work only inside it. If other tasks may run in
  parallel, create one:
  `git worktree add .claude/worktrees/my-{ISSUE}-<slug> -b my-{ISSUE}-<slug> main`,
  enter it (`EnterWorktree` with that `path` in Claude Code), and run `yarn install`
  there.

Then follow `ai/workflow.md` end to end for this issue, from `In Progress` to the
author-approval gate. In particular:

- Orient via `ai/map.md`, the rules of the area you touch, the decision records of the
  files you touch (index in `ai/decisions/README.md`) and the `feature` skill.
- Write spec (if behavior changes) + plan under `ai/superpowers/` and commit them
  together, one commit, before any code, with the author's answers in the plan. If
  something is still to be decided in the plan («решить в плане») and has no answer
  yet, stop after that commit and report the plan with the open questions — do not
  implement until the author approves.
- Update docs in the same change: only what the change made wrong, within the limits of
  `ai/rules/docs.md`.
- Verify (`AGENTS.md`, and actually play the change in `yarn dev` on desktop and at
  mobile width), walk `ai/rules/definition-of-done.md` point by point, self-review with
  the `review` skill.

Constraints:

- Chat with the author in Russian. Spec, plan, code, comments, and commits stay in
  English.
- Touch only what this issue needs.
- No tests — do not add any, do not report their absence as a gap.
- Stop at the author-approval gate (workflow step 11): do not merge, do not push
  `main`, do not mark the issue `Done`.
- Never use `--no-verify`; the pre-commit hook must pass.
- If the scope is ambiguous or conflicts with a rule or decision record, stop and
  ask — don't guess.

Report back at the end, in Russian, as in `ai/workflow.md` step 12: what was done in
plain language, branch and worktree path, the commits, check output and what was played
in the browser, self-review findings, anything deliberately left out of scope.
