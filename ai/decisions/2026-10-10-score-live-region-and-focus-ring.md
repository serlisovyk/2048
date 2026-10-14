# The score is announced through a hidden, debounced live region; one focus ring for every button

Date: 2026-10-10 · Status: accepted; the focus ring mechanics are superseded by 2026-10-14-plain-focus-ring.md, the bare-number announcement by 2026-10-14-score-announcement-and-board-name.md

## Context

The score changed silently, so a screen-reader user never heard what a move did (MY-116).
Focus was left to the browser defaults, which are thin on the dark page and the purple
and brown dialogs and look different in every browser, and the board — focused from
script after a dialog closes — got the browser's ring around the whole grid after a
keyboard interaction.

The obvious fix is `aria-live="polite"` on the visible score. Two things stand in the way:

- `MOVE_COOLDOWN_MS` is 100 ms, so a held arrow key changes the score up to ten times
  a second. Every change of a live region is queued by the screen reader, so the player
  would hear ten numbers one after another, long after they stopped.
- A live region cannot be delayed independently of its text, and the visible score has
  to change with every move.

## Decision

- **Live region.** The visible `.current-score` is `aria-hidden="true"`. Next to it sits
  a visually hidden `<span>` (`.score-announcement`, `.visually-hidden`) with
  `aria-live="polite"` and `aria-atomic="true"`. `ScoreView` owns it: the visible number
  changes at once, the hidden text changes `SCORE_ANNOUNCEMENT_DELAY_MS` (500 ms, `constants.js`) after the
  last change (trailing debounce, the last value wins). A burst of moves is read once.
  A value equal to the last announced one is skipped, so a slide without a merge and
  `New Game` at a score of 0 are silent; the first render (the starting or restored
  score) is written without a delay, as an initial value and not a change.
  The announcement is the bare number; `Score:` stays in the HTML and is read when the
  header is browsed.
- **No live region on the high score** — a new record would otherwise announce two
  numbers.
- **Why the visible number is `aria-hidden` and outside the live region.** Without
  `aria-hidden`, browse mode reads the value twice. With the hidden number _inside_ a
  live region that also holds the visible one, a change of the hidden visible number
  may announce the old text at once, which defeats the debounce.
- **Focus ring.** One generic `button:focus-visible` rule in `base.css`: a 3px white
  `outline` with a 3px gap, colour `--focus-ring-color`. White has at least 3.6:1 on every
  background it sits on (page, page button, both dialogs); gold fell to 2.6:1 on the
  light end of the win gradient. No per-button focus styles, no `outline: none` on a
  button. Width, gap, and colour live on the base `button` rule and only `outline-style`
  flips, because buttons use `transition: all` and the ring would otherwise grow and
  fade in over 0.3 s.
- **`outline`, not `box-shadow`**: each button's `:hover` rule sets its own `box-shadow`
  with a higher specificity, which would hide a shadow ring on a hovered, focused
  button; an outline follows `border-radius` and survives forced-colors mode.
- **The board** (`tabindex="-1"`, focused from script) gets
  `.game-grid:focus-visible { outline: none }`.

## Consequences

- New buttons (the confirmation dialog, the reset-high-score icon button) get the ring
  with no CSS. A new dialog needs nothing either.
- The ring colour is one custom property, so the theme task sets a dark ring for a
  light page without touching the rule. The dialogs keep their own backgrounds, so
  it has to keep a light ring inside them.
- Another value that must be announced follows the same pattern: a hidden polite live
  region owned by its view, a delay constant, the visible value `aria-hidden`.
- While a modal dialog is open the page behind it is inert, so the score change of the
  move that opened the dialog is not announced; the dialog's title is read instead.
- Not verified without a real screen reader: how NVDA and VoiceOver time and queue the
  announcement, and whether the starting score is really silent on load. The
  accessibility tree, the DOM, and the number of live-text changes in a burst of
  moves were checked.
- Rejected: `aria-live` straight on the visible score (no debounce possible), a
  throttle that speaks during a burst, `assertive`, a live region on the high score,
  a gold or blue ring, a `box-shadow` ring.
- Refined by `2026-10-10-new-record-badge.md`: the one announcement that follows the move
  that beats the high score reads `New record! <score>`; every other announcement is still
  the bare number.
- Refined by `2026-10-10-input-during-tile-animation.md` (MY-126): the 100 ms move cooldown,
  which capped a held key at ten moves a second, is gone, so a held key changes the score up
  to the keyboard's repeat rate (about thirty a second). The debounce is what keeps that to
  one announcement, and it is unchanged.
- Refined by `2026-10-13-footer-and-github-link.md` (MY-135): the ring rule's selector also covers links
  (`button, a`, `button:focus-visible, a:focus-visible`), so the GitHub icon shows the same ring.
