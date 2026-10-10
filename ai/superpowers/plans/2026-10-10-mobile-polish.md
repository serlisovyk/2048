# MY-119 — Mobile polish

Issue: MY-119 · Branch: `my-119-mobile-polish` · Spec: `ai/superpowers/specs/2026-10-10-mobile-polish.md`

Blocker MY-109 (the `src/` structure and constants) is Done. No decision record is
contradicted: nothing here is in `ai/decisions/2026-10-10-rejected-features.md`
(PWA and standalone mode stay out). Nothing in the issue is left "to be decided in
the plan".

MY-114 (native `<dialog>` overlays) runs in parallel in another worktree. It owns the
dialog markup in `<body>`, `OverlayView`, `overlays.css`, `GameController` and the
overlay wiring in `main.js`; this change stays out of those so the merge is clean.

## Where it lives

Almost all of it is CSS, plus one line in the composition root
(`ai/rules/oop.md`, `ai/skills/feature.md`):

- `src/scripts/main.js` — the only place that queries the DOM. The `SwipeInput` line
  passes `.game-container` (the game area) instead of `.game-grid`. `gridElement`
  stays: `GridView` still needs the grid.
- `src/scripts/input/SwipeInput.js` — **no change**. It already takes its element
  through the constructor, listens on it, and fires only above `SWIPE_THRESHOLD_PX`.
  Nothing else in it is tied to the grid.
- `src/styles/layout.css` — owns `.game-container` and the body padding: the game
  area's `touch-action` and the safe-area paddings.
- `src/styles/board.css` — loses the `touch-action: none` that moves to the area.
- `src/styles/base.css` — page-wide touch behaviour on `html` / `body`:
  `overscroll-behavior-y: none` and `touch-action: manipulation`. A page-level value
  covers every element — the heading, the scores, every button, and the dialog
  buttons MY-114 reworks — without a per-control rule in `controls.css`.
- `src/index.html` — the viewport `<meta>` in `<head>` only.
- No new class, no new constant: the 30px threshold is already
  `SWIPE_THRESHOLD_PX`, the paddings are existing CSS values.

## Changes

### 1. Swipe on the whole game area

`main.js`:

```js
new SwipeInput(document.querySelector('.game-container'), requestMove).bind()
```

One line instead of a separate `const`, like the other queries in `main.js`, and it
keeps the edit away from the lines MY-114 changes.

`layout.css` — `touch-action: none` on `.game-container`; `board.css` — remove it
from `.game-grid` (the grid sits inside the area, so it is still covered; keeping
both would be stale duplication). `user-select: none` moves with it, so a mouse drag
that starts in the area's padding does not select the page text.

Without `touch-action: none` on the area, a touch that starts in its padding would
be taken by the browser for a scroll and end in `pointercancel`, so the swipe would
not fire. The listener and the `touch-action` move together.

### 2. No pull-to-refresh, no double-tap zoom

`base.css`:

```css
html,
body {
  overscroll-behavior-y: none;
  touch-action: manipulation;
}
```

Both `html` and `body`: the root element's `overscroll-behavior` is the one browsers
apply to the viewport and some also read `body`; for `touch-action` a touch is
governed by the intersection of the values of the element and its ancestors, so a
value on `body` reaches every descendant and one on `html` covers a touch that lands
on the root itself. `touch-action` is not inherited, so its computed value on a
descendant stays `auto`; the effective value cannot be read from JavaScript.

`-y` only: pull-to-refresh and the vertical bounce are what the issue wants gone, and
the horizontal axis is left alone so desktop Chrome / Edge trackpad history swipes
keep working ("desktop as before"). The game area's `touch-action: none` (change 1) is
stricter and wins inside the area.

### 3. Safe areas

`index.html`: `viewport-fit=cover` added to the viewport meta; the rest of the meta
is untouched.

`layout.css`: the three `body { padding: … }` declarations (20px; 10px at
`max-width: 768px`; 10px at `max-height: 600px`) become one custom property and one
padding:

```css
body {
  --page-padding: 20px;
  …
  padding:
    max(var(--page-padding), env(safe-area-inset-top, 0px))
    max(var(--page-padding), env(safe-area-inset-right, 0px))
    max(var(--page-padding), env(safe-area-inset-bottom, 0px))
    max(var(--page-padding), env(safe-area-inset-left, 0px));
}

@media (max-width: 768px) { body { --page-padding: 10px } }
@media (max-height: 600px) { body { --page-padding: 10px } }
```

