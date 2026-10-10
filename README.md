# 2048 Game

[![CI](https://github.com/serlisovyk/2048/actions/workflows/ci.yml/badge.svg)](https://github.com/serlisovyk/2048/actions/workflows/ci.yml)

🎮 Responsive 2048 browser game built with HTML, modular CSS, vanilla
JavaScript, and Vite.

This project implements the classic 2048 puzzle as a compact static web game.
The source stays intentionally small and framework-free, but keeps production
habits from larger projects: a Vite build pipeline, modular CSS, hashed assets,
HTML/CSS/JavaScript minification, autoprefixing, linting, a bundle size budget,
CI on GitHub Actions, and a clear AI-agent rule set for future maintenance.

## ✨ Features

- Classic 4x4 2048 gameplay
- Keyboard controls for desktop: arrow keys or WASD, on any keyboard layout
- Swipe controls for touch screens: a swipe works anywhere on the board area, with
  no pull-to-refresh and no double-tap zoom
- Current score and persisted high score; a small icon next to the high score resets it
  after a confirmation (the current game is not affected)
- The game in progress is saved in the browser and restored after a reload
- Win dialog: keep playing or start a new game (`Escape` keeps playing)
- Game-over dialog when no moves remain; if the same move reaches 2048, it says so
- `New Game` in the middle of a game asks for confirmation first (`Cancel` is focused,
  `Escape` cancels and focus returns to the button); a fresh or finished game starts
  over at once
- Dialogs are native `<dialog>` modals: the page behind is dimmed and inert, `Tab`
  stays inside, and focus returns to the board when the win and game-over dialogs close
- Responsive layout for desktop, tablet, and small mobile screens, clear of notches
  and home indicators
- Generated board cells controlled by one `BOARD_SIZE` constant
- SVG favicon based on a compact 2x2 2048 board
- Basic metadata and Open Graph title/description
- Reduced-motion support for users who prefer less animation
- Vite production build with HTML, CSS, and JavaScript minification
- Autoprefixer for CSS vendor prefixes
- Bundle size budget checked with size-limit
- CI on GitHub Actions

## 🧰 Tech Stack

- HTML
- CSS
- JavaScript
- Vite
- PostCSS
- Autoprefixer
- Terser
- ESLint
- Prettier
- Husky
- lint-staged
- size-limit
- GitHub Actions
- Yarn

## 📁 Project Structure

```text
src/
  index.html             Main page markup and Vite entry
  favicon.svg            Source favicon
  scripts/
    main.js              Composition root: finds DOM elements, wires the objects
    constants.js         Board size, win tile, timings, storage keys
    GameController.js    Movement guard, win pause, high score, saved game
    game/                Model: Board and Game (rules, no DOM)
    ui/                  Views: grid, score, dialogs
    input/               Keyboard and swipe input
    storage/             Safe localStorage wrapper (numbers and JSON)
  styles/
    main.css             CSS entry imported by main.js
    base.css             Reset and base element styles
    layout.css           Page, score, and responsive layout
    board.css            Board, cells, and tile animations
    tiles.css            Tile value colors and text sizing
    overlays.css         Win, game-over, and confirmation dialogs
    controls.css         Button styles
    motion.css           Reduced-motion preferences
ai/                  AI-agent docs: repo map, workflow, rules, decisions, skills, templates
AGENTS.md            AI-agent entry instructions
CLAUDE.md            Claude Code entrypoint, points to AGENTS.md
vite.config.js       Vite production build configuration
postcss.config.js    PostCSS and Autoprefixer configuration
eslint.config.js     ESLint flat config, including OOP rules
.lintstagedrc.json   Pre-commit checks for staged files
.husky/              Git hooks installed by yarn install
.size-limit.json     Bundle size budget for dist/
.github/             CI workflow
dist/                Generated production output
```

## 🚀 Scripts

Install dependencies (also installs the pre-commit hook that lints and formats
staged files):

```bash
yarn install
```

Run the local development server:

```bash
yarn dev
```

Build the production version:

```bash
yarn build
```

Preview the production build locally:

```bash
yarn preview
```

Lint code:

```bash
yarn lint
```

Fix lint issues that can be fixed automatically:

```bash
yarn lint:fix
```

Format code:

```bash
yarn format
```

Check formatting:

```bash
yarn format:check
```

Check the bundle size against its budget (run after `yarn build`):

```bash
yarn size
```

CI runs `lint`, `format:check`, `build`, and `size` on every push.

## 🧱 Architecture Notes

- All sources live in `src/`; Vite builds with `root: 'src'` into `dist/`.
- `index.html` owns the static page shell, basic metadata, favicon, and Vite
  entry point while leaving board cells to JavaScript.
- The JavaScript is object-oriented: the model (`Board`, `Game`) holds the rules
  without touching the DOM, views render, input classes turn keys and swipes into
  directions, and `GameController` connects them. `main.js` wires everything.
- Grid cells and the CSS grid are generated from `BOARD_SIZE`, so the board
  structure is not duplicated in HTML or CSS.
- The win, game-over, and confirmation dialogs are native `<dialog>` elements opened
  with `showModal()`, so the browser provides the backdrop, the inert page, and the
  focus trap; there is no hand-made overlay code. The confirmation is one shared view
  that answers a Promise, so every "are you sure?" reuses it.
- Keyboard and pointer input share the same movement guard to keep moving,
  paused, and game-over states consistent.
- CSS is split by responsibility rather than by page because the project has
  one screen.
- Motion preferences live in `src/styles/motion.css` so accessibility-related
  animation rules stay visible and easy to adjust.
- Vite owns production optimization: hashed assets, minified HTML, minified CSS,
  and minified JavaScript for its default `baseline-widely-available` browser
  target — no legacy chunks.
- The project is kept proportional to its size: improvements should favor
  clarity, accessibility, responsive gameplay, and build quality over framework
  complexity.
