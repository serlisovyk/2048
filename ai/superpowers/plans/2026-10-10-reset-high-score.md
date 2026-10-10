# MY-117 — Reset the high score with a confirmation

Issue: MY-117 · Branch: `my-117-reset-high-score` (stacked on `my-115-confirm-new-game`) · Spec: `ai/superpowers/specs/2026-10-10-reset-high-score.md`

Blocker MY-114 is `Done`; the confirmation it needed is MY-115's `ConfirmDialogView`,
which this branch is stacked on. Related: MY-127 (settings — may move the button),
MY-120 (header with a toolbar), MY-116 (focus rings and `aria-live`, in parallel).
No decision record is contradicted:

- `2026-10-10-confirm-dialog.md` — this is the second caller of the shared
  confirmation, which that record asks for: new texts, no new markup, view, or styles
  for the dialog itself.
- `2026-10-10-native-dialog.md` — the win and game-over dialogs keep returning focus to
  the board. The confirmation follows MY-115's own focus rule instead (decided there):
  "no" gives focus back to the opener — here the reset button — and "yes" puts it on
  the board.
- `2026-10-10-saved-game-format.md` — the saved game is untouched, no format change.
- `2026-10-10-rejected-features.md` — nothing from the list.

The issue leaves nothing "to be decided in the plan". Two points in it are consequences
rather than choices, and the author should know them (section 5).

## 1. Decisions

### 1.1 The button lives in `ScoreView`

`ScoreView` already owns the score header's elements and renders the high score, so it
owns the reset button too: a new `resetHighScoreButton` option, `onResetHighScore(handler)`
for the click, and `renderHighScore(highScore)` also sets `button.hidden = highScore === 0`.
Every path that changes the displayed record (load, a new record, a reset) already goes
through `renderHighScore`, so the visibility cannot drift from the number. No new
class: a second view for one button would be an abstraction for one implementation.

### 1.2 Hidden at zero, via the `hidden` attribute

- Hidden rather than disabled: a dimmed icon next to `0` is noise for a new player, and
  a hidden button leaves no dead control in the tab order. A disabled one would also
  need its own styles.
- The markup has `hidden` from the start, so there is no flash before the script runs.
- The class sets no `display` of its own (an author `display` would beat the UA
  `[hidden]` rule, the same trap as `dialog[open]`): the button stays the default
  inline-block, and the icon is aligned with `vertical-align` and negative vertical
  margins so it does not make the score box taller.

### 1.3 Reset writes `0`, it does not delete the key

`SafeStorage.setValue(STORAGE_KEYS.HIGH_SCORE, 0)`, the same call `#renderScore` makes
for a new record, so the stored value matches what the issue says ("0 in storage") and
the storage layer needs nothing new. `getNumber` reads it back as `0`.

### 1.4 The wording is a private static prompt in `GameController`

Next to `NEW_GAME_PROMPT`: `RESET_HIGH_SCORE_PROMPT` with `Reset the high score?`,
`It will be set back to 0. Your current game is not affected.`, `Reset`. The
message names the reassurance the player needs (the game goes on), as the issue says.

### 1.5 Icon

An inline SVG circular arrow (`viewBox="0 0 24 24"`, `stroke="currentColor"`,
`fill="none"`, round caps), `aria-hidden="true"`, `focusable="false"`; the
button carries `aria-label` and `title`. Drawn by hand, no library. The button colour
is muted (`#b0b0b0`) and brightens on hover.

## 2. Where each part lives (`ai/rules/oop.md`)

