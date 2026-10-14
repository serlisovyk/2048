# A swipe is read on the whole page, and `touch-action: pinch-zoom` keeps pinch zoom

Date: 2026-10-14 · Status: accepted

## Context

`SwipeInput` listened on the board only, with `touch-action: none` there and `manipulation` on the page
(`2026-10-10-no-viewport-zoom-lock.md`). A swipe off the board did nothing and scrolled the page, a pinch on the board
did not zoom, a second finger overwrote the stored start and made a false move, and a release elsewhere left a stale
start behind. The author asked for a swipe on the whole page and a guard against a second finger, with the viewport
still unlocked.

## Decision

- **`SwipeInput` listens on `document`.** A press starts a swipe only if it is the primary pointer's left button, is
  not on an `a`, `button` or `input`, and no `dialog[open]` exists; a swipe is not read either when a dialog opened
  before the release.
- **One pointer, matched by id.** `pointerId` is stored at `pointerdown`; `pointerup` and `pointercancel` count only
  for it. A second finger, a pointer that began outside the page or on a button makes no move and disturbs none.
- **`touch-action: pinch-zoom` on `html` and `body`, no rule on the board or the dialogs.** One finger cannot pan, so a
  swipe is not taken over by a scroll (`pointercancel`); pinch zoom works everywhere, the board included; double-tap
  zoom stays off. A dialog is its own scroll container, so the page's value does not reach it and it scrolls with one
  finger. Support (MDN): Chrome and Chrome for Android 56, Firefox 85, Safari and iOS Safari 13, below the build target.
- **`user-select: none` on `html` and `body`, `user-select: text` on `dialog`.** A mouse drag is a swipe too, so it must
  not also select the text under it; the text in the dialogs (the settings note, the game summary) stays selectable.
- **Still no lock**: no `user-scalable=no`, no `maximum-scale`, no `touch-action: none`.

## Consequences

- One finger no longer scrolls the page. Where the layout is taller than a short screen, the lower part (the footer,
  the GitHub link) is reached with a two-finger drag; keeping the board in the window is a layout matter.
- The text of the page (the logo, the score labels, the footer) can no longer be selected or copied; only the dialogs
  keep that.
- Rejected: `touch-action: none` on the page (blocks pinch zoom), `manipulation` on it (a single-finger pan turns every
  swipe into `pointercancel`), a covering surface element of its own.
