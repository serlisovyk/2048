---
name: feature
description: Use when adding or changing a game-facing feature in the 2048 game — which class in which layer owns state, rendering, input, styles, and storage, and how they connect.
---

# Feature

## When to use

Adding a gameplay feature, a UI control, a dialog, an animation, or anything that
reads or writes persisted data.

## Workflow

1. Read `ai/map.md` first — it lists every class and what it owns. Do not rediscover
   the code from scratch. Follow `ai/rules/oop.md`.
2. Split the feature across the layers before writing code:
   - **Model** (`src/scripts/game/`) — what changes in the game state and the rule
     that changes it: a method on `Game` or `Board`, or a new model class. Pure and
     deterministic (only tile spawning is random); no DOM, storage, or timers.
     Return a result object; do not call views.
   - **Controller** (`GameController`) — the use case: when to call the model, which
     views to update, what to persist, guards and pauses.
   - **Views** (`src/scripts/ui/`) — how it looks: a method on an existing view or a
     new view class that owns its elements. User actions are exposed as
     `on<Action>(handler)`.
   - **Input** (`src/scripts/input/`) — every move goes through
     `GameController.requestMove`, whatever the source.
   - **Storage** (`src/scripts/storage/`) — persisted data goes through
     `SafeStorage`, tolerates failures (blocked storage, corrupted JSON), and carries
     a `version` when its shape can evolve.
   - **Styles** — the CSS file that owns that responsibility (see `ai/map.md`);
     motion overrides in `motion.css`.
3. Wire new objects in `main.js` only — it is the one place that queries the DOM and
   calls `new` for the object graph.
4. Put every new shared value (sizes, thresholds, timings, storage keys, targets) in
   `src/scripts/constants.js`. When CSS needs a number from JS, pass it as a CSS
   custom property set by the view that owns the element.
5. Dialogs: use native `<dialog>` with `showModal()` (focus trap, `Escape`,
   `::backdrop` for free) and return focus to the board on close.
6. Controls: real `<button>`s with an accessible name; icon-only buttons get
   `aria-label` and `title`.
7. Animation: respect `prefers-reduced-motion`; never let an animation swallow or
   reorder player input.
8. Verify per `ai/workflow.md`: format, build, and play the feature on desktop and at
   mobile width.

## Avoid

- Rule logic inside views or the controller; DOM access inside the model.
- Module-level state or loose functions where a class method belongs.
- A second input path that bypasses `requestMove`.
- Base classes, factories, or other abstractions for a single implementation.
- Reading `localStorage` directly instead of through `SafeStorage`.
- Features listed in `ai/decisions/2026-10-10-rejected-features.md`.
