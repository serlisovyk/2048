# MY-141 — One wording, a settings dialog that behaves the same everywhere, a swipe on the whole page

Issue: MY-141 · Branch: `my-141-ux-behaviour` · Spec: `ai/superpowers/specs/2026-10-14-ux-behaviour.md`

MY-137 (JS) and MY-139 (CSS) are `Done` and in the branch base: the controllers are in
`src/scripts/controllers/`, the views follow the `render*` / `open*` / `on<Action>` vocabulary, the dialog
buttons are `.button` classes. MY-140 runs in parallel in another worktree. What the two issues share is only
`index.html`, `overlays.css`, `ai/map.md`, `ai/decisions/README.md` and `ai/rules/style.md`; the orchestrator
resolves those at merge, so each edit here is small and local.

## Author's answers

The issue's «Решения автора» (2026-10-13 and 2026-10-14) and the orchestrator's scope notes. All are final.

1. Sentence case everywhere; one name, `New game`, for one action (the toolbar, the confirmation, the win dialog, the
   game-over dialog instead of `Restart Game`); `Continue playing`, `You won!`, `Game over`; `High score` in the
   markup; `Highest tile` becomes `Best tile` in the game summary; the statistics labels are Games played / Wins /
   Best score / Best tile (the line "All board sizes" is MY-140's, not added here).
2. Settings: after a confirmed change in the middle of a game they open again; after `Cancel` / `Escape` focus is on
   the group that was changed; one line above the sections; after a confirmed statistics reset they open again; the
   first focus is the first group and a short screen does not open it scrolled down.
3. A swipe on the whole page, ignoring buttons, links, inputs and open dialogs; non-primary pointers ignored,
   `pointerId` stored and matched; pinch zoom is not disabled.
4. Boundaries with MY-140: not touched here are the layout of the statistics, the dialog title sizes, the label style
   over numbers, the trash icon, the score announcement, the board's accessible name, the board geometry, contrast.
   `.reset-statistics-button` stays a working hook for `SettingsView`.

## Decision records checked

- `2026-10-10-no-viewport-zoom-lock.md` — **partly superseded**: its `touch-action: none` on the board, its
  `manipulation` on the page and "a gesture surface stays small" give way to a swipe on the whole page. What stays:
  no `user-scalable=no`, no `maximum-scale`, no `touch-action: none`, `overscroll-behavior-y: none`, `viewport-fit=cover`.
  A new record restates it; this one changes only its `Status` line.
- `2026-10-11-settings-dialog-and-storage.md` — **partly superseded**: "after a no the settings pop in with focus on
  `Close`" and "`Close` has the initial focus (`autofocus`)". What stays: one dialog at a time (the settings close for
  the question), the stored `settings` object, `Close` and `Escape` focusing the gear.
- `2026-10-13-statistics.md` — the reset's "on a yes ... moves focus to the board" is replaced; the numbers, their
  rules and the question are not.
- `2026-10-10-confirm-dialog.md` — followed: `ConfirmDialogView` is not touched; its own rule (back to the opener on "no",
  to the board on "yes") still holds for the page's questions (`New game`, the high score reset).
- `2026-10-10-native-dialog.md`, `2026-10-10-keyboard-by-event-code.md`, `2026-10-10-header-toolbar.md` — followed, nothing
  contradicted. `2026-10-10-rejected-features.md`, `ai/rules/scope.md` — nothing from the lists.

## 1. Choices

### Texts: no new constant, the places that hold them

