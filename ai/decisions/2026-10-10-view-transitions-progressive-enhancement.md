# The theme reveal is a View Transition, a progressive enhancement over an instant switch

Date: 2026-10-10 · Status: accepted

## Context

The theme switch (MY-123) should look good: the new theme spreads from the toggle button as a
circle. The platform tool for that is `document.startViewTransition`. Same-document View
Transitions are newer than the "widely available" baseline that Vite's default build target
stands for (`2026-10-10-no-legacy-plugin.md`), so the game cannot assume them, and
`prefers-reduced-motion` must still get the switch without any motion.

## Decision

- **The instant switch is the base behaviour; the circle is added where it can run.**
  `ThemeView.transitionTo(theme)` feature-detects `document.startViewTransition` and checks a
  `prefers-reduced-motion: reduce` query (a constructor dependency). If the API is missing or
  motion is reduced it calls the plain `render(theme)` at once: no animation, no error, no
  snapshot taken. No polyfill.
- **The animation is CSS.** `theme.css` holds `::view-transition-old(root)` and
  `::view-transition-new(root)` (the UA cross-fade turned off) and a `theme-reveal` keyframes
  that grows `clip-path: circle()` on the new view, with its length in
  `--theme-reveal-duration` (500ms). JS holds no timer and no copy of the duration. Rejected:
  driving the pseudo-elements with the Web Animations API from JS.
- **The circle's numbers are custom properties.** Before starting, the view writes the toggle
  button's centre and the distance to the farthest window corner as `--theme-reveal-x`,
  `--theme-reveal-y` and `--theme-reveal-radius` on `<html>`: the one allowed kind of inline
  style (`2026-10-10-css-custom-properties-from-js.md`). They come from the button's rectangle,
  not the click event, so a keyboard activation starts from the same place.
- **Reduced motion is handled in JS, not in `motion.css`.** The global reduced-motion rule
  (`*, *::before, *::after, ::backdrop`) does not match view-transition pseudo-elements, and
  making them 0.01ms would still take a snapshot and cover the page with the transition overlay
  for a frame. Skipping the transition is simpler and exact.
- **Only a player's click animates.** A system-driven change of the theme (the OS switches
  while no choice is saved) renders instantly: nobody clicked anything to be the origin.
- **Quick repeats.** A transition replaced by a newer one rejects its `ready` promise; the view
  catches it. Each update callback renders its own theme and they run in order, so the last
  switch wins and the saved choice is the last one.

## Consequences

- For about 0.5s the browser sends pointer events to the transition overlay, so a click or a
  swipe that starts then does nothing; keyboard moves keep working, and tiles, the `+N` pop and
  the badge keep animating (the new view is live and `animationend` still fires). Accepted.
- `transition: all` on tiles and buttons fades their colours over 0.1 to 0.3s as the tokens
  change; inside the reveal that is invisible, on the instant path it is a short fade of those
  elements only. Left alone.
- Checked in headless Chrome 154: the reveal runs and finishes at 1000px and 320px, from the
  button's centre; reduced motion and a browser without the API (deleted before load) switch
  synchronously with no console error; two and three quick toggles end on the right theme with
  no unhandled rejection; a move and a `+N` pop during the reveal are unaffected; a
  system-driven change with a dialog open updates the dialog and its backdrop. Not checked:
  Safari and Firefox.
- Another flourish that depends on a newer browser API follows the same pattern: feature-detect
  it in the view, keep the instant path as the base, pass numbers as custom properties.
- Rejected: an always-on animation behind a polyfill (bytes and a dependency for a flourish);
  the Web Animations API from JS; starting the circle at the pointer position (a key press has
  none); keeping a state-only label and `aria-pressed` on the toggle.
