# MY-119 — Mobile polish (spec)

Issue: MY-119 · Branch: `my-119-mobile-polish` · Plan: `ai/superpowers/plans/2026-10-10-mobile-polish.md`

On a phone the swipe is only caught on the 4x4 grid itself, so a finger that starts
a little off the board makes no move. The page can also be pulled to refresh or
bounced, a double tap zooms the page, and in landscape the content can slide under
a notch or the home indicator. This spec defines what the player gets.

## Terms

- **Game area** — the board container `<main class="game-container">`: the grid plus
  the padding around it (`--cell-gap`, 8–12px). It is the surface on which a swipe is
  recognised, and the surface on which the browser's own touch gestures are switched
  off.

## Behavior

| Situation                                                            | Result                                                                                                          |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Swipe (>= 30px) that starts on the grid or in the area's padding     | One move in the dominant direction, exactly as a swipe on the grid does today                                   |
| Touch or press shorter than 30px on the area                         | No move; a `click` on a button inside the area is delivered as usual                                            |
| Finger moves on the game area                                        | The page does not scroll, rubber-band, pull to refresh, or zoom from that gesture                               |
| Downward swipe from a place where the page is already at the top     | No pull-to-refresh and no vertical bounce (`overscroll-behavior-y: none` on `html` and `body`)                  |
| Double tap outside the game area (buttons, heading, scores)          | The page does not zoom, and the tap is not delayed waiting for a second one                                     |
| Phone with a notch or a home indicator (landscape in particular)     | Page padding on each side is at least the matching safe-area inset, so the content stays clear of the cutouts   |
| Device without insets, and desktop                                   | Page padding is what it was: 20px, and 10px at `max-width: 768px` or `max-height: 600px`                        |
| Short screen (height < 600px, e.g. landscape) where the page scrolls | The page still scrolls by touching anywhere outside the game area (headings, scores, the side margins, buttons) |

### Safe areas

- The viewport meta gets `viewport-fit=cover`, so the page may extend under the
  cutouts and the safe-area insets become non-zero.
- `body` padding on each side is `max(page padding, env(safe-area-inset-<side>, 0px))`
  where the page padding is the value it has today (20px, 10px in the two existing
  media queries). `max()` rather than a sum, so a notch phone does not waste more
  space than the cutout needs.
- The page background is already the body colour, so the area under a cutout is not
  a white strip.

### Touch actions

- `touch-action: none` on the game area. It replaces the same declaration that sits
  on `.game-grid` today; the grid is inside the area, so it is still covered (the
  effective `touch-action` is the intersection of the element and its ancestors).
  `user-select: none` moves with it from the grid to the area, so a mouse drag that
  starts in the area's padding does not start a text selection.
- `touch-action: manipulation` on `html` and `body`, so on the whole page: panning
  and pinch-zoom stay, the double-tap zoom and its click delay go for the buttons,
  the heading, the scores, and any control added later. `touch-action` is not
  inherited, but a touch is governed by the intersection of the values of the
  element and its ancestors, so a value on `body` (and `html`) reaches every
  descendant. Inside the game area the area's `none` is the stricter value and wins;
  a button placed there still receives `click`.
- `overscroll-behavior-y: none` on `html` and `body`: no pull-to-refresh and no
  vertical bounce. Only the vertical axis, so on desktop Chrome and Edge a
  two-finger horizontal trackpad swipe still navigates the history, as before.
- Pinch zoom is **not** disabled for the page: no `user-scalable=no` and no
  `maximum-scale` in the viewport meta. Zoom stays available everywhere outside the
  game area, for accessibility.

### Swipe on the area

- `SwipeInput` is unchanged: it still takes its element through the constructor and
  still fires only above `SWIPE_THRESHOLD_PX`. `main.js` simply hands it the game
  area instead of `.game-grid`.
- It never calls `preventDefault` and takes no pointer capture beyond what touch
  pointers get implicitly, so a short tap on a button inside the area becomes a
  normal `click`.
- The game area today holds no button (`New Game` and the dialogs sit outside it).
  The guarantee above is for any button that is ever placed there.

## Unchanged

- Keyboard input, `GameController.requestMove` as the single movement guard
  (cooldown, pause after a win, game over), the swipe direction and threshold rules.
- Desktop: layout, keyboard, mouse drag on the grid, and trackpad history swipes
  behave as before. A mouse drag
  that starts in the area's padding now also counts as a swipe, because `SwipeInput`
  treats mouse and touch pointers alike, as it always did.
- The win and game-over overlays and everything that belongs to them (MY-114).
- Layout sizes: the cells, gaps, fonts and breakpoints.

## Acceptance (from the issue)

- A swipe that starts next to the grid, inside the game area, makes a move.
- A downward swipe causes no pull-to-refresh.
- A double tap on a button (or on the heading or the scores) does not zoom the page.
- On a notch iPhone in landscape the content does not go under the notch or the
  home indicator.
- Desktop behaves as before.
- Short screens (< 600px high) keep the scrolling they need.
- `README.md` features and `ai/map.md` (`SwipeInput`, the styles) are up to date.

## Known limits

- Pull-to-refresh, rubber-band, double-tap zoom and the notch cannot be triggered
  from desktop tooling. They are checked through the computed styles and the
  markup; the real behaviour needs iOS Safari and Android Chrome on a device.
- `overscroll-behavior` is supported from iOS Safari 16; before that the page still
  bounces there. On any iOS the game area's `touch-action: none` is what keeps board
  swipes from moving the page.
- The gain in swipe reach is the container's own padding (8–12px per side). A bigger
  swipe area was deliberately not taken: a wider `touch-action: none` surface costs
  the touch scrolling that short screens need, which is the risk the issue names,
  and on a landscape phone the board is already taller than the viewport.
- `SwipeInput` keeps one start point: a second finger that lands on the board
  replaces it, so a pinch can end in a stray move. This is how it worked on the grid
  before; fixing it (`isPrimary` / `pointerId`) is out of scope.
- On landscape phones the board (about 484px) is taller than the viewport, so the
  page scrolls and a scroll has to start outside the game area. That layout is
  unchanged; making it fit is a separate layout task.

## Out of scope

- Win and game-over dialogs (MY-114).
- Resizing the board or the page for very short screens, a bigger touch zone around
  the board, handling a second finger inside `SwipeInput`.
- A viewport zoom lock (`user-scalable=no`, `maximum-scale`); a web app manifest and
  standalone-mode work (PWA is rejected: `ai/decisions/2026-10-10-rejected-features.md`).
