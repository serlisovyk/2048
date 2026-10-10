# MY-125 — "New record!" badge when the high score is beaten

Issue: MY-125 · Branch: `my-125-new-record-badge` · Spec: `ai/superpowers/specs/2026-10-10-new-record-badge.md`

Blockers MY-120 (the header) and MY-114 (native dialogs) are `Done`. Related, not
blocking: MY-116 (`Done`, the score live region), MY-129 (win target `Todo`: it will change
`WIN_TILE`, not the score or the record, so the two do not touch). MY-123 (the theme) is
built in parallel in `header.css` and the other style files: this plan writes the badge
colours as plain values the header already uses (`#ffd700`, `#3b3226`) and does not turn
any colour into a custom property, so the theme task can tokenise them like the rest.

The issue said the screen-reader question is "to be decided in the plan", so the work
stopped after this plan. The author approved it, every recommendation included
(section 5); the options that were not taken stay written down as the reasons.

No decision record is contradicted:

- `2026-10-10-score-live-region-and-focus-ring.md` — still no live region on the high
  score. With the recommended option the record rides on the score's existing live region
  (one more word in one announcement), which refines "the announcement is the bare
  number" and is written down in a new record.
- `2026-10-10-score-pop.md` — the same pattern is reused for a transient decoration:
  `aria-hidden`, out of the layout, removed on `animationend`, duration from a CSS custom
  property, its own override in `motion.css`.
- `2026-10-10-header-toolbar.md` — the badge floats over the score box and never changes
  the header's size.
- `2026-10-10-saved-game-format.md` — the saved game does not change; a flag that is not
  saved is derived on restore (section 1).
- `2026-10-10-rejected-features.md` — gets one more row, confetti on a win, as the issue
  asks.

## 1. Choices

### The rule, and where its state lives

The rule: the badge shows on the **first move of a game after which the score is above
the high score**, if that high score was above 0.

The state is **one private boolean in `GameController`**, `#hasRecordToBeat`: "a record
exists and this game has not beaten it yet". The controller already owns the high score
(`#highScore`, its storage, and the one place that raises it, `#renderScore`), and the
model does not know about it: the saved-game decision keeps the high score out of the game
state. So the controller is the only layer that can tell "the score has just passed the
record", and a flag about the game's flow is controller state (`ai/rules/oop.md`).

- `#startNewGame()`: `#hasRecordToBeat = #highScore > 0`, and the badge is hidden.
- `#restoreSavedGame()`: `#hasRecordToBeat = game.score < #highScore` (set before
  `#renderScore()`), the badge is not shown.
- `#renderScore()`: when `score > #highScore`: if `#hasRecordToBeat`, clear it and call
  `scoreView.showNewRecord()`; then raise the high score as today.
- `#resetHighScore()`: `#hasRecordToBeat = false`, and the badge is hidden.

One flag is enough because the high score is raised on every move that passes it: the
first move that passes it is the only one that can see `#hasRecordToBeat` still set, and
that clears it. The flag is cleared for a record of 0 too (a first game, a reset), so the
rest of such a game stays silent: with a "has the badge been shown" flag instead, the
second move after a reset would "beat the record" the first move had just set.

Rejected: the rule inside `Game` (`move()` would return `isNewRecord`). It would drag the
high score into the model (a constructor or `start()` argument and a restore argument),
and the model today knows nothing about it. Rejected: a `RecordTracker` class for one
boolean. Rejected: the view deciding (rules do not belong in views).

### What each case does

| Case                                              | Result                                                                                   |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| First game ever (high score 0)                    | No badge, ever; the flag is cleared on the first points                                  |
| Record 100, game passes 100                       | Badge once, on that move                                                                 |
| The same game keeps going                         | Nothing more: the flag is clear                                                          |
| Score ties the record, then passes it             | Badge on the move that passes it                                                         |
| `New Game` / `Restart Game`                       | Badge removed; armed again if the record is above 0 (it includes the game just finished) |
| Reset high score, "yes"                           | Badge removed; no badge for the rest of that game; the next game is armed again          |
| Reload, restored score below the record           | Armed: badge when the record falls                                                       |
| Reload, restored score at or above the record     | Not armed: no badge for the rest of the game, none on load                               |
| Reload while the badge is visible                 | Badge gone; the game is not armed (its score is at the record)                           |
| The move that passes the record also wins or ends | Badge shows under the dialog backdrop and finishes by itself                             |
| Blocked storage (high score never loads)          | Starts at 0 like a first game; works in memory for the session                           |

