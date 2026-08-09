# 2048 Game

🎮 Responsive 2048 browser game built with HTML, modular CSS, vanilla
JavaScript, and Vite.

This project implements the classic 2048 puzzle as a compact static web game.
The source stays intentionally small and framework-free, but keeps production
habits from larger projects: a Vite build pipeline, modular CSS, hashed assets,
HTML/CSS/JavaScript minification, autoprefixing, legacy browser chunks, and a
clear AI-agent rule set for future maintenance.

## ✨ Features

- Classic 4x4 2048 gameplay
- Keyboard controls for desktop
- Swipe controls for touch screens
- Current score and persisted high score
- Win dialog with continue-playing flow
- Game-over dialog when no moves remain
- Responsive layout for desktop, tablet, and small mobile screens
- Generated board cells controlled by one `SIZE` constant
- SVG favicon based on the 2048 tile style
- Vite production build with HTML, CSS, and JavaScript minification
- Autoprefixer and legacy browser chunks through the Vite legacy plugin

## 🧰 Tech Stack

- HTML
- CSS
- JavaScript
- Vite
- PostCSS
- Autoprefixer
- Terser
- Prettier
- Yarn

## 📁 Project Structure

```text
index.html           Main page markup and Vite entry
script.js            Game state, rendering, movement, and input handling
favicon.svg          Source favicon
styles/
  main.css           CSS entry imported by script.js
  base.css           Reset and base element styles
  layout.css         Page, score, and responsive layout
  board.css          Board, cells, and tile animations
  tiles.css          Tile value colors and text sizing
  overlays.css       Win and game-over dialogs
  controls.css       Button styles
rules/               AI-agent project rules
AGENTS.md            AI-agent entry instructions
vite.config.js       Vite production build configuration
postcss.config.js    PostCSS and Autoprefixer configuration
dist/                Generated production output
```

## 🚀 Scripts

Install dependencies:

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

Format code:

```bash
yarn format
```

Check formatting:

```bash
yarn format:check
```

## 🧱 Architecture Notes

- `index.html` owns the static page shell and leaves board cells to JavaScript.
- `script.js` stays as one vanilla JavaScript module because the game logic is
  still small enough to understand in one file.
- Grid cells are generated from `SIZE` so the board structure is not duplicated
  in HTML.
- Keyboard and pointer input share the same movement guard to keep moving,
  paused, and game-over states consistent.
- CSS is split by responsibility rather than by page because the project has
  one screen.
- Vite owns production optimization: hashed assets, minified HTML, minified CSS,
  minified JavaScript, and legacy chunks.
- The project is kept proportional to its size: improvements should favor
  clarity, accessibility, responsive gameplay, and build quality over framework
  complexity.
