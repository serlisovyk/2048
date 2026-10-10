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
     a `version` when its shape can evolve. Game state is exported and validated by
     the model (`Game.toState` / `Game.restore`); the controller owns the `version`
     envelope and when to save or delete (`ai/decisions/2026-10-10-saved-game-format.md`).
   - **Styles** — the CSS file that owns that responsibility (see `ai/map.md`);
     motion overrides in `motion.css`.
3. Wire new objects in `main.js` only — it is the one place that queries the DOM and
   calls `new` for the object graph.
4. Put every new shared value (sizes, thresholds, timings, storage keys, targets) in
   `src/scripts/constants.js`. When CSS needs a number from JS, pass it as a CSS
   custom property set by the view that owns the element.
5. Dialogs — native `<dialog>` + `showModal()` (the top layer, inert page, `Tab` trap,
   `::backdrop`, and `cancel` on `Escape` come for free;
   `ai/decisions/2026-10-10-native-dialog.md`):
   - **Markup** in `index.html`: `<dialog class="…" aria-labelledby="…">` with a
     heading and real buttons; no `role` / `aria-modal`. The safe or primary button
     comes first and carries `autofocus`.
   - **View**: `OverlayView` owns the `<dialog>` elements `main.js` passes in.
     `show…()` calls `showModal()`, `hide…()` calls `close()`, user actions are
     `on<Action>(handler)`; no `style.display`, no manual focus. Showing a dialog
     closes the other game-end dialog first, so two are never open at once. Give a
     dialog its own view class once it has state of its own (`ConfirmDialogView`, a
     settings form).
   - **`Escape`** is the `cancel` event: cancel it and run the action that fits
     (`Continue Playing`, `Cancel`), or only `preventDefault()` when there is nothing
     to dismiss into. A browser may still close a dialog by force on a repeated
     `Escape`; leave it closed and keep the controller's state valid.
   - **Focus**: the win and game-over dialogs return focus to the board on every
     close: `OverlayView.onClose` (it fires for every close) is wired in `main.js` to
     `GameController.returnFocusToBoard()`. A dialog a button opens and the player can
     dismiss (the confirmation) gives focus back to that button instead — see below.
   - **Confirmation** ("are you sure?" before something hard to undo — a new game, a
     reset, a settings change): do not write another dialog, ask the shared one.
     `ConfirmDialogView.ask({ title, message, confirmLabel, cancelLabel })` returns a
     `Promise<boolean>`, so the use case reads
     `if (!(await this.#confirm(GameController.#NEW_GAME_PROMPT))) return`, where
     `#confirm` wraps `ask()` and the focus rule.
     The wording is a private static frozen prompt next to the use case; the view only
     defaults `cancelLabel` to `Cancel`. `Cancel` has the initial focus, and `Escape`
     or a close forced by the browser answer `false` (nothing is lost). Ask only when
     there is something to lose (`game.isInProgress`), and keep an unconditional path
     (`restart()`) for buttons whose intent is already explicit (the win and game-over
     dialogs). Focus: `ask()` remembers the focused element; after a "no" the
     controller calls `restoreFocus()` (back to that element) and falls back to
     `returnFocusToBoard()` when it returns `false`; after a "yes" the use case acts and
     then calls `returnFocusToBoard()` itself. There is no `onClose` hook for it. One
     question at a time; a confirmation stacked over another dialog is
     for the issue that needs it to decide
     (`ai/decisions/2026-10-10-confirm-dialog.md`).
   - **Controller**: decides when to show which dialog and whether a pause flag is
     needed; the model only reports (`justWon`, `isOver`).
   - **CSS** (`overlays.css`): `display` only on `dialog[open]`; `margin: auto`
     (the reset's `margin: 0` beats the browser's); dimming on `dialog::backdrop`;
     `::backdrop` listed in the reduced-motion selector in `motion.css`, since `*`
     does not match it.
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
- Hand-made overlays, focus traps, or `style.display` toggling for a dialog.
- A second confirmation dialog, or a copy of the confirmation markup, for a new
  "are you sure?" — use `ConfirmDialogView.ask`.
- Base classes, factories, or other abstractions for a single implementation.
- Reading `localStorage` directly instead of through `SafeStorage`.
- Features listed in `ai/decisions/2026-10-10-rejected-features.md`.