Consequences worth knowing: after a very short first game (say a record of 12) the next
game shows the badge a few moves in. That is the rule in the issue (the record was above
0); a minimum record would be a new rule. And a game that only **tied** the record before
a reload is treated as "already at the record" and shows no badge when it later passes it.
That cannot be told from "broke it" without storing a flag in the save, and a change of
the saved shape is a version bump (`saved-game-format`) for a decoration. Accepted.

### Where the badge sits and what it looks like

A pill that straddles the **top edge of the High Score box at its right end**, like a flag
on the corner. Prototyped in the page (not committed); screenshots in the scratchpad
folder `my125/shots/`: `proto-A-1000-full.png` and `proto-A-320-full.png`
(with a 7-digit high score and the reset button), and `proto-A-320-x3-header.png` (zoomed).

- Half of it (about 8 px) is in the gap under the toolbar, which is 10 px at 320px and
  16 px on desktop; half is over the box's top padding. At 320px the pill is 2.7 px under
  the toolbar button (measured) and ends about 2 px above the capitals of the `HIGH SCORE`
  label (by eye on the zoomed screenshot). Tight, but nothing touches. On desktop the
  clearances are larger.
- The reset button is in the box's second row: its top is 17.6 px under the box's top edge
  at 320px and 24.8 px on desktop, and the pill reaches only about 7 px into the box, so
  they cannot meet. The prototype's rectangles confirm it at both widths; the check is
  repeated on the real thing.
- Absolutely positioned in `.score-box` (which is already `position: relative` for the
  score pop), `pointer-events: none`, so it takes no space and no tap. A `hidden` element
  in the markup, not a created one: `<span class="record-badge" aria-hidden="true" hidden>New record!</span>`
  at the end of the High Score box. No `display` is set on it, so `hidden` keeps working.
- Colours are the ones the header already uses: `#ffd700` and `#3b3226` (8.9:1), a shadow
  of `rgba(0, 0, 0, 0.35)`. No custom property yet; MY-123 tokenises them.

Tried and rejected, with the reason:

- **Over the `High Score` label** (a pill in the label row). Cleaner at 320px, but the label
  is wider than the pill at 1000px: a sliver of the label (`E`) sticks out next to the
  pill. It would need the label hidden with a selector that reaches from the badge to its
  sibling, and the label is lost for the length of the badge.
- **The bottom edge of the box.** The reset button is in the corner there; the pill
  would sit on the button's lower part.
- **In the empty middle of the logo row.** Not "at the record block", and at 320px it
  collides with the toolbar button.
- **A pill fully in the gap.** The gap is 10 px at 320px: a 10 px pill means an 8 px font.

### How long it stays and how it ends

Decided (Q1): about **4 seconds**, then it fades out and removes itself. The badge marks a
moment, like the score pop; it is not a status. A status would go stale in places: it
would have to survive a reload (it cannot, the state is not saved), and the header would
carry a gold pill for the rest of a half-hour game.

Mechanism, the same as the pop: one CSS animation on the badge, its length is a custom
property on the element (`--record-badge-duration: 4000ms`), and `ScoreView` hides the badge
on `animationend`. No JS timer and nothing in `constants.js`. When the badge is shown
again (the next game) the element goes `hidden` to shown and the animation starts again
from the beginning (to be checked in the browser). `New Game` hides it by setting
`hidden`, which cancels the animation.

