# The GitHub link is last in the DOM and first on screen (`order: -1`)

Date: 2026-10-14 · Status: accepted

## Context

`2026-10-13-footer-and-github-link.md` put the link first in the DOM so the reading order, the `Tab` order and the
picture agreed, and rejected "last in the DOM with CSS `order`" because the focus would jump against the picture. The UX
audit of 2026-10-13 found the cost: the first `Tab` stop of the page was a link that leaves the game, ahead of the
game's own controls, and every keyboard user paid it on every visit. The author asked for the link not to be the
first stop while it stays where it is on screen.

## Decision

- **`.github-link` is the last child of `body`**, after `.game-layout`, and `order: -1` keeps it as the top row of the
  page (it is a flex item of `body`, so `align-self: flex-end` and its margin are unchanged).
- **`Tab` order**: New game, theme, settings, the high score reset when it is shown, then the link. A screen reader meets
  the link after `contentinfo`, as a footer link.
- **Accepted: the focus order and the picture differ for this one link** (the link is first on screen and last by
  keyboard). It is the author's trade-off: one extra `Tab` stop at the end of the page costs less than a link in front of
  the game. Everything else keeps the order of the DOM.
- Rejected: the link inside `.game-layout` after the header (it breaks the single column the header and the footer rely
  on for their width), a positive `tabindex` (never), and a fourth toolbar button (excluded by the author,
  `2026-10-13-footer-and-github-link.md`).

## Consequences

- Still in force from `2026-10-13-footer-and-github-link.md`: the link is a row of its own, a 44px target holding the 24px
  mark, quiet colour, the shared focus ring, outside every dialog, so inert while one is open.
- A new link out of the page follows the same pattern (a flex item of `body`, last in the DOM, `order`).
- Refines `2026-10-13-footer-and-github-link.md` (its "first in the DOM").
