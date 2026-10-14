# The focus ring is a plain `:focus-visible` outline; a transition never uses `all`

Date: 2026-10-14 · Status: accepted

## Context

`2026-10-10-score-live-region-and-focus-ring.md` drew the ring as `outline: 3px none` on every
`button, a` and flipped `outline-style` to `solid` on `:focus-visible`, because the dialog buttons
had `transition: all 0.3s ease`: a width, offset or colour set only on focus would have grown and
faded in. The CSS refactor (MY-139) gave those buttons an explicit transition list, which removes the
reason for the trick.

## Decision

- **One rule**: `button:focus-visible, a:focus-visible` in `base.css` sets
  `outline: var(--focus-ring-width) solid var(--focus-ring-color)` and
  `outline-offset: var(--focus-ring-offset)`. The base `button, a` rule sets no outline.
- **A `transition` names its properties, never `all`**, on any element that can take focus; that is
  what keeps the ring from animating in.
- **Still in force from the earlier record:** one ring for every button and link, an `outline` and not a
  `box-shadow`, no per-button focus styles, `outline: none` only for an element focused from script
  (the board). The dialogs set `--focus-ring-color` to `--dialog-text`, so `--dialog-ring`, which always
  equalled it, is gone. The ring of a segment of the radio control is the same outline with the same
  tokens, drawn on the visible `<span>`.

## Consequences

- Rejected: keeping `outline: … none` on the base rule (a trick that only `transition: all` needed);
  a `box-shadow` ring (hover rules set their own).
- A new button that animates something lists the properties it animates, and gets the ring with no CSS.
