# MY-116 — Score live region and one focus ring

Issue: MY-116 · Branch: `my-116-a11y-score-focus` · Spec: `ai/superpowers/specs/2026-10-10-a11y-score-focus.md`

Blocker MY-109 (the `src/` structure and the views) is `Done`. No decision record is
contradicted:

- `2026-10-10-native-dialog.md` — the dialog buttons are plain `<button>`s inside native
  `<dialog>`s; the ring is a generic `button` rule, so no dialog-specific CSS is added,
  and the focus handling (`autofocus`, `returnFocusToBoard`) is untouched.
- `2026-10-10-rejected-features.md` — a high-contrast mode is rejected; this is a
  focus ring and a live region, not a `prefers-contrast` theme.

There is nothing left to decide for the author; the choices below were made and are
recorded in `ai/decisions/2026-10-10-score-live-region-and-focus-ring.md`.

## 1. Choices

### Live region: a separate visually hidden element, not the visible score

The issue asks for `aria-live="polite"` on the current score and, if needed, a short
delay. A live region cannot be delayed independently of its text, and the visible score
must change on every move. So the visible number stays as it is, and the live region is
a second, visually hidden `<span>` whose text `ScoreView` updates after a pause.

- Why a delay is needed: `MOVE_COOLDOWN_MS` is 100 ms, so a held arrow key moves up
  to ten times a second. Ten polite announcements queue up and are read one after
  another long after the player has stopped.
- Why the visible number gets `aria-hidden="true"`: otherwise the header reads
  `Score: 128 128` in browse mode (the visible number, then the hidden one). Putting
  the `aria-hidden` number _inside_ the live region instead is not an option: a change
  in it may still trigger an announcement of the old text at once, which defeats the
  delay.
- Why `aria-atomic="true"`: the whole value is read, never a diff of the text nodes.
- Debounce, not throttle: trailing, one timer, the last value wins. A score that
  changes without a pause for a long time is announced once the moves stop. A throttle
  would speak during the burst, which is what must not happen.
- The announced text is the bare number. The label `Score:` stays in the HTML next to
  it and is read when browsing. No string to translate lives in JS.
- 500 ms: long enough to swallow a held key (100 ms apart) and a quick player's moves
  (250–400 ms apart); short enough that a move followed by a pause is announced while
  the player is still thinking about it.

### Focus ring: `outline` on a generic `button:focus-visible` rule

- `outline`, not `box-shadow`: every button's `:hover` rule already sets a
  `box-shadow` with a higher specificity (`.new-game-button:hover` beats
  `button:focus-visible`), so a shadow ring would vanish while a focused button is
  hovered. `outline` is not set anywhere else, follows `border-radius`, and survives
  forced-colors (Windows high-contrast) mode, where shadows are dropped.
- White `#ffffff`, 3px, `outline-offset: 3px`. The offset keeps the ring apart from the
  white dialog buttons and from the white border of `.win-restart-button`; the gap shows the dialog
  background, which is what the ring contrasts with (at least 3.6:1 everywhere).
  Gold (`#ffd700`) was rejected: 2.6:1 on the light end of the win gradient.
- The colour is `--focus-ring-color` on `:root`, so the theme task can set a dark ring
  for a light page without touching the rule.
- One rule for all buttons, no per-button focus styles, no `outline: none` on buttons.
- The board gets `.game-grid:focus-visible { outline: none }`. It is only ever focused
  from script, and its `aria-label` and the arrow keys are what the user relies on, so
  a ring around the whole grid would be noise.
- Reduced motion does not apply: the ring is not an animation. But the buttons use
  `transition: all`, and checked in the browser the ring did animate in: the gap grew
  from 0 to 3px and the colour faded from the button's text colour to white over
  0.3 s. Fix, kept in `base.css` so that every future button is covered: the ring's
  width, gap, and colour are set on the base `button` rule with `outline-style: none`,
  and `button:focus-visible` only flips `outline-style` to `solid` (a style change is
  not interpolated, so nothing transitions). `controls.css` stays untouched.

## 2. Where each part lives (`ai/rules/oop.md`)

