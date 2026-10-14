# Task Workflow

End-to-end sequence for taking a Linear task in this repo. `AGENTS.md` states the
non-negotiable rules; this file is the full flow.

## 1. Pick up the task

- Read the Linear issue (`MY-<n>`) in full, including its checklists and its
  "blocked by" relations. Do not start a task whose blockers are not `Done`.
- Check `ai/decisions/` for anything the task would contradict — especially
  `2026-10-10-rejected-features.md`. If it reverses a decision, say so before
  starting.
- If the scope is ambiguous or conflicts with a rule or decision record, ask
  **before** writing anything.

## 2. Branch

- Branch off the latest `main`, named `my-<n>-<slug>` (e.g. `my-113-save-game`) —
  lowercase issue id, short English slug.
- Do not use Linear's `gitBranchName` as-is: it prepends a username and its slug is
  often a transliteration of the Russian title. Write your own short English slug.
- Never commit task work directly on `main`.
- Running several tasks at once: one `git worktree` per branch under
  `.claude/worktrees/` (ignored by git), each with its own `yarn install` — see
  "Parallel work" below.

## 3. Move the task to In Progress

Set the Linear issue state to `In Progress` when work actually starts — not when it
is merely planned.

## 4. Orient

Read in this order, stopping once you have what the task needs:

1. `ai/map.md` — where things live and what the project deliberately lacks.
2. The `ai/rules/*` of the area you touch, and the decision records of the files you
   touch (index in `ai/decisions/README.md`).
3. The matching skill in `ai/skills/` — `feature` for anything game-facing.

Do not explore the code from scratch when the map answers the question.
`ai/superpowers/` is the archive of past tasks: read only the plan or spec of the feature
you change.

## 5. Spec + plan — one commit, before code

- **Plan** — for anything touching more than one or two files, or with more than one
  reasonable approach. Say what will change and how it will be verified; cite decision
  records, do not retell them (`ai/rules/docs.md`).
- **Spec** — when the task changes observable behavior (gameplay, controls, saved
  data, UI flows).
- Write them under `ai/superpowers/plans/` and `ai/superpowers/specs/` as
  `<YYYY-MM-DD>-<slug>.md`, reusing the branch slug so spec, plan, branch, and issue
  pair up.
- Commit spec + plan together as a **single commit**, before any implementation
  commit.
- If the issue says something is to be "decided in the plan" (`решить в плане`),
  stop after the plan commit and hand the plan to the author. Continue only after
  approval, updating the plan with the author's answers.
- A trivial, single-file, single-approach change does not need a plan file — use
  judgment, don't manufacture ceremony.

## 6. Implement

- Follow the plan; commit in logical units, not one giant snapshot. Inspect `git status`
  and `git diff` before each commit.
- Every commit goes through the pre-commit hook (lint-staged: ESLint + Prettier on
  staged files). Never bypass it with `--no-verify`; fix what it reports.
- Conventional Commit messages in English (`feat:`, `fix:`, `refactor:`, `docs:`,
  `chore:`, `style:`, `build:`, `ci:`) — specific, never `update` or `changes`.
- Use the matching skill instead of improvising a pattern that already exists.
- If reality diverges from the plan, update the plan file in the same change.

## 7. Keep docs in the same change

Only what the change made wrong, within the limits of `ai/rules/docs.md`:

- `README.md` — one line, when what a player sees or how to run the game changed.
- `ai/map.md` — when a file, class, storage key, or script was added, removed, renamed,
  or moved.
- `ai/rules/*` or `ai/skills/*` — when the change reshaped a pattern.
- `ai/decisions/` — a new dated record when the change meets the criteria in its
  `README.md`.
- A doc that crosses its size limit is trimmed in this same change.

## 8. Verify

- The four checks in `AGENTS.md` (Verification); `yarn size` needs a fresh `yarn build`.
- Play a code or UI change in `yarn dev`: desktop (keyboard, mouse) and mobile width
  (swipes). Check `prefers-reduced-motion` for anything animated. A green build does not
  prove a UI change works.
- For changes that can affect the build or deployment (Vite config, file moves),
  push the branch so Vercel builds a preview deployment, and check the preview
  before merging. No pull request is needed for that.
- No automated tests exist. Do not add them, and do not report their absence as a
  gap.

## 9. Definition of Done gate

Walk `ai/rules/definition-of-done.md` point by point. Fix what fails before moving
on.

## 10. Self-review

Run the `review` skill over the diff. Fix what you find, or state plainly why a
finding is being left alone.

## 11. Author approval — required stop

Nothing is merged and nothing is marked done without the author's explicit approval.
Hand over the report (step 12) and stop — silence or a neutral reply is not a yes.
Requested changes go back through steps 6–10; fold a small fix into the commit that
introduced it (`--fixup` + autosquash) rather than always adding a new commit.

## 12. Report

In Russian (it is chat, not a file):

- **what was done** — plain language, point by point, readable without opening the
  diff or the plan;
- branch (and worktree path, if any) and the commit list;
- verification output and what was checked manually in the browser;
- self-review findings and what was done about each;
- anything deliberately left out of scope.

## 13. Merge — locally, no pull request

After approval:

```bash
git switch main
git pull --ff-only
git switch my-<n>-<slug>
git rebase main            # re-run the checks if the rebase brought in new commits
git switch main
git merge --ff-only my-<n>-<slug>
yarn lint && yarn format:check && yarn build && yarn size
git push origin main
git branch -d my-<n>-<slug>
```

- After pushing, check that CI on `main` is green (GitHub Actions). A red `main`
  is fixed right away with a follow-up commit.
- History stays linear: rebase onto `main`, then fast-forward. Never force-push
  `main`.
- If the branch was pushed for a preview, delete it on the remote too
  (`git push origin --delete my-<n>-<slug>`).
- Remove the worktree if one was used (`git worktree remove <path>`).
- Move the Linear issue to `Done` and comment with the merged commit SHAs and a
  one-line summary of each.

## Parallel work

- One task per worktree: `git worktree add .claude/worktrees/my-<n>-<slug> -b
my-<n>-<slug> main`, then `yarn install` inside it. In Claude Code, enter it with
  `EnterWorktree` (`path`) so file access does not keep prompting.
- Only run tasks in parallel — at most two at a time — when they touch different areas
  of the code (e.g. game logic vs. styles vs. input). Two tasks editing the same files
  will conflict on merge; two tasks changing the same data format (the saved game, the
  settings) or the same class never run together.
- Before a batch starts, the orchestrator asks the author every foreseeable decision
  and writes the answers into the issues («Решения автора»), so the tasks go from the
  plan straight to the code (`ai/prompts/orchestrator.md`).
- Merge one branch at a time, rebasing the next one onto the updated `main` before
  its merge.
- Repo-wide changes (Vite config, file moves, lint/format setup) run alone, never
  alongside other branches.

## Rules that never bend

Listed in `AGENTS.md` (Workflow).
