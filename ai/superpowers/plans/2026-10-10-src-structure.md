# MY-109 — move sources into `src/`, split `script.js` into OOP modules, single-source constants

Issue: MY-109 · Branch: `my-109-src-structure`

Behavior stays 1:1 — this is a move and a split, no new features, no visual changes.
Known bugs (merge pulse on a plain slide, both overlays at once, overlays toggled via
`style.display`) are left as they are; later issues fix them.

## Author's answers (2026-10-10)

1. All JavaScript lives in `src/scripts/`, next to `src/styles/` — folders inside it
   (`game/`, `ui/`, `input/`, `storage/`).
2. JS passing numbers to CSS through custom properties is the one allowed kind of
   inline style.
3. The favicon is the only image — it stays next to `index.html` (`src/favicon.svg`,
   hashed by Vite as today). No `public/` folder until a file needs a stable URL.
4. The project follows OOP: classes with encapsulated state, clear responsibilities,
   dependencies passed in. Recorded as `ai/rules/oop.md` + a decision record, and
   enforced through the Definition of Done and the `review` skill.

## Target layout

```text
index.html            → src/index.html
favicon.svg           → src/favicon.svg
styles/*              → src/styles/* (unchanged except board.css, see "CSS")
script.js             → split into the classes below

src/
  index.html
  favicon.svg
  scripts/
    main.js               composition root: imports styles, finds DOM elements,
                          creates the objects, wires events, starts the game
    constants.js          every shared value (frozen objects)
    GameController.js     flow: movement guard, cooldown, pause after win,
                          high score, talks to the model, views, and storage
    game/
      Board.js            the grid: spawn a tile, move in a direction,
                          has tile, has available moves — no DOM
      Game.js             one game: board, score, won / over state — no DOM
    ui/
      GridView.js         creates the cells, renders values and tile animations
      ScoreView.js        renders score and high score
      OverlayView.js      shows / hides win and game-over overlays, their buttons
    input/
      KeyboardInput.js    arrow keys → direction callback
      SwipeInput.js       pointer swipe on the grid → direction callback
    storage/
      SafeStorage.js      localStorage wrapper that never throws
  styles/                 current CSS modules
```

## Responsibilities

- **Model (`game/`)** is pure: no `document`, `window`, or `localStorage`. Only tile
  spawning is random.
  - `Board` keeps the cells private (`#cells`); exposes `spawnRandomTile()` →
    `{ row, col, value }` or `null`, `move(direction)` → `{ moved, scoreGained }`,
    `hasTile(value)`, `hasAvailableMoves()`, `toArray()` (a copy). The line-slide
    algorithm (was `transform`) is a private static method.
  - `Game` owns a `Board`, the score, `hasWon`, `isOver`; `start()` →
    `{ spawnedTiles }`, `move(direction)` →
    `{ moved, scoreGained, spawnedTiles, justWon, isOver }`.
- **Views (`ui/`)** render what they are given and expose their buttons through
  `on…(handler)` methods. `GridView.render(cells, spawnedTiles)` adds `new-cell`
  itself, so the model never touches the DOM. The existing `merged-cell` rule is kept
  as is (fixed in MY-126).
- **Input (`input/`)** turns keys and swipes into a direction and calls the callback
  it was given — `GameController.requestMove`, still the single movement guard.
- **`SafeStorage`** returns the fallback and ignores writes when `localStorage` is
  blocked or throws. The game starts without errors either way.
- **`GameController`** holds the flow state (`isMoving`, `isPausedAfterWin`, high
  score) and the use cases: `start()`, `restart()`, `requestMove(direction)`,
  `continueAfterWin()`.
- **`main.js`** is the composition root: the only place that queries the DOM and calls
  `new`. Every class gets its dependencies through its constructor.

## Constants (`src/scripts/constants.js`)