| Layer / file                   | Change                                                                                                                                                                                                                                                   |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/index.html`               | Only the `Score:` div: `aria-hidden="true"` on the visible number, and a hidden `<span class="score-announcement visually-hidden" aria-live="polite" aria-atomic="true">` after it. The high-score line and everything else stay as they are.            |
| `src/scripts/constants.js`     | `SCORE_ANNOUNCEMENT_DELAY_MS = 500`.                                                                                                                                                                                                                     |
| `ui/ScoreView.js`              | Takes `announcementElement`. `renderScore` updates the visible number at once and schedules the announcement (one timer, the last value wins, same value is skipped, the first render fills the text without a delay).                                   |
| `src/scripts/main.js`          | Passes `announcementElement: document.querySelector('.score-announcement')`. DOM lookup stays here.                                                                                                                                                      |
| `GameController.js`            | No change: it already calls `renderScore` after every move and on a new game.                                                                                                                                                                            |
| `src/styles/base.css`          | `:root { --focus-ring-color }`, the ring's width, gap, and colour on `button` (style `none`), `button:focus-visible { outline-style: solid }`, `.visually-hidden` (the standard clip pattern; a utility for text that is for assistive technology only). |
| `src/styles/board.css`         | `.game-grid:focus-visible { outline: none }` next to the grid rule.                                                                                                                                                                                      |
| `controls.css`, `overlays.css` | No change: the hover `transform` only translates by 2px and does not hide or distort the ring; `transition: all` is handled in `base.css` (section 1).                                                                                                   |

MY-115 and MY-117 are built in parallel and add buttons and markup next to the score
header. To keep the merges clean, the `index.html` edit stays inside the `Score:` div,
and the CSS goes into `base.css` and `board.css`, not `controls.css`.

## 3. Commits

1. `docs:` spec + plan (this commit, before any code).
2. `feat:` the score live region: `index.html`, `constants.js`, `ScoreView.js`,
   `main.js`, `.visually-hidden`.
3. `feat:` the unified focus ring: `button:focus-visible`, no ring on the board.
4. `docs:` `ai/rules/style.md`, `ai/skills/feature.md`, `ai/skills/review.md`,
   `ai/map.md`, `README.md`, the decision record and its index entry.

## 4. Verification

`yarn lint`, `yarn format:check`, `yarn build`, `yarn size` (the CSS budget is 4 kB gzip,
the JS budget 8 kB), then play it in `yarn dev --port 5189 --strictPort`:

- **Live region** through the accessibility tree and the DOM: `aria-live="polite"` and
  `aria-atomic="true"` on the hidden span, none on the high score, the visible number
  absent from the tree, the header reading `Score: <n>`. A `MutationObserver` counts how
  often the hidden text changes while a burst of moves is simulated (keydown events
  `MOVE_COOLDOWN_MS` apart): the visible score changes on every move, the live text
  once, 500 ms after the last one. A slide without a merge and `New Game` at 0 change
  nothing; `New Game` at a positive score announces `0`; the starting value is written
  without a delay. The shared browser pane is hidden (no frames, no trusted input), so
  the DOM-level checks run in it with timeouts, and the keyboard, mouse, accessibility
  tree, and screenshot checks run in a separate headless Chrome driven over the DevTools
  protocol (real `Tab`, `Enter`, `Escape`, and mouse events).
- **Focus ring**: `Tab` through the page, then through the win dialog and the game-over
  dialog; the computed `outline` on every focused button is the same
  (`3px solid rgb(255, 255, 255)`, offset 3px), a mouse click shows none, and the board
  (focused after a dialog closes) shows none. The outline is sampled right after the
  focus lands, because the buttons have `transition: all` and animated it in (section 1).
- **Hover**: focus a button and hover it; the ring moves with the 2px `translateY` and
  is not clipped or doubled.
- Mobile width (320px, the narrowest supported, where the dialog buttons stack): the
  ring is not clipped by the dialog or the page.

What cannot be checked here: how NVDA and VoiceOver actually speak the announcement
(timing, queue, whether the load announcement is really suppressed). It goes into the
report as a manual step.
