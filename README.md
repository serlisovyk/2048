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

- Board sizes 3×3, 4×4 and 5×5 from the settings dialog, with a high score for each
- A win target of your choice, three per board size (4×4: 1024, 2048 or 4096), saved with the game
- Keyboard controls for desktop: arrow keys or WASD, on any keyboard layout
- Swipe controls for touch screens: a swipe works anywhere on the board area, with
  no pull-to-refresh and no double-tap zoom
- A header above the board, as wide as the board: the `2048` logo, the score and the
  persisted high score in two boxes, and a toolbar of icon buttons (inline SVG, each
  with a label and a tooltip). A small icon in the high score box resets it after a
  confirmation (the current game is not affected)
- Tiles slide to their new cell, a merged tile pops, then the new tile pops in (about
  0.3 s in all). Only a real merge pops. A press during an animation finishes it at
  once, so fast presses are never lost; a restored game appears with no animation, and
  with reduced motion the board changes at once
- A short `+N` floats up from the score after a move that merges tiles, one at a time
  and hidden from screen readers; with reduced motion it fades in place without moving
- A gold `New record!` badge on the High Score box when a game beats an existing record,
  once per game and for about 4 seconds (static with reduced motion); a screen reader hears
  it once, inside the score announcement
- Light and dark themes: the page follows the system setting until the sun/moon button in
  the header is used, then the choice is saved; the theme is applied before the first paint
  (no flash), the address bar takes the page colour, and where the browser supports View
  Transitions the new theme spreads from the button as a circle (instant otherwise and with
  reduced motion)
- The game in progress is saved in the browser and restored after a reload
- Win dialog: keep playing or start a new game (`Escape` keeps playing)
- Game-over dialog when no moves remain; if the same move reaches the target, it says so
- The `New Game` icon button in the header, in the middle of a game, asks for
  confirmation first (`Cancel` is focused, `Escape` cancels and focus returns to the
  button); a fresh or finished game starts over at once
- Dialogs are native `<dialog>` modals: the page behind is dimmed and inert, `Tab`
  stays inside, and focus returns to the board when the win and game-over dialogs close
- Responsive layout for desktop, tablet, and small mobile screens, clear of notches
  and home indicators
- Footer with the author's name and year, and a GitHub icon linking to the source
- Game summary (score, moves, highest tile) in the win and game-over dialogs, and all-time statistics with a reset in the settings
- Generated board cells and tiles for any board size
- SVG favicon based on a compact 2x2 2048 board
- Link preview image for social networks (Open Graph, Twitter card)
- Reduced-motion support for users who prefer less animation
- Rubik as the game font, self-hosted (one Latin woff2 from the game's own origin, no
  font CDN), with tabular digits so the score and the tiles keep their width
- Screen reader support: the score is announced after a move (once for a burst of
  fast moves), and every button shows the same clear focus ring for keyboard users
- Vite production build with HTML, CSS, and JavaScript minification
- Autoprefixer for CSS vendor prefixes
- Bundle size budget checked with size-limit (the font has its own budget)
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
  fonts/                 Self-hosted Rubik (Latin woff2)
  scripts/
    main.js              Composition root: finds DOM elements, wires the objects
    constants.js         Board sizes, win tiles, timings, storage keys, settings table
    controllers/         Use cases and flow state: game, high score, saved game, settings, statistics, theme
    game/                Model: Board, Game, Settings and Statistics (rules and values, no DOM)
    ui/                  Views: grid, score, dialogs, settings, theme switch, footer
    input/               Keyboard and swipe input
    storage/             Safe localStorage wrapper (numbers, strings, and JSON)
  styles/
    main.css             CSS entry imported by main.js
    theme.css            Every UI colour as a token for both themes, and the theme reveal
    base.css             Font face, reset, base element styles, the shared button focus ring
    layout.css           Page and responsive layout
    header.css           Header: logo, score boxes, and the icon toolbar
    board.css            Board, background cells, tiles, and tile animations
    tiles.css            Tile colour tokens (both themes) and text sizing
    overlays.css         Win, game-over, confirmation, and settings dialogs
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
.size-limit.json     Bundle and font size budgets for dist/
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
- Grid cells and the CSS grid are generated from the board size, so the board
  structure is not duplicated in HTML or CSS.
- Tiles are their own elements over the grid, placed by `--row` and `--col` through
  CSS, so a resize needs no JavaScript. The model reports each move as slides, merges
  and the new tile, and `GridView` animates exactly that: slide, merge pop, new tile.
- The win, game-over, and confirmation dialogs are native `<dialog>` elements opened
  with `showModal()`, so the browser provides the backdrop, the inert page, and the
  focus trap; there is no hand-made overlay code. The confirmation is one shared view
  that answers a Promise, so every "are you sure?" reuses it.
- The header and the board share one wrapper that is as wide as the board, so the
  header never widens the page. Icons are inline SVG (no icon font or library), and an
  icon-only button always has an `aria-label` and a `title`.
- Every colour is a CSS custom property in `theme.css` (UI) or `tiles.css` (tiles), with
  the dark values on `:root` and the light ones under `[data-theme='light']`; the other
  stylesheets only read tokens. `<html data-theme>` is set by a small inline script in
  `<head>` before the first paint, then owned by `ThemeController` and `ThemeView`. The
  circle reveal is a View Transition, a progressive enhancement over an instant switch.
- Keyboard and pointer input share the same movement guard to keep the paused and
  game-over states consistent.
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