- `max()` rather than `calc(page padding + inset)`: the notch phone gets exactly the
  clearance it needs, no extra 10–20px of lost width.
- The `0px` fallback keeps the value valid where an inset is not defined; the
  browsers we target (Vite's `baseline-widely-available`) support `env()`.
- The values of the media queries and of the default are the existing ones, so a
  device without insets renders as before.

### 4. Short screens

No code of its own — the risk from the issue is checked, not coded around. The game
area is the old grid plus its 8–12px padding, so the area that cannot start a scroll
barely grows. At a height under 600px the page overflows (e.g. landscape 812x375),
and the player scrolls by touching outside the area: the side margins, the heading,
the score, the `New Game` button. Resizing the board for such screens is a layout
task and is left out (spec, out of scope). A wider swipe area was deliberately not
taken for the same reason: the gain stays the container padding, the price of more
would be scroll on exactly these screens.

## Docs (same change)

- `README.md` — the swipe line in Features (anywhere on the board area; no
  pull-to-refresh or double-tap zoom; respects notches).
- `ai/map.md` — the `index.html` paragraph (viewport meta), the `main.js` and
  `input/SwipeInput.js` rows (game area instead of `.game-grid`), the styles table
  (`base.css`, `layout.css`), and a short "Touch and safe areas" paragraph under it
  that holds the actual values and links the decision record.
- `ai/decisions/` — a new record, `2026-10-10-no-viewport-zoom-lock.md` (and its line
  in the index): double-tap zoom is stopped with `touch-action`, not with
  `user-scalable=no` / `maximum-scale`, so page zoom stays available. A convention
  chosen where an obvious blunt alternative existed; any later layout or gesture work
  has to follow it.
- `ai/rules/*`, `ai/skills/*` — no pattern change: input still goes through
  `requestMove`, only `main.js` queries the DOM.

## Commits

1. `docs: add spec and plan for MY-119 mobile polish` (these two files).
2. `feat: listen for swipes on the whole game area` — `main.js`, `layout.css`,
   `board.css`.
3. `feat: stop pull-to-refresh and double-tap zoom on touch screens` — `base.css`.
4. `feat: keep the page clear of notches and home indicators` — viewport meta and the
   body padding.
5. `docs: record the decision not to lock the viewport zoom` — the decision record
   and its index line (before the map, which links to it).
6. `docs: document the mobile touch handling in README and the repo map`.

## Verification

- `yarn lint`, `yarn format:check`, `yarn build`, `yarn size` (the CSS budget is
  4 kB gzip; the change adds a few lines).
- Play in `yarn dev --port 5186 --strictPort` (5173 is taken on this machine), in the
  Browser pane in an own tab, with the mobile preset (375x812), a landscape size
  (812x375), a 320x480 size, and desktop. Pointer events are dispatched with
  `pointerType: 'touch'`:
  - baseline first (before the code change): a swipe that starts in the area's
    padding makes no move;
  - after: the same swipe, from `document.elementFromPoint` hit on the container
    itself, makes a move, in all four directions; a swipe on the grid still works;
  - a temporary button added from the console inside the area (not committed): a
    short touch sequence fires `click` and moves nothing, a real click works too;
  - computed styles: `overscroll-behavior-x` / `-y` on `html` and `body`,
    `touch-action` on `html`, `body` and the area (the heading, the scores and the
    buttons get theirs through the ancestors), body padding at 375x812, 812x375,
    desktop (the `env()` fallbacks resolve to the old 20px / 10px), the viewport meta;
  - short screens: at 812x375 and 320x480 the page overflows and scrolls, and the
    region outside the game area is large enough to start a scroll from;
  - desktop: arrows and WASD move the tiles, a mouse drag on the grid moves them,
    `New Game` works, layout and paddings are as before (screenshot).
- What desktop tooling cannot show — the real pull-to-refresh, the rubber-band,
  double-tap zoom, and the notch — is reported as checked through computed styles
  only, to be confirmed on a device (iOS Safari, Android Chrome).
- Walk `ai/rules/definition-of-done.md`, then self-review with `ai/skills/review.md`.

## Risks

- `touch-action: none` on the game area takes pinch zoom and scrolling away from
  touches that start there. Mitigated by keeping the area as small as the board plus
  its padding and leaving the rest of the page scrollable and zoomable.
- iOS Safari before 16 has no `overscroll-behavior` and keeps its bounce; the area's
  `touch-action: none` is the part that protects board swipes. Needs a device check.
