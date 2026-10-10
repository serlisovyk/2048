# Architecture Rules

All sources live in `src/`; Vite builds with `root: 'src'` into `dist/` at the repo
root. The JavaScript is object-oriented — see `ai/rules/oop.md` for the class
conventions. `ai/map.md` lists every file.

## File Responsibilities

- `src/index.html` owns the page markup, landmarks, metadata, favicon link, and the
  Vite entry script (`./scripts/main.js`).
- `src/favicon.svg` is the only image; Vite hashes it into `dist/assets/`.
- `src/scripts/main.js` is the composition root: imports the styles, finds the DOM
  elements, creates and wires the objects, starts the game.
- `src/scripts/constants.js` holds every shared number and key.
- `src/scripts/GameController.js` owns the use cases and flow state: the single
  movement guard, the move cooldown, the pause after a win, the high score, and
  saving and restoring the current game.
- `src/scripts/game/` is the model (`Board`, `Game`): rules and game state, no DOM,
  no storage, no timers.
- `src/scripts/ui/` holds the views (`GridView`, `ScoreView`, `OverlayView`): they
  own their elements and render what they are given.
- `src/scripts/input/` turns keyboard and pointer events into directions
  (`KeyboardInput`, `SwipeInput`).
- `src/scripts/storage/SafeStorage.js` wraps `localStorage` and never throws.
- `src/styles/main.css` is the single CSS entry, imported by `main.js`; the other
  files in `src/styles/` are split by responsibility (see `ai/map.md`).
- `vite.config.js` owns production build behavior: `root`, output, minification
  (terser, `drop_console`), and HTML optimization.
- `dist/` is generated output. Do not edit it manually.

## Game Structure

- Keep the board size controlled by `BOARD_SIZE`; CSS gets it as `--board-size`.
- Generate grid cells from JavaScript instead of duplicating board structure in
  HTML.
- Keep keyboard and pointer input routed through `GameController.requestMove` so
  paused, moving, and game-over states stay consistent.

## Boundaries

- Do not move styles into inline attributes. The one exception: a view may set CSS
  custom properties that pass numbers from `constants.js` to CSS.
- Do not move interaction logic into HTML event handlers.
- Do not add React, Vue, Angular, or another UI framework.
- Do not rename existing CSS classes only for cosmetic reasons; class names are part
  of the local styling contract.
