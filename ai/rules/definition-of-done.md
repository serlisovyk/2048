# Definition of Done

A change is done when all of the following hold. Use it as the gate before handing a
change over for approval.

## Code

- New code follows `ai/rules/oop.md`: classes with private state in the right layer,
  dependencies through constructors, DOM queries and wiring only in `main.js`.
- Keyboard and pointer input still go through one movement guard, so paused
  and game-over states stay consistent.
- Movement rules stay deterministic except for new tile placement.
- Shared values (board size, thresholds, timings, storage keys, the win tile) come
  from their single source — no duplicated literals, and JS timings match the CSS
  durations they mirror.
- No inline styles (except CSS custom properties that pass numbers from JS to CSS),
  no inline event handlers in HTML, no game state on `window`.
- Every `localStorage` read and write tolerates failure (blocked or full storage,
  corrupted JSON) — the game still starts.
- New animation respects `prefers-reduced-motion`.
- New controls are real `<button>`s (or native form controls) with an accessible
  name, reachable and usable from the keyboard.
- Layout works from 320px wide to desktop with no horizontal scroll.
- Stale code, styles, and constants left behind by the change are removed.

## Docs (in the same change)

- `README.md` updated if features, controls, scripts, or structure changed.
- `ai/map.md` updated if a file, module, storage key, or script changed.
- `ai/rules/*` or `ai/skills/*` updated if the change reshaped a pattern.
- `ai/decisions/` has a new dated record if the change settled or reversed a durable
  decision.

## Verification

- `yarn lint` is clean.
- `yarn format:check` is clean.
- `yarn build` is clean.
- `yarn size` is within budget.
- The change was played in the browser on desktop and at mobile width, not just
  built.
- No automated test suite exists — do not add one unless explicitly asked, and do not
  report its absence as a gap.

## Commits

- Commit in logical units, not one giant final snapshot.
- Inspect `git status` and `git diff` before committing.
- Use specific Conventional Commit messages in English.
- Every commit passed the pre-commit hook — no `--no-verify`.

## Out of scope unless explicitly requested

- Anything listed in `ai/rules/scope.md` or
  `ai/decisions/2026-10-10-rejected-features.md`.