Keyframes: opacity 0 to 1 and `scale` 0.6 to 1.08 over the first 8% (about 320 ms), settle
to 1 at 14%, hold, then fade out from 90%; `animation-fill-mode: forwards` so it does not
flash back before it is removed. `scale` is the individual transform property, so the
badge's `translate: 0 -50%` stays put. (`scale` and `translate` are in Vite's default
baseline-widely-available set.)

The alternative is "until the game ends": no animation timing, no `animationend`, and the
reduced-motion case costs nothing. The price is the stale status above, and a gold pill in
the header for the whole game.

### Reduced motion

Decided (Q3): **static**, as the issue says. The global rule in `motion.css` makes every
animation 0.01 ms long, which would remove the badge at once and make the feature useless
under reduced motion. So, as for the pop, the badge gets its own override: its duration is
restored with `!important`, and it plays a second keyframes rule that does not change
anything (`record-badge-static`, opacity 1 all the way), so the badge appears at once at
full size, stays 4 s, and is removed at once. No scale, no fade. The more specific selector
beats `*`.

The alternative is "fade in place", the author's choice for the `+N` pop: the same keyframes with
the scale start set to 1 by a custom property. That is one line less in `motion.css` and
no second keyframes rule.

### Screen readers

Decided (Q2): option A.

| Option                                              | What a screen reader user gets                                           | Cost                                                                                      |
| --------------------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| **A. Ride on the score announcement (recommended)** | One announcement: `New record! 1234600`, 500 ms after the last move      | A flag and one template string in `ScoreView.#announce`; refines the live-region decision |
| B. A second hidden polite region for the badge      | Two announcements in a row: the score and `New record!`, in either order | Another live region, a second debounce question, and the two can speak over one another   |
| C. Nothing: the badge is decoration                 | Nothing. The record has to be found by browsing to the high score        | Zero code, consistent with "no live region on the high score"; the moment is visual only  |

Why A: the player is told once, in the one place they already listen, with no duplicate of
the score and no new live region. The debounce is kept, so a burst of fast moves is still
read once, and the prefix is not lost when the record move is not the last move of the
burst. The wording is not repeated: the badge's own text is the prefix
(`${badge.textContent} ${score}`). The badge stays `aria-hidden` in every option, so
browse mode never reads it. B reads the same event twice. C is defensible (the score pop is
decoration, too), but the record is the one number worth hearing.

Mechanism for A: `ScoreView.showNewRecord()` shows the badge and sets a private
`#isRecordPending`; `#announce(score)` writes `New record! <score>` and clears the flag when it
is set; `hideNewRecord()` clears the flag too. The controller calls `renderScore` before
`showNewRecord`, so the debounce timer is already running when the flag is set and the
prefix lands on the announcement that is about to be written. While a modal dialog is open
the page is inert, so a record broken by the winning or game-over move is not read, the same
limit the score already has. Not verifiable here without NVDA or VoiceOver; the accessibility
tree and the live-region text are checked instead, and reported as such.

## 2. Where each part lives (`ai/rules/oop.md`)

| Layer / file               | Change                                                                                                                                                                                                                                                                                       |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/index.html`           | `<span class="record-badge" aria-hidden="true" hidden>New record!</span>` at the end of the High Score box. Nothing else.                                                                                                                                                                    |
| `src/scripts/main.js`      | Passes `recordBadgeElement: document.querySelector('.record-badge')` to `ScoreView`. The only DOM lookup stays here.                                                                                                                                                                         |
| `ui/ScoreView.js`          | Takes `recordBadgeElement`; `showNewRecord()` and `hideNewRecord()`; a listener that hides the badge on `animationend`; with option A, `#isRecordPending` and the prefix in `#announce`.                                                                                                     |
| `GameController.js`        | `#hasRecordToBeat`; set in `#startNewGame()` and `#restoreSavedGame()`, cleared in `#renderScore()` (which then calls `showNewRecord()`) and `#resetHighScore()`; `hideNewRecord()` from both reset paths.                                                                                   |
| `src/scripts/game/*`       | No change.                                                                                                                                                                                                                                                                                   |
| `src/scripts/constants.js` | No change: JS needs no timing, the 4 s lives in CSS.                                                                                                                                                                                                                                         |
| `src/styles/header.css`    | `.record-badge` (position, look, `--record-badge-duration`, animation) and `@keyframes record-badge`, next to the score pop rules.                                                                                                                                                           |
| `src/styles/motion.css`    | The static override for `.record-badge` and `@keyframes record-badge-static`.                                                                                                                                                                                                                |
| `README.md`, `ai/*`        | Features list; `ai/map.md` (HTML, `ScoreView`, `GameController`, styles); `ai/rules/style.md` and `ai/skills/feature.md` and `review.md` (transient decoration, the record rides on the live region); a decision record; the confetti row in `ai/decisions/2026-10-10-rejected-features.md`. |