| Name                    | Value                         | Was                   |
| ----------------------- | ----------------------------- | --------------------- |
| `BOARD_SIZE`            | `4`                           | `SIZE`                |
| `WIN_TILE`              | `2048`                        | literal               |
| `SWIPE_THRESHOLD_PX`    | `30`                          | `SWIPE_THRESHOLD`     |
| `FOUR_TILE_PROBABILITY` | `0.1`                         | `Math.random() < 0.9` |
| `MOVE_COOLDOWN_MS`      | `100`                         | literal               |
| `TILE_ANIMATION_MS`     | `200`                         | CSS `0.2s` literals   |
| `ANIMATION_CLEANUP_MS`  | `TILE_ANIMATION_MS + 50`      | literal `250`         |
| `DIRECTIONS`            | `{ UP, DOWN, LEFT, RIGHT }`   | `ARROWS_KEYS`         |
| `ARROW_KEY_DIRECTIONS`  | `ArrowUp` → `UP`, …           | `ARROWS_KEYS`         |
| `STORAGE_KEYS`          | `{ HIGH_SCORE: 'highScore' }` | literal               |

The storage key value stays `'highScore'`, so existing records survive the change.

## CSS gets its numbers from JS

`GridView` sets two custom properties on the grid element from the constants:

- `--board-size` → `board.css`: `repeat(var(--board-size, 4), var(--cell-size))` for
  columns and rows (was `repeat(4, …)`);
- `--tile-animation-duration` → `pop-in` and `merge-scale` in `board.css` (was
  `0.2s`), fallback `200ms`.

Set on the grid, not on `:root` — the values belong to the board. This is the one
allowed kind of inline style: JS passes **numbers** to CSS through custom properties,
never visual styling. `ai/rules/style.md` gets that sentence.

## Vite

```js
root: 'src',
publicDir: '../public',
build: { outDir: '../dist', emptyOutDir: true, ...existing options }
```

- `publicDir` points outside `src/` so a future `public/` folder (e.g. the OG image
  in MY-131) sits in the repo root; it does not exist yet.
- PostCSS config stays in the repo root; Vite looks for it upward from `root`.
  Check: the built CSS still has the `-webkit-` prefixes it has today.
- Legacy plugin and `minify-html` unchanged.

## Vercel

Output stays `dist/` at the repo root and the build command stays `yarn build`, so
the Vercel settings should not need changes. Before merging, push the branch and
check the preview deployment.

## Commits

1. `docs: add plan for MY-109 src structure` (this file).
2. `refactor: move index.html, styles and favicon into src/` — Vite config, paths;
   `script.js` moved as-is to `src/scripts/main.js`, so the game works at every
   commit.
3. `refactor: split the game into OOP modules under src/scripts`.
4. `refactor: drive board size and tile animation timing from constants`.
5. `docs: add OOP conventions`.
6. `docs: update README, map, rules and decisions for the src/ structure`.

## Docs

- `README.md` — project structure.
- `ai/map.md` — rewritten for `src/`.
- `ai/rules/oop.md` — new: OOP conventions.
- `ai/rules/architecture.md` — file responsibilities.
- `ai/rules/style.md` — JS organization by class; file naming; the custom-property
  exception.
- `ai/rules/definition-of-done.md`, `ai/skills/review.md`, `ai/skills/feature.md` —
  OOP checks and the layer-to-class mapping.
- `AGENTS.md`, `CLAUDE.md` — `src/` structure, OOP, `ai/rules/oop.md` in Read First.
- `ai/decisions/` — OOP architecture; `index.html` and all sources in `src/` via
  `root: 'src'`; JS → CSS custom properties for shared numbers.

## Verification

- `yarn format:check`, `yarn build`, `yarn preview`.
- Built CSS still autoprefixed; favicon served.
- Play in `yarn dev`: arrows, swipes (mobile width), merges and score, high score
  persists across reload, win at 2048 with `Continue`, game over, `New Game` and
  `Restart Game`.
- `BOARD_SIZE = 5` temporarily: grid and logic both switch to 5x5; set back to 4.
- `localStorage` blocked (override `Storage.prototype.getItem`/`setItem` to throw
  before load): game starts, no console errors.
- `grep -rn "document\|window\|localStorage" src/scripts/game` → nothing.
- Vercel preview deployment of the pushed branch plays.
