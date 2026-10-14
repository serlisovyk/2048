# The cell size is a function of the board size and the viewport; tile text is a share of the cell; the size picker is radios drawn as a segmented control

Date: 2026-10-12 · Status: accepted; the width-only formula (no height term, a 100px ceiling) is superseded by 2026-10-14-board-fits-the-window.md

## Context

The cell was `clamp(60px, 18vw, 100px)`, written for 4x4 on `.game-container`. With other sizes it breaks:
the 60px floor makes 5x5 wider than a 320px screen (`2026-10-10-tiles-over-the-grid.md` recorded it and left it
to MY-128), 3x3 at 18vw is a small board next to a big page, and the tile text was sized in viewport units, so
it did not follow the cell. The author also asked for a segmented control "3×3 | 4×4 | 5×5" that stays a radio
group.

## Decision

- **`--cell-size` is declared on `.game-grid`**, which owns `--board-size`, and is the smaller of two terms:
  `clamp(60px, 72vw / n, min(100px, 400px / n))` and `(100vw - 2 * page-padding - (n + 3) * gap) / n`.
  The first is the old rule with the size in it (`72vw / 4` is `18vw`, the cap for 4 is 100px), so **4x4 keeps
  exactly its cell size at every width** (measured at 320, 340, 375, 414, 480, 600, 768, 1000 and 1440px before
  and after: identical cell, grid, board and header). 3x3 is capped at the same 100px, so it never gets a cell
  bigger than 4x4's; 5x5 is capped at 80px, which makes its board about as wide as the 4x4 one on a desktop (496px
  against 484px, not 596px). The second term is what is left of the viewport after the page padding and the
  `n + 3` gaps (two paddings and the gaps between cells); it only bites where the floor would overflow (5x5 under
  about 400px: 47.2px at 320px, a 300px board in 300px of room). Rejected: a pure fit-the-width formula for every
  size (4x4 would grow on phones, a visible change nobody asked for), a class per size with its own numbers (a
  second place that knows the sizes), and a `vh` term (the page already scrolls on a short window at 4x4, and 5x5 is
  no taller than it).
- **Tile text is a share of the cell**, by digit count: 0.4 for 1-2 digits, 0.35 for 3, 0.3 for 4, 0.25 for 5 and
  0.2 for 6 (the fallback), `calc(var(--cell-size) * x)`. At the 100px cell these are the old 40, 35, 30, 25 and 20px,
  so 4x4 on a desktop is unchanged. There is no pixel floor, because a floor larger than the share is what overflows
  a small tile. Measured with `scrollWidth`: every value from 2 to 131072 fits its tile on every size from 320px up
  (on 5x5 at 320px the six-digit number is 9.4px, the smallest text in the game, and fits). The price: on phones
  4x4 text is larger than the old fixed 20px (24px at 320px, 27px at 375px), which is what "scales with the cell"
  means. Refines `2026-10-10-tile-palette.md` (sizes still follow the digit count; only the unit changed).
- **The size picker is three radio buttons drawn as a row of buttons.** Markup:
  `<label class="segment"><input class="visually-hidden" type="radio" name="boardSize" value="…"><span>3×3</span></label>`
  in a `role="radiogroup"` named by the section heading, as the settings recipe says. The inputs stay in the DOM
  and the accessibility tree (`.visually-hidden`, not `display: none`), so `Tab`, the arrows, `Space` and the group
  name work as for any radio group; the `<span>` is what is drawn. The chosen segment is filled like a primary
  button (`--button-bg` on `--button-text`), the others outlined (`--button-outline`), hover tints an outlined one,
  and the focus ring (`input:focus-visible + span`, the shared ring's width, offset and `--focus-ring-color`) is
  drawn on the `<span>` because a hidden input has nothing to show it on. No new colour: the tokens are the dialog's
  own and the light theme already re-points them for the settings card (contrast: 9.7:1 unchecked text and 21:1
  checked text on the dark card, 14.6:1 both on the light one, the outline 6.9:1 and 9.1:1). Each segment is 44px
  high. Rejected: a custom `role="radio"` widget (reimplements the keyboard), a `<select>` (not what the author
  asked for), and styling the native radios (cannot be a segmented control).
- **Each arrow press in the group is a change.** That is how radios work, and the author asked for them. In a
  game in progress each press asks "Start a new game?" (the settings closes for it, as in
  `2026-10-11-settings-dialog-and-storage.md`), so a keyboard player cannot arrow past a size without answering.
  Accepted for now; a change would be a different control, not a quiet tweak.

## Consequences

- A new board size is one more entry in `BOARD_SIZES` and one more segment; the cell formula and the text shares
  already cover it. The `400px` cap would need a look for a size above 5.
- `--cell-size` moved from `.game-container` to `.game-grid`; nothing else read it from the container. `--cell-gap`
  stays on the container and is inherited. The header still takes the board's width without knowing it
  (`2026-10-10-header-toolbar.md`): at 320px it is exactly as wide as the board on every size, even with a
  six-digit score and record.
- The page padding variable (`--page-padding`) enters the formula, so a change to that variable moves the fit; the
  safe-area insets are ignored here, as they were by the 4x4 rule.
- Not checked without real devices: a notched phone in landscape, Safari and Firefox rendering of the segmented
  control and of `min()` / `clamp()` with division by a custom property (all inside the Baseline set the build
  targets).
