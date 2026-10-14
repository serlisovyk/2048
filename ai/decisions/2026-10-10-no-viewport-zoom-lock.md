# Double-tap zoom is stopped with `touch-action`, not a viewport zoom lock

Date: 2026-10-10 · Status: accepted · partly superseded by `2026-10-14-swipe-on-the-whole-page.md` (the swipe surface and the `touch-action` values)

## Context

MY-119 had to stop the page from zooming on a double tap and keep a swipe on the
board from moving the page. The blunt way is `user-scalable=no` or
`maximum-scale=1` in the viewport meta, which locks pinch zoom for the whole page —
a barrier for low-vision players (WCAG 1.4.4), and iOS Safari ignores it anyway.

## Decision

- `touch-action: none` on the game area (`.game-container`), which is also the
  surface `SwipeInput` listens on.
- `touch-action: manipulation` on `html` and `body`, so on the whole page: panning
  and pinch zoom stay, the double-tap zoom and its click delay go, for buttons, text,
  and any control added later. The game area's `none` is stricter and wins inside it.
- `overscroll-behavior-y: none` on `html` and `body`: no pull-to-refresh and no
  vertical bounce. The horizontal axis is left alone, so a trackpad history swipe on
  desktop Chrome / Edge keeps working.
- The viewport meta carries `viewport-fit=cover` (for safe-area paddings) and **no**
  `user-scalable=no` and **no** `maximum-scale`. The page can still be pinch-zoomed
  everywhere outside the game area.

## Consequences

- A pinch that starts on the board does not zoom the page; everywhere else pinch
  zoom works, and double-tap zoom is off everywhere.
- iOS Safari before 16 does not support `overscroll-behavior` and keeps its bounce.
- A new gesture surface sets its own `touch-action: none` and stays as small as the
  surface needs, so a short screen (landscape phone) keeps somewhere outside it to
  start a scroll from.
- A later "zoom is annoying" complaint is fixed with `touch-action` on the element
  involved, not by locking the viewport.
