# MY-141 — One wording, a settings dialog that behaves the same everywhere, a swipe on the whole page (spec)

Issue: MY-141 · Branch: `my-141-ux-behaviour` · Plan: `ai/superpowers/plans/2026-10-14-ux-behaviour.md`

## Goal

The UX audit of 2026-10-13 found three kinds of unevenness: one action has several names and the
texts mix upper and lower case; the settings dialog opens scrolled down on a short screen, loses
focus on a refused change and behaves differently on a fresh board and in the middle of a game; a
swipe works on the board only, and a second finger can make a false move.

## Author's decisions (2026-10-13 and 2026-10-14, final)

- Sentence case everywhere; one name for one action.
- After a confirmed size or target change in the middle of a game the settings come back.
- A swipe works on the whole page; a second finger never makes a move.
- Statistics labels have no "(all sizes)": Games played, Wins, Best score, Best tile (the line
  "All board sizes" under the heading is MY-140). In the game summary "Highest tile" becomes
  "Best tile".

## Behavior

### Texts

| Where                                   | Before             | After                                                      |
| --------------------------------------- | ------------------ | ---------------------------------------------------------- |
| Header label (shown in capitals by CSS) | `High Score`       | `High score`                                               |
| Win dialog, title                       | `You Won!`         | `You won!`                                                 |
| Win dialog, buttons                     | `Continue Playing` | `Continue playing`                                         |
|                                         | `New Game`         | `New game`                                                 |
| Game-over dialog, title                 | `Game Over!`       | `Game over`                                                |
| Game-over dialog, button                | `Restart Game`     | `New game`                                                 |
| Game summary (win, game over)           | `Highest tile`     | `Best tile`                                                |
| Confirmation, accept button (twice)     | `New Game`         | `New game`                                                 |
| Settings, above the sections            | -                  | `Changing the board size or win target starts a new game.` |

Already right and unchanged: the toolbar button (`aria-label` and `title`) `New game`, the question
`Start a new game?`, `Reset the high score?`, `Reset the statistics?`, `Reset`, `Cancel`, `Close`,
`Settings`, `Board size`, `Win target`, `Statistics`, `Games played`, `Wins`, `Best score`,
`Best tile`, `Reset statistics`, `New record!`, `You've reached <target>!`. The score announcement
and the board's accessible name are MY-140's.

### Settings dialog

- **Opening** (the gear): the first focus is the chosen option of `Board size` (the first group),
  not `Close`. The dialog starts at its top on every screen, at 667x375, 568x320 and 320x480 too
  (`scrollTop` is 0). It still scrolls inside itself when it is taller than the screen.
- **The note** `Changing the board size or win target starts a new game.` is one paragraph between the
  title and the first section; a screen reader reads it as the dialog's description.
- **A change on a fresh or finished board** is as before: it applies at once, the board starts over
  and the dialog stays open with focus on the option just chosen.
- **A change in the middle of a game** closes the settings and asks `Start a new game?`:
  - `New game`: the new value is saved, the board starts over and **the settings open again**, as
    they are after a change on a fresh board, with focus on the chosen option of the group that was
    changed (the target can be set right away). The board is not focused.
  - `Cancel`, `Escape` or a forced close: nothing changes, the settings open again showing the saved
    value, with focus on the chosen option of the group that was changed, not on `Close`.
- **Reset statistics** (`Reset statistics` button, then `Reset the statistics?`):
  - `Reset`: the four numbers are set to 0 and **the settings open again**, showing the zeros, with
    focus on the first group (the button is hidden while every number is 0). The board is not
    focused.
  - `Cancel`, `Escape` or a forced close: the settings open again with focus on `Reset statistics`.
- `Close` and `Escape` close the settings and focus the gear button, as before. Never two dialogs
  are open at once.

### Swipe

- A swipe is read on the whole page, not only on the board.
- It does **not** start on a button, a link or an input, and nothing is read while a dialog is open
  (a swipe that began on the page and ended after a dialog opened makes no move either).
- One pointer is followed at a time: the primary one (the first finger, the left mouse button, a
  pen). Its `pointerId` is stored at `pointerdown` and must match at `pointerup` and
  `pointercancel`. A second finger, a pointer that began outside the page (a mouse drag that starts
  outside the window) or on a button, and a right or middle mouse button never make a move and never
  disturb the one being followed. A pinch is taken over by the browser (`pointercancel`) and moves
  nothing.
- Direction and the 30px threshold are as before; every move still goes through
  `GameController.requestMove`.
- `touch-action`: the page and the board give no single-finger pan, so a swipe is not turned into a
  scroll (`pointercancel`); pinch zoom stays allowed everywhere, the board included; double-tap zoom
  stays off. A dialog still scrolls with one finger. Pinch zoom is not locked
  (`2026-10-10-no-viewport-zoom-lock.md`): there is no `user-scalable=no`, no `maximum-scale`, and
  `touch-action: none` is not used anywhere.
- The page itself no longer scrolls under a single finger. On a screen shorter than the layout the
  rest of the page (the footer, the GitHub link) is reached with a two-finger drag or a zoomed-in
  page; the board is sized to the viewport by MY-140.

### Unchanged

- Game rules, the saved game, the settings and the statistics values and their storage, the
  keyboard input, the high score, the theme, the board and the header.
- `Close`, the confirmation's focus rule for the page's own questions (`New game` and the high
  score reset: back to the button on "no", to the board on "yes").

## How it will be checked

`yarn lint`, `yarn format:check`, `yarn build`, `yarn size`, then play it in a real browser
(headless Chrome over CDP) on `yarn dev` and on the production build:

- every text in every dialog, both themes;
- a size and a target change on a fresh board and in the middle of a game, with `New game`,
  `Cancel` and `Escape`, and where focus is after each; the statistics reset the same way;
- the keyboard only (`Tab`, arrows on the radios, `Enter`, `Escape`);
- the settings at 667x375, 568x320 and 320x480: `scrollTop`, the first focus, scrolling inside by
  touch;
- swipes on and off the board at 375 and 320 (touch emulation), with a second finger, from a
  button, with a dialog open, a mouse drag begun outside the board and outside the window;
  `touch-action` computed on the page, the board and the dialog; a pinch gesture still zooms;
- reduced motion; the console is clean.

What cannot be checked here: Safari and Firefox on a real phone, a screen reader's speech. The
`touch-action` support is taken from MDN's compatibility data and noted in the plan.
