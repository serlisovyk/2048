# MY-120 — Header with a toolbar: logo, score boxes, icon actions (spec)

Issue: MY-120 · Branch: `my-120-header-toolbar` · Plan: `ai/superpowers/plans/2026-10-10-header-toolbar.md`

## Goal

Everything that sits around the board lives in one header: the logo, the score and the
high score, and a row of icon buttons with `New Game` in it. The theme switch (MY-123)
and the settings button (MY-127) are separate issues; the header must take them without
any layout work. The board stays the main thing on the screen at every width from 320px
up.

## What is wrong today

- Above the board there is a plain `2048 Game` heading and two score blocks side by
  side; the reset-high-score icon sits inline in the middle of the `High Score: 0`
  text.
- `New Game` is a text button under the board, far from the score and from where the
  next buttons will go.
- There is nowhere to put a theme switch or a settings button.

## Behavior

### Layout

- One `<header>` above the board, exactly as wide as the board (the header never makes
  the page wider, and never gets narrower than the board). Two rows:
  1. the logo on the left, the toolbar on the right;
  2. two score boxes of equal width: `Score` and `High Score`.
- **Logo**: the text `2048` on a gold rounded tile, like a game tile (the gold of the
  favicon's last tile). It is the page's `<h1>`, so the heading reads `2048`.
- **Score box**: a small uppercase label above a large gold value (the gold of today's
  numbers). A box keeps its size while the number grows, so the header never jumps.
  The high score box shows the reset icon to the right of the value while the high
  score is above 0 and hides it at 0, as it does today.
- **Toolbar**: a row of icon buttons, 8px apart, each a 44x44px target (a comfortable
  tap) on the same dark surface as the score boxes. Today it holds `New Game`.

### `New Game`

- It is the first icon button in the toolbar: a plus icon, `aria-label="New game"` and
  `title="New game"`. The text button under the board is gone.
- It works exactly as before (`ai/superpowers/specs/2026-10-10-confirm-new-game.md`):
  in a game in progress it asks for confirmation, `Cancel` is focused, `Escape`
  cancels and focus goes back to the toolbar button; a fresh or finished game starts
  over at once.

### Room for the theme switch and the settings

- The toolbar is a flex row. Adding another `<button class="toolbar-button">` to it is
  all a new control needs: no CSS and no layout change. At 320px wide the row holds
  three buttons (`New Game`, theme, settings) next to the logo without wrapping or
  overflow.
- Nothing is shown for the future buttons now: no placeholder, no disabled button, no
  empty gap. The room is guaranteed by the layout, and checked by adding two extra
  buttons in the browser.

### Icons and accessibility

- Icons are inline SVG: `currentColor`, `aria-hidden="true"`, `focusable="false"`, no
  icon font, library, or image file. Every icon-only button has an `aria-label` and a
  `title` with the same text.
- Screen reader: the header is the page banner, the heading reads `2048`, each score
  value is read after its label (`Score`, `High Score`), the reset icon reads
  `Reset high score`, `New Game` reads `New game`.
- The score announcement (MY-116) does not change: the visible score number stays
  `aria-hidden`, the hidden polite live region is read, the high score has none.
- Keyboard: the `Tab` order is the visual order: `New Game`, then the reset-high-score
  icon when it is shown. Every button gets the shared focus ring (MY-116) with no new
  focus CSS. The board is still focused from script and shows no ring.

### Responsive

- Works from 320px to desktop, with no horizontal scroll at any width: checked at 320,
  375, 768 (tablet), 1024 and a wide desktop.
- Narrow screens get a compact header: the logo, labels, values, paddings and gaps
  shrink with `clamp()`; the rows never wrap. At 320x568 the header and the whole board
  fit on the screen without vertical scrolling.
- Wide screens do not stretch the header past the board.

### Unchanged

- Game rules, scoring, the saved game, the dialogs and their texts, the confirmation
  flow, the score live region, and all JavaScript behavior. `New Game` keeps its
  `new-game-button` hook, the score elements keep their classes.
- The text buttons inside the win and game-over dialogs.
- Tile colors (MY-122) and the theme (MY-123).

## How it will be checked

`yarn lint`, `yarn format:check`, `yarn build`, `yarn size`, then play it in
`yarn dev --port 5191 --strictPort`:

- desktop (a wide window), tablet (768), 375, and 320px: the header looks like one
  piece, the board is the largest thing on the screen, and `document` has no
  horizontal overflow (checked by script, because the body clips `overflow-x`, by
  comparing every element's right edge with the viewport);
- `New Game` in the header: at once on a fresh game, a confirmation in the middle of a
  game with `Cancel` focused, `Escape` and `Cancel` return focus to the button, a
  confirmed new game resets the score and keeps the high score;
- the reset icon still works and hides at a high score of 0; the score announcement
  still fires (the DOM text of the live region changes after a move);
- two extra toolbar buttons are added in the browser at 320px to prove the room;
- `Tab` through the header: the order and the focus ring; the accessibility tree: the
  banner, the heading, the button names;
- a high score of seven digits in the box at 320px, to check it does not overflow;
- reduced motion: no new animation exists, the box and button transitions are cut by
  `motion.css`.

What cannot be checked here: how a screen reader actually reads the header. The
accessibility tree and the DOM are checked instead.
