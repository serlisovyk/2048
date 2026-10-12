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

Then follow `ai/workflow.md` end to end for this issue:

- Read `AGENTS.md`, orient via `ai/map.md`, the relevant `ai/rules/*`, the decision
  records in `ai/decisions/`, and the `feature` skill.
- Move the issue to `In Progress`.
- Write spec (if behavior changes) + plan under `ai/superpowers/` and commit them
  together, one commit, before any code, with the author's answers in the plan. If
  something is still to be decided in the plan («решить в плане») and has no answer
  yet, stop after that commit and report the plan with the open questions — do not
  implement until the author approves.
- Implement in logical commits (Conventional Commits, English).
- Update docs in the same change (`README.md`, `ai/map.md`, `ai/rules/*`,
  `ai/skills/*`, `ai/decisions/` — whichever applies).
- Verify: `yarn lint`, `yarn format:check`, `yarn build`, `yarn size`, and actually play the change in
  `yarn dev` on desktop and at mobile width.
- Walk `ai/rules/definition-of-done.md` point by point.
- Self-review with the `review` skill.

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

Report back at the end, in Russian:

- **what was done** — a short plain-language bullet list, readable without opening
  the diff;
- branch and worktree path;
- commit list, what each one does;
- check output, and what was played in the browser;
- self-review findings and what was done about each;
- anything deliberately left out of scope.
