# The theme is a `data-theme` attribute set by a head script, with colour tokens in two files; the head script is the one direct `localStorage` read

Date: 2026-10-10 · Status: accepted · partly superseded by `2026-10-14-theme-head-script-vite-plugin.md` (the head script is a file inlined by a plugin, the key is imported)

## Context

The game had one dark theme whose colours were literals in six stylesheets (MY-123). A light
theme needs every colour to be swappable, a switch, a default that follows the system, and no
flash of the wrong theme on load. Each of those had an obvious alternative.

## Decision

- **One carrier: `<html data-theme="light|dark">`, always set.** The stylesheets have the dark
  values on `:root` and one `:root[data-theme='light']` override block, and **no
  `prefers-color-scheme` block**. A media block would repeat the light block and give two places
  that decide the theme (CSS by the system, JS by the saved choice). JS decides once; the page
  is not playable without it anyway, and if the head script ever fails the fallback is today's
  dark look. Rejected: a CSS-only default by media query plus an attribute for the explicit
  choice.
- **Colours only through tokens.** Every colour is a custom property in `src/styles/theme.css`
  (the UI) or `src/styles/tiles.css` (the tiles, where the tile-palette decision already put
  them); no literal anywhere else, in CSS or in JS. The dark values are exactly the old
  literals (checked: page, badge, `+N` pop and the three dialogs rendered byte-identical at
  1000px and 320px). A component that must differ in one theme re-points tokens in a scoped
  block (the confirmation card), it does not get a literal.
- **The light palette** is warm paper and ink: page `#f4efe6`, ink `#2e2620` (already the tile
  text colour), surfaces `#fffdf8`, a taupe grid `#b9ab98`, a warm brown scrim. The tile colours,
  their text colours and the sheen are shared by both themes; only the tile shadow and the 2048
  glow have light values. The cream tiles need no values of their own and no outline: tile 2 is
  1.89:1 against the light grid and tile 4 is 1.68:1, as on the classic board (1.74 and 1.68).
  Rejected: own light values for 2 and 4 (they would shrink the OKLab spacing to their
  neighbours) and an outline on them. If they ever look too soft, a deeper `--grid-bg` is the
  one lever.
- **One accent token for the gold text.** `--accent` is `#ffd700` in the dark theme and
  `#9a6b00` in the light one: 4.61:1 on the surface, which covers the 14 to 18px bold `+N` pop
  (4.5 needed) and the score digits. Rejected: two tokens with a livelier `#b58400` for the
  digits (3.30:1, large bold text only). The logo and the `New record!` badge are gold tiles
  with dark text (7.4 to 8.96:1) and keep their gold in both themes; only their shadows turn
  from black or yellow to warm brown.
- **The confirmation dialog follows the theme; the win and game-over cards do not.** In the
  light theme the confirmation is a light card with ink text, a dark primary button and an
  ink-outlined secondary one (all contrasts 9 to 14.6:1). Win and game over are coloured cards
  with white text and stay as they are; only the scrim and the shadow change. Rejected: leaving
  the confirmation a dark card (fewer tokens, but the one neutral dialog would ignore the
  theme).
- **The head script is the one direct read of `localStorage`.** It is a classic inline
  `<script>` in `<head>` before the module script, in an IIFE: it reads the saved choice inside
  `try/catch` (blocked storage still gets the system theme), falls back to
  `matchMedia('(prefers-color-scheme: light)')`, and sets the attribute before anything paints.
  It cannot import `SafeStorage`, so it reads storage itself. It only reads. **The key is a
  literal `'theme'` in the script, with a comment pointing at `STORAGE_KEYS.THEME`, and a
  comment next to the constant pointing back.** A Vite plugin that substituted the key from
  `constants.js` was proposed and declined by the author: simplicity over a build step for one
  string. If the constant is renamed and the script forgotten, the page paints the wrong theme
  for one frame and `ThemeController` corrects it, so it degrades into a flash, not a break.
  The exception is written down in `ai/rules/oop.md`, `ai/skills/feature.md` and `ai/map.md`,
  and is not a precedent.
- **Two classes own the rest.** `ThemeController` (state, `SafeStorage`, the system query) and
  `ThemeView` (the attribute, the button, `theme-color`). `GameController` is not touched. After
  load the controller is the authority: it resolves the theme by the same rule as the script and
  renders it, so the script is only a pre-paint accelerator.
- **Behaviour the author confirmed.** The system theme is followed live while no choice is saved
  (an instant change, no circle); the switch has two states and no way back to "follow the
  system" short of clearing site data; the toggle's `aria-label` and `title` name the action
  (`Switch to light theme`) and it has no `aria-pressed`; the sun is shown in the dark theme and
  the moon in the light one (the icon is the theme it switches to), both in the markup and shown
  by CSS so the right one is there at the first paint.
- **`theme-color`.** Two static metas, one per `prefers-color-scheme`, so the system case is
  right from the first parse; `ThemeView.render` then writes the `--page-bg` of the theme in
  force into both, read with `getComputedStyle`, so no JS file repeats a hex value. The two
  values in the HTML must equal the two `--page-bg` values (HTML cannot read CSS). When the saved
  choice differs from the system, the bar shows the system colour until `main.js` runs; the
  author left that as it is rather than put hex values into the head script.
- **`color-scheme`** is set with the tokens, so scrollbars follow the theme, and every colour the
  browser used to choose (the dialog button text, the default `ButtonText`) is now an explicit
  token.

## Consequences

- A new colour is a token with a dark and a light value (or a deliberate "same in both") and a
  contrast check in both themes; the review skill greps for literals.
- A third theme would be one more override block and a wider `THEMES`; nothing in the
  components changes.
- The favicon keeps its own colours and is not themed. Two tabs do not sync a change; the next
  load reads the saved choice.
- In the Vite dev server the page has no stylesheet link (the CSS is imported by `main.js`), so
  the first frame is unstyled before `main.js` runs, in any theme; the attribute is right from
  the first frame and no frame shows the wrong theme. The production build has a render-blocking
  `<link>`, so no frame is unstyled there. Checked with a per-frame sampler, cache off and added
  latency.
- Not changed, found on the way: the 18px paragraph on the win card is white on the light end of
  its gradient, 3.66:1, under 4.5. It is the same in both themes and was left for another issue.
- Verified in Chrome only (headless 154). Safari and Firefox were not available.
- Rejected: a Vite plugin for the key; colour literals in the head script or in JS (the address
  bar reads a token); a `prefers-color-scheme` block in the stylesheets; keeping the theme in
  `GameController`; a three-state (system, light, dark) switch.
