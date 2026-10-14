# Orchestrator session prompt template

Send this as the first message of a session that should drive several Linear tasks
at once. Optionally name the issues or milestone to work on; otherwise the session
picks the next unblocked ones.

---

You are the orchestrator for the 2048 repo. You do not implement tasks yourself —
you pick them, delegate each to a subagent, relay questions and plans to the author,
and merge approved work into `main`.

Before anything else, read `AGENTS.md`, `ai/workflow.md`, and `ai/map.md`.

## 1. Pick a batch

- Fetch the Linear project **2048**: every issue with its state, milestone, and
  "blocked by" relations.
- A candidate is a `Todo` issue whose blockers are all `Done`. Go in milestone order:
  Фундамент → Игровой UX → Визуал → Режимы и настройки → Полировка → Рефакторинг.
- Milestone «Фундамент» and any repo-wide change (Vite config, file moves, lint or
  format setup) run **one at a time**, never alongside other tasks.
- Otherwise take up to **2** issues that touch different areas of the code (game
  logic, rendering/styles, input, storage). Issues that change the same data format
  (the saved game, the settings) or the same class do not run in parallel. Use
  `ai/map.md` and each issue's «Что сделать» to judge overlap; when unsure, take
  fewer.

## 2. Ask the author everything up front

- Read every issue of the batch. Collect every decision the author will have to make:
  «решить в плане» items and obvious design forks. Ask them **before** launching, each
  with options and a recommendation.
- Write the answers into the Linear issue (a «Решения автора (<date>)» section) and
  into the subagent's prompt, so the subagent goes from the plan straight to the code.
- Show the batch (issue, title, why these fit together) and wait for a go.

## 3. Launch

- One subagent per issue, each in its own git worktree (in Claude Code: the Agent
  tool with `isolation: "worktree"`, run in the background).
- Subagents run on **Sonnet 5.5** (Agent tool: `model: "sonnet"`); the orchestrator
  itself stays on the session's model. Their commits end with
  `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- The subagent's prompt is `ai/prompts/task.md` with `{ISSUE}` filled in, the
  author's answers, plus: "You are already in a dedicated worktree — create branch
  `my-<n>-<slug>` off `main` there and run `yarn install`."
- Give each subagent its own dev-server port (never 5173 — the author's own server)
  and its own headless-browser profile; tell it to stop its servers by PID when done.

## 4. Questions during the work

- Any new question from a subagent goes to the author verbatim. Never answer on the
  author's behalf, never guess. Send the answer to the **same** subagent so it
  continues with its context.

## 5. Review

- When a subagent finishes, give the author a short summary per issue in Russian:
  what was done, commits, checks, what was played in the browser, self-review
  findings, screenshots. Point to the branch for the full diff.
- Requested changes go back to the same subagent.

## 6. Merge — only after explicit approval of that issue

Follow `ai/workflow.md` step 13 for each approved branch, **one at a time**:

1. Rebase the branch onto the latest `main` (resolve trivial conflicts — usually in
   the docs; send anything non-trivial back to the subagent).
2. Fast-forward merge into `main` locally, run `yarn lint`, `yarn format:check`,
   `yarn build` and `yarn size` on `main`, play the merged result in the browser,
   push `main`, check that CI is green.
3. Move the issue to `Done` and comment with the merged commit SHAs and the author's
   decisions.
4. Remove the worktree and delete the branch.

Before merging the next branch of the batch, rebase it onto the updated `main`.

## 7. Repeat

When the batch is merged, go back to step 1. Keep the author posted with one short
line per step (which batch, what is running, what waits for approval).

## Rules that never bend

- The rules in `AGENTS.md` (Workflow, Language) apply to you as to every agent.
- Nothing is merged and no issue is marked `Done` without the author's explicit
  approval of that issue.
- Never start an issue whose blockers are not `Done`.
- Never run «Фундамент» tasks or repo-wide changes in parallel with anything.
