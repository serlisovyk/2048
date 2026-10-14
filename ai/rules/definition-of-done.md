# Definition of Done

A change is done when all of the following hold. Use it as the gate before handing a
change over for approval.

## Code

- New code follows `ai/rules/oop.md`: classes with private state in the right layer,
  dependencies through constructors, DOM queries and wiring only in `main.js`.
- Keyboard and pointer input still go through one movement guard, so paused
  and game-over states stay consistent.
- Movement rules stay deterministic except for new tile placement.
- Shared values (board size, thresholds, timings, storage keys, the win tile) come from
  their single source — no duplicated literals (the theme script's key and theme names are
  the one documented exception, `ai/rules/oop.md`). A duration that CSS needs goes from JS
  to CSS as a custom property.
- No inline styles (except CSS custom properties that pass numbers from JS to CSS),
  no inline event handlers in HTML, no game state on `window`.
- Every `localStorage` read and write tolerates failure (blocked or full storage,
  corrupted JSON) — the game still starts.
- New animation respects `prefers-reduced-motion`.
- New controls are real `<button>`s (or native form controls) with an accessible
  name, reachable and usable from the keyboard.
- Layout works from 320px wide to desktop with no horizontal scroll.
- Stale code, styles, and constants left behind by the change are removed.
- Nothing from `ai/rules/scope.md` or `ai/decisions/2026-10-10-rejected-features.md`
  slipped in.

## Docs (in the same change, within `ai/rules/docs.md`)

- `README.md`: one line, only if what a player sees or how to run the game changed.
- `ai/map.md`: only if a file, class, storage key or script was added, renamed or removed.
- `ai/rules/*` or `ai/skills/*`: only if the change reshaped a pattern.
- `ai/decisions/`: a new dated record if the change meets the criteria in its
  `README.md`.
- No doc went over its limit; one that did was trimmed in this change.

## Verification

- `yarn lint`, `yarn format:check`, `yarn build` and `yarn size` all pass (`yarn format`
  applies Prettier).
- A change to code or UI was played in the browser on desktop and at mobile width, not
  just built.
- Reported: what changed, which commands were run, whether they passed, and anything
  that could not be verified. Never claim the project builds or formats correctly
  unless the command was run and passed.
- No automated test suite exists — do not add one unless explicitly asked, and do not
  report its absence as a gap.