The texts are in `index.html` (markup) and in the three `Object.freeze` prompts of the controllers (`confirmLabel`).
Every user-visible string was grepped (markup, `aria-label`, `title`, the prompts, the views' `textContent`); the list is
in the spec. The two `New Game` confirm labels are two literals in two controllers, as the question's title already is
(`Start a new game?`): the use case owns its wording (`2026-10-10-confirm-dialog.md`), so no shared constant.

### Settings flow: both questions reopen the settings, focus is named

`SettingsController.#askFromSettings(prompt)` only closes the settings and asks; the callers reopen them, whatever the
answer, so the two answers differ only in what happened in between:

- `requestChange`: on "yes" apply and `restart()` (no longer `restartAndFocus()`: the board is not focused, the settings
  are), then `open()` and `view.focusSetting(name)`; on "no" the same without the change. `open()` renders from the
  stored values, so a refused change is reverted by the render and the option shows its saved value.
- `requestResetStatistics`: on "yes" `reset()`, then `open()` (the zeros are rendered; the button is hidden, so the focus is
  the first group); on "no" `open()` and `view.focusResetStatistics()`.
- A change on a fresh board is untouched: no question, the dialog never closes, focus stays on the clicked option.

`SettingsView` gets `focusSetting(name)` (the checked option of that group) and `focusResetStatistics()`; `open()`
focuses the first checked option, which is the first group's, and the Close button loses `autofocus`. Rejected: `autofocus`
on an option in the markup (it cannot know which of the three is checked, and a focused unchecked radio breaks the arrow
keys' start); `open(focusName)` (one method then has to know the reset button as a "name"); leaving the choice to the
browser's first focusable (differs between engines). The vocabulary in `ai/rules/oop.md` gets `focus*` ("moves focus
inside the view", as `GridView.focus` does).

**Opening scrolled down.** The baseline on the dev server: `scrollTop` 86 at 667x375, 107 at 568x320 and 0 at 320x480,
with focus on `Close`, the last element. With the first option focused there is nothing to scroll to; `open()` also sets
`scrollTop = 0`, and building it showed both lines are needed (see "What building it found").

**The note** is `<p id="settings-note" class="settings-note">` between the title and the first section, the dialog's
`aria-describedby` (as the confirmation's message is). It looks like the sections, not like a second title: left aligned,
`--font-caption`, the dialog text colour, so no new colour token. Its rule sits in the `.settings-dialog` block of
`overlays.css`.

### Swipe: one tracked pointer on `document`

`SwipeInput` takes `{ target, onDirection }` (the name `KeyboardInput` already uses) and `main.js` gives it `document`.

- `pointerdown`: ignored unless `event.isPrimary && event.button === 0` (a second finger, the right and middle mouse
  buttons and a non-primary pen), unless the target is outside `a, button, input` (`closest`), and while a `dialog[open]`
  exists. Otherwise the pointer is stored as `{ id, x, y }`, one field.
- `pointerup` / `pointercancel`: act only when `event.pointerId` equals the stored id; another pointer neither moves nor
  resets. At `pointerup` the direction is read as before; the move is skipped when a dialog has opened since
  `pointerdown`. A press that began outside the page (or on a button) never has a stored pointer, so its `pointerup`
  finds none.
- The 30px threshold and the dominant axis are untouched.

### `touch-action`: `pinch-zoom` on the page, nothing on the board and the dialogs

`html, body { touch-action: pinch-zoom }`; the `touch-action: none` on `.game-container` goes; no rule on `dialog`.

- **What it does.** The allowed gestures are only the multi-finger ones: a single finger cannot pan the page, so a swipe
  is not taken over by a scroll (`pointercancel`) and reaches `pointerup`; double-tap zoom is not in the list, so it stays
  off; pinch zoom works everywhere, the board included. `manipulation` (the old value) allows a single-finger pan, so a
  swipe on the page would be cancelled; `none` blocks pinch zoom, which the decision forbids.
- **Support** (MDN browser-compat data for `touch-action: pinch-zoom`; MDN marks the property Baseline, widely available):
  Chrome and Chrome for Android 56, Edge 12, Firefox 85 (desktop and Android), Safari 13, Safari on iOS 13, Samsung
  Internet follows Chrome. Vite 7's default build target is Chrome 107 / Edge 107 / Firefox 104 / Safari 16, all above. No
  fallback line is needed. Browsers that lack the value would drop the declaration and swipes would be cancelled by
  panning; none is in the target.
- **A dialog still scrolls.** The touch-action of a touch is the intersection of the values from the touched element up to
  the nearest scroll container (MDN), and a dialog is its own scroll container (`overflow: auto`, the browser's default), so
  the page's value does not reach it. Measured in Chrome (touch emulation, one finger): a dialog scrolled by 149px under a page value of `pinch-zoom` and by 105px under `none`, with no rule of its own.
- **Measured in Chrome 155** (touch emulation, a 375x600 page taller than the screen): one finger dragged up scrolls the
  page under `auto` and `manipulation` and fires `pointercancel`; under `pinch-zoom` and `none` it does not scroll and
  `pointerup` arrives. A two-finger spread zooms the page to the maximum under `auto`, `manipulation` and `pinch-zoom`, and
  not under `none` and `pan-y`. A two-finger parallel drag scrolls the page under `pinch-zoom` (243px) and not under `none`.
- **The price.** The page cannot be scrolled with one finger. Where the layout is taller than a short screen (a phone on its
  side) the part below the fold (the footer, the GitHub link) is reached with a two-finger drag; keeping the board in the
  window is MY-140's. The old record kept a scrollable margin around the board for this; the author chose the whole page
  instead. The record says so.

### What the mouse does

A left-button drag anywhere on the page is a swipe too (it was on the board before). Text under the drag may get selected;
`user-select: none` stays on the board only. Not changed: a mouse drag is not a feature to extend.

## 2. Where each part lives

| File                                                  | Change                                                                                                                  |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `src/index.html`                                      | Texts; the note; `aria-describedby`; no `autofocus` on `Close`.                                                         |
| `src/scripts/controllers/GameController.js`           | `confirmLabel: 'New game'`.                                                                                             |
| `src/scripts/controllers/SettingsController.js`       | `confirmLabel`; both questions reopen the settings and name the focus; `#askFromSettings` only asks.                    |
| `src/scripts/ui/SettingsView.js`                      | `open()` resets `scrollTop` and focuses the first option; `focusSetting(name)`; `focusResetStatistics()`.               |
| `src/scripts/input/SwipeInput.js`                     | `target`, one tracked pointer, the ignored starts, the dialog check.                                                    |
| `src/scripts/main.js`                                 | `SwipeInput` gets `target: document`.                                                                                   |
| `src/styles/base.css`, `board.css`, `overlays.css`    | `pinch-zoom` on `html, body`; the board's `touch-action: none` removed; `.settings-note`; no `justify-content: center`. |
| `ai/decisions/`                                       | Two records: the settings flow and the swipe surface; their `Status` lines on the records they replace.                 |
| `ai/rules/*`, `ai/skills/*`, `ai/map.md`, `README.md` | The swipe line of `style.md`, the texts rule, `focus*`, the settings recipe, `SwipeInput`, one README line.             |

No new constant, no new file in `src/`, no change to the storage keys or the save format.

## 3. Size

The budget is JS 10 kB and CSS 5 kB; before this change 8.03 and 4.09. The change is a handful of lines each; the report
gives the numbers.

## 4. Commits

1. `docs: add spec and plan for MY-141 UX behaviour` — this file and the spec, before any code.
2. `fix: use one sentence-case wording and one name for the new game action` — `index.html` and the two prompts.
3. `feat: reopen the settings after their questions and focus the group in use` — the settings flow, the note, the first focus.
4. `feat: read the swipe on the whole page with one tracked pointer` — `SwipeInput`, `main.js`, `touch-action`.
5. `docs: record the settings flow and the swipe surface` — two decision records, the rules, the skills, the map, README.
6. `fix: keep the focused option fully in view when the settings reopen` — found while playing a short screen.
7. `docs: record what building MY-141 found in its plan and spec`.

## 5. Verification

The four checks, then a real browser (headless Chrome over CDP, port 9432, against the dev server on 5192 and the
production preview on 5196), as in the spec: every text; both flows with each answer and where focus lands; the keyboard;
the settings at 667x375, 568x320 and 320x480; the swipes with touch emulation at 375 and 320 (on and off the board, a
second finger, from a button, a dialog open) and a mouse drag started outside the board and outside the window;
`touch-action` computed; a real two-finger spread; reduced motion; the console.

## 6. What building it found

- **The dialog hid its own title.** On 667x375 and 568x320 the settings' title and note sat at -62 and -83px: the `dialog`
  rule made `[open]` a flex column with `justify-content: center`, and content taller than the box overflows on both
  sides, so what is above the top cannot be scrolled to. `scrollTop` 0 alone would have opened a dialog with no title.
  The line is removed; the other three dialogs are unchanged to the pixel (measured with and without it at 1000x800,
  375x667, 320x568 and 667x375: only the overflowing settings differ).
- **A closed dialog keeps its scroll position.** At 320x480 a dialog scrolled to the bottom and reopened stayed at 37px with
  focus on the first option (already visible), so `open()` needs its own `scrollTop = 0`. After it: `scrollTop` 0 and the
  title visible at 667x375, 568x320, 320x480, 320x568, 375x667 and 1000x800, on the first open and on a reopen after
  scrolling.
- **Focusing the hidden radio can leave the drawn option half cut off.** The input is 1px at the label's top; at 568x320 it
  counts as in view while the label is not. `#focus` also calls `scrollIntoView({ block: 'nearest' })` on the label (commit
  6); a refused win target change then shows the whole option, and the reset button stays in view after a refusal.
- **The old swipe code against the new checks** (the same tests, run first on the old files): 18 of them failed. A swipe off
  the board did nothing, a second finger that swiped while the first rested made a move, a swipe that ended after a dialog
  opened made a move, a pinch on the board did not zoom (`touch-action: none`), one finger scrolled the page by 351px at
  667x375, a mouse drag off the board did nothing. With the new code all pass, on `yarn dev` and on the production build:
  the browser checks (touch emulation at 375x667, 320x568, 667x375, 568x320 and 320x480, the mouse at 1000x800), and 16
  more that dispatch pointer events by hand (a non-primary pointer, another `pointerId`, a `pointercancel` of the other
  pointer, an unmatched `pointerup`, an icon inside a link, a dialog opened between down and up, under the threshold).
- **Two fingers** are taken over by the browser under `pinch-zoom` (`pointercancel` for both), so a two-finger gesture
  never reaches `pointerup` in Chrome; the pointer-id guard is for engines that deliver them, and is checked with
  hand-dispatched events.
- **Keyboard only**, with and without reduced motion: the Tab order, `Enter` on the gear, arrows on a radio group (applied
  at once on a fresh board, a question in a game), `Escape`, the confirmation with `Tab` and `Enter`, `Space` on
  `Reset statistics`, `Close`. The settings dialog's accessible description is the note.
- **Size** (`yarn size`, gzip): JS 8.03 to 8.19 kB of 10 kB, CSS 4.09 to 4.09 kB of 5 kB, the font unchanged.
- **Not a problem, checked**: the console has no error. Chrome's "preloaded but not used" warning for the font appears only
  on pages reloaded in quick succession by the test harness, not on a page left open for 6 seconds (`document.fonts`
  reports `loaded`), and the `<head>` is untouched by this issue.
- **Not checked**: Safari and Firefox, a real phone (iOS double-tap zoom under `pinch-zoom` is taken from the spec and
  MDN), a screen reader's speech.
