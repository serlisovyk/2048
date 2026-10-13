# The footer's year is written by a view at load; the GitHub link is a row of its own in the page's flow

Date: 2026-10-13 · Status: accepted

## Context

The page named no author and linked to no source (MY-135). The author asked for a footer
`Serhii Lisovyk · <current year>` under a thin line as wide as the board, at the bottom of the page
when there is room and after the board when there is not, and a GitHub icon "in the very top right
of the page", clear of the header at every width, with the toolbar's three-button limit at 320px in
mind. Each part had an obvious alternative.

## Decision

- **The year is written in the browser, by `FooterView`.** The markup holds the name and an empty
  `<span class="footer-year">`; `main.js` passes `new Date().getFullYear()` to
  `FooterView.renderYear`, which writes ` · 2026` (the separator goes with the year, so before the
  script runs, or if it never does, the footer reads `Serhii Lisovyk`, never `Serhii Lisovyk ·`). A
  view owns the element and the way the data looks, and the composition root only finds the element
  and hands over a value, as it already does with `matchMedia` (`ai/rules/oop.md`). There is no
  controller: nothing is decided or stored. The year is read once per page load. Rejected: a Vite
  `transformIndexHtml` step (a static site built in 2026 would still say 2026 in 2027 until the next
  deploy, and it edits `vite.config.js`, a repo-wide file); the year in the markup (the hard-coded
  value the author did not want); `document.querySelector(...).textContent = ...` in `main.js` (the
  root would then draw).
- **The footer is the last child of `.game-layout`**, with `width: min-content; min-width: 100%` like
  the header, so it is as wide as the board without knowing the board's width and can never widen
  the wrapper. Its divider is its `border-top`, in a new token `--divider` (`--surface-border` is
  1.7:1 on the dark page and 1.3:1 on the light one, too faint to see; `--divider` is 2.2:1 and
  1.96:1; it is a decoration, so it has no contrast requirement, only to be seen). The text is
  `--text-muted` (7.2:1 and 5.4:1). Rejected: a footer outside the wrapper with its own width (it
  would repeat the cell arithmetic or need JS, which `2026-10-10-header-toolbar.md` rejected for the
  header), and a grid `body` with spacer rows (the same reason: the footer would not be in the
  wrapper).
- **Pinned to the bottom with room, after the board without it, with no breakpoint.** `.game-layout`
  has `flex-grow: 1` and the header and the footer both `margin-top: auto`: free height is split into
  two equal gaps, above the header and between the board and the footer; with none, both are 0 and
  the layout's `gap` is the distance. Rejected: `position: fixed` or `absolute` (covers the board on
  a short screen) and a `vh` formula.
- **The GitHub link is a flex item of `body` with a row of its own**, `align-self: flex-end`, first
  in the DOM, a 44px target holding the 24px mark. A corner icon out of the flow cannot be "at the
  very top right" and "never overlapping" at once: at 375px the board leaves 32px each side, less
  than the target, and on a short screen the header starts at the top padding. A row of its own
  cannot overlap anything at any width; it costs 50px of height on a short screen and nothing on a
  tall one, because the layout centres the game in what is left. Rejected: a fourth toolbar button
  (excluded by the author; at 320px it makes the header 5px wider than the board), the logo row, and
  an out-of-flow corner icon with a breakpoint for wide screens (two modes, one of them a guess about
  the board's width, to save 50px on laptop-height windows).
- **First in the DOM** so the reading order, the `Tab` order and the visual order agree: one `Tab`
  from the page start reaches the icon, the next goes to `New game`. Rejected: last in the DOM with
  CSS `order` (the focus would jump against the picture).
- **The link is quiet**: `--icon-muted` (5.8:1 and 4.3:1 on the page, over the 3:1 an icon needs),
  `--icon-hover` on `--icon-hover-bg` on hover, like the reset-high-score icon, so it adds no
  colour. Its accessible name, which is also its `title`, is `Source code on GitHub (opens in a new
tab)`; `target="_blank"` with `rel="noopener"`.
- **The shared focus ring covers links**: the base rule's selector became `button, a` and
  `button:focus-visible, a:focus-visible`, so there is still one ring (width, offset, token) and no
  per-element focus style.

## Consequences

- The icon row and the footer add about 90px of height. At 320x568 the whole game still fits with no
  vertical scroll on every board size (41 to 63px to spare); on a shorter screen the page scrolls by
  the missing amount (43px at 320x480, 4x4). With room, the game is centred between the icon row
  and the footer, within about 6px of where it was centred before.
- A new line of text around the board goes in the footer or in a new last child of `.game-layout`; a
  new link out of the page is another flex item of `body`, not a toolbar button.
- The dialogs make the link and the footer inert without any code: both are outside every `<dialog>`.
- The GitHub mark is the Octicons `mark-github` path (MIT); the repository URL and the footer name are
  page content in the markup, not constants.
- Not checked: Safari and Firefox rendering, and a screen reader's speech (the accessibility tree
  was: `link` with the name above, `banner`, `main`, `contentinfo`).
