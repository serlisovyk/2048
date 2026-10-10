# MY-117 — Reset the high score with a confirmation (spec)

Issue: MY-117 · Branch: `my-117-reset-high-score` (stacked on `my-115-confirm-new-game`) · Plan: `ai/superpowers/plans/2026-10-10-reset-high-score.md`

## Goal

The high score is kept forever and can only be cleared through DevTools. Give the
player a way to reset it that is deliberate: a small icon next to the number, and a
confirmation before anything is erased. The confirmation is the shared dialog from
MY-115.

## Behavior

### The button

- A small icon-only button inside the `High Score` box, right after the number: a
  circular arrow, inline SVG, no icon library.
- Accessible name `Reset high score` (`aria-label`), the same text as its `title`
  tooltip. The icon itself is hidden from assistive technology.
- **While the high score is `0` the button is hidden** (not just dimmed): there is
  nothing to reset, and the box stays as quiet as before for a new player. It appears
  as soon as the high score is above `0` — after the first score, or on load when a
  high score is stored — and disappears again after a reset.
- Muted by default, brighter on hover. Large enough to tap (about 32px) without making
  the score box taller. A real `<button>`, reachable with `Tab` (after the score
  header, before the board); `Enter` and `Space` activate it.

### The confirmation

Clicking it opens the shared confirmation dialog (`ConfirmDialogView`, MY-115):

| Part          | Content                                                        |
| ------------- | -------------------------------------------------------------- |
| Title         | `Reset the high score?`                                        |
| Message       | `It will be set back to 0. Your current game is not affected.` |
| First button  | `Cancel` — initial focus                                       |
| Second button | `Reset`                                                        |

Everything about the dialog's behavior is MY-115's: modal and inert page, `Tab` cycle,
`Escape` and `Cancel` mean "no", a forced close means "no", no animation under
`prefers-reduced-motion`.

- `Cancel` / `Escape` (and a close forced by the browser): nothing changes — the high
  score, the current game and the saved game are as before — and focus goes back to the
  reset button that opened the dialog, so a keyboard user carries on from there.
- `Reset`: the high score becomes `0` in the page and in `localStorage`
  (`highScore` = `0`), the button disappears. It stays `0` after a reload. Focus goes to
  the board (the button is hidden by then, so there is nothing to return to).
- **The current game is not touched**: board, score, the saved game, a pause after a
  win — all unchanged. The saved game is not rewritten.

### The record follows the score again

The high score is the best score seen, so the existing rule still applies after a
reset: when the current score is higher than the high score, the next move (or loading
a game in progress) raises the high score to it. Resetting in the middle of a game with
score `500` therefore shows `High Score: 0` next to `Score: 500` until the next move,
and a reload restores the game and shows `High Score: 500` again. The record stays `0`
for good only when the current game's score is `0` (a new game) or when the player
does not score anymore. This is the literal reading of "high score = 0, the current
game is untouched"; it is raised to the author as an open question in the report.

## Unchanged

- The confirmation dialog, `New Game` and its confirmation, the win and game-over
  dialogs, the movement guard, the saved-game format and `SAVED_GAME_VERSION`.
- The high score's storage key (`highScore`) and its format (a number as a string).

## Out of scope

- Where the button lives long-term: the settings dialog (MY-127) and the header with
  a toolbar (MY-120) decide whether it stays next to the record.
- A high score per board size after "Game modes": the reset there must clear the
  record of the current size (to be settled in that issue).
- Focus-ring styles for buttons and `aria-live` on the score (MY-116).
- Resetting anything else (the saved game, statistics).