| Layer / file                     | Change                                                                                                                                                             |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/index.html`                 | In the `High Score` box: a `hidden` `<button class="reset-high-score-button">` with the SVG, right after the number. Nothing else in the header changes.           |
| `src/scripts/ui/ScoreView.js`    | `resetHighScoreButton` option, `onResetHighScore(handler)`, `renderHighScore` toggles `hidden`.                                                                    |
| `src/scripts/GameController.js`  | `requestResetHighScore()` — the use case; private `#resetHighScore()`; `RESET_HIGH_SCORE_PROMPT`.                                                                  |
| `src/scripts/main.js`            | The `ScoreView` gets the button; `scoreView.onResetHighScore(() => controller.requestResetHighScore())`. `scoreView` becomes a local `const`, as `overlayView` is. |
| `src/styles/controls.css`        | The button look (placed before the `.new-game-button` rules, away from the end of the file where MY-116's shared focus styles are likely to land).                 |
| Model, storage, input, constants | Unchanged. The dialog, its focus return and its motion rules are MY-115's.                                                                                         |

## 3. Controller

```js
async requestResetHighScore() {
  if (this.#highScore === 0) return

  if (!(await this.#confirm(GameController.#RESET_HIGH_SCORE_PROMPT))) return

  this.#resetHighScore()
  this.returnFocusToBoard()
}

#resetHighScore() {
  this.#highScore = 0
  this.#scoreView.renderHighScore(0)
  this.#storage.setValue(STORAGE_KEYS.HIGH_SCORE, 0)
}
```

- The `highScore === 0` guard is belt and braces: the button is hidden then.
- Only the high score is touched. `#game`, the grid, the saved game and
  `#isPausedAfterWin` are not read or written, so the game and its save are exactly as
  they were. Nothing can change the score while the modal is open, so no re-check
  after the `await`.
- `#renderScore()` is unchanged and still raises the high score when the score is
  higher — see section 5.

## 4. Styles

`controls.css`, one block (the icon button):

- `.reset-high-score-button`: `padding: 8px` around a 16px icon (32px target),
  `margin: -10px -6px -10px 0` and `vertical-align: middle` (the box does not grow and the
  icon sits close to the number),
  `background: transparent`, `border: none`, `border-radius: 50%`, `color: #b0b0b0`,
  `cursor: pointer`, `transition` on colour and background (`motion.css` already
  zeroes transitions under `prefers-reduced-motion`).
- `:hover`: `color: #ffffff`, a faint white background.
- `.reset-high-score-button svg`: `display: block`, so no baseline gap inside.
- No `:focus-visible` rules: MY-116 owns them; the browser's default ring shows
  meanwhile.

## 5. Consequences to report to the author

1. **The record is the best score seen, so it follows a higher score back.** After a
   reset in the middle of a game, `#renderScore()` raises the record to the current
   score on the next move, and on a reload the restored game does it at load. So
   `High Score: 0` stays `0` after a reload only when the current score is `0`. This
   follows from "reset to 0" plus "the current game is not touched"; the alternatives
   (the reset also sets the record to the current score, or a restored game never
   raises the record) change either the issue's wording or a MY-113 rule, so I keep the
   literal behaviour and ask.
2. **Merge with MY-116.** The button goes inside the `High Score` box (the clean place
   visually and for the reading order), so the line `<div>High Score: …</div>` is
   reformatted, and MY-116's `aria-live` markup on the line right above it is adjacent.
   A sibling button after the box would merge cleanly there but sits one flex gap away
   from the number and wraps under it on narrow screens. A dry-run merge of this branch
   with `my-116-a11y-score-focus` shows content conflicts in `src/index.html`,
   `src/scripts/main.js` (the `ScoreView` options), `src/scripts/ui/ScoreView.js` (the
   constructor), and the docs (`ai/map.md`, `ai/skills/feature.md`,
   `ai/decisions/README.md`); the stacked MY-115 conflicts with it in the three docs
   only. Every hunk is "keep both": the constructor options and fields sit side by
   side, and the score box keeps MY-116's announcement span.

## 6. Commits

1. `docs: add spec and plan for MY-117 reset high score` — these two files.
2. `feat: add a reset button next to the high score` — markup, `ScoreView`, styles. It
   shows nothing until the high score is above `0` and does nothing yet.
3. `feat: reset the high score after a confirmation` — controller use case, `main.js`
   wiring.
4. `docs: document the high score reset` — `ai/map.md`, `README.md`.

## 7. Docs

- `ai/map.md`: `index.html` row (the button), `ScoreView`, `GameController`
  (`requestResetHighScore`), the `HIGH_SCORE` storage row (written on a reset), the
  `controls.css` row, `main.js`.
- `README.md`: the features list (reset with a confirmation).
- `ai/decisions/`: no new record — the shared confirmation is MY-115's decision, and
  the reset semantics (section 5) are current behaviour, raised to the author; if the
  author changes them, that becomes a decision.

## 8. Verification

`yarn lint`, `yarn format:check`, `yarn build`, `yarn size`.

Play in `yarn dev --port 5188 --strictPort`, desktop and 375px / 320px wide. A stored
high score and prepared games come from `localStorage` (`highScore`, `savedGame`);
no constant is changed.

- High score `0` (no storage): no button on the page, none in the accessibility tree
  or the tab order. After the first merge the record rises and the button appears.
- Stored high score above `0`: the button shows right after the number, has
  `aria-label` / `title` `Reset high score`, and the score box is not taller than
  without it.
- Click, `Enter` and `Space` (button focused with `Tab`) open the dialog with the right
  texts and `Cancel` focused; `Tab` cycles the two buttons.
- `Cancel`, `Escape`: the record in the page and in `localStorage.highScore`, the board,
  the score and `localStorage.savedGame` (compared as strings) are unchanged; focus is
  back on the reset button.
- `Reset`: the page shows `High Score: 0`, `localStorage.highScore` is `0`, the button
  is gone; the board, the score and the saved game string are the same as before;
  focus is on the board.
- Reload after a reset: with a fresh game the record stays `0`; with a game in
  progress and score above `0` the record follows the score (section 5) — recorded as
  observed, not as a defect.
- The record rises again after a reset: the button comes back.
- The reset dialog and the `New Game` dialog reuse one element: each shows its own
  texts, one after the other, and never together (`dialog[open]` count).
- The button is inert behind an open win / game-over / confirmation dialog.
- Mobile width: the button is tappable, the dialog fits, no sideways scroll.

## 9. Out of scope

Per-size records (Game modes), the settings dialog (MY-127), the toolbar header
(MY-120), focus rings and `aria-live` (MY-116), resetting anything but the high
score, and any automated test.