## 3. Commits

1. `docs:` spec + plan (this commit, before any code).
2. `style:` the badge's styles: `header.css` and `motion.css`. Nothing is visible yet.
3. `feat:` the badge itself: the markup, the `main.js` wiring, `ScoreView`, and the
   `GameController` rule (and the announcement, per Q2).
4. `docs:` `README.md`, `ai/map.md`, `ai/rules/style.md`, `ai/skills/*`, the decision record
   with its index entry, and the confetti row in `rejected-features`.

## 4. Verification

`yarn lint`, `yarn format:check`, `yarn build`, `yarn size` (baseline from this branch's
base: JS 4.35 kB of 8 kB, CSS 2.58 kB of 4 kB, font 35.35 kB of 40 kB; the change is
expected to add roughly 0.2 kB to each of the first two). Then play it in
`yarn dev --port 5192 --strictPort`, driven from a headless Chrome over the DevTools protocol
(real key and touch events, emulated reduced motion), since the built-in browser pane cannot
run animations here. Positions come from `localStorage` (`highScore`, `savedGame`).

- **Rule**: record 100 and a game at 90 with a merge ready: the badge shows on the first move
  above 100 and nowhere else, and exactly one `animationstart` for the whole game. Record 0:
  never. Record 100 and a tie at exactly 100, then a merge: shows on the move above 100.
- **Boundaries**: `New Game` (with its confirmation) while the badge is up removes it and the
  next game shows it again once the record falls (a small record keeps the check short);
  the high score reset removes it, and later moves show nothing; a reload after the break
  shows nothing on load or on the next merge; a reload below the record still shows it when
  the record falls.
- **Header**: at desktop and at 320px (touch swipes) with a 7-digit high score, the bounding
  boxes of the logo, toolbar, both score boxes, and the board are identical before, during,
  and after the badge; the badge's rectangle meets neither the reset button nor the toolbar
  button; no horizontal scroll.
- **Motion**: with motion, the badge's opacity and scale at several moments (start, 150 ms,
  2 s, 3.8 s) and gone after 4 s; with `prefers-reduced-motion: reduce`, opacity 1 and no scale
  at every moment, and removed at about 4 s.
- **Screen reader**: the badge is absent from the accessibility tree; the live-region text
  changes to `New record! <score>` once and to bare numbers otherwise, with a burst of fast moves
  still read once. No NVDA or VoiceOver pass is possible here; reported as manual.
- **Screenshots** of the real badge (desktop, 320px, reduced motion) go to the scratchpad.

## 5. Author's answers (2026-10-10)

The author approved the plan with every recommendation in it.

1. **Q1. How long the badge stays.** About 4 s, then it fades (a CSS animation,
   `--record-badge-duration`, hidden on `animationend`, no JS timer).
2. **Q2. Screen readers.** Option A: announce once through the existing score live region
   as `New record! <score>`, with the debounce kept and the badge itself `aria-hidden`. It
   is recorded in a new decision record that refines the score live-region one.
3. **Q3. Reduced motion.** Fully static: the badge appears at full size, stays 4 s, and
   disappears, with its own override in `motion.css` like the score pop.
4. **Q4. A reset in the middle of a game.** The badge is removed and there is none for the
   rest of that game; the next game is armed again.
5. **Q5. Place and wording.** A flag on the top edge of the High Score box, on the right
   side, with the text exactly `New record!`.
