# Architecture Rules

## File Responsibilities

- `index.html` owns the page markup, landmarks, favicon link, and Vite entry
  script.
- `script.js` owns game state, board rendering, input handling, score updates,
  and modal behavior.
- `styles/main.css` is the single CSS entry imported by `script.js`.
- `styles/base.css` contains resets and base element styles.
- `styles/layout.css` contains page layout, score layout, and responsive page
  spacing.
- `styles/board.css` contains board, cell, and tile animation structure.
- `styles/tiles.css` contains value-specific tile colors and text sizing.
- `styles/overlays.css` contains win and game-over dialog styles.
- `styles/controls.css` contains button styles.
- `vite.config.js` owns production build behavior: minification, legacy output,
  and HTML optimization.
- `dist/` is generated output. Do not edit it manually.

## Game Structure

- Keep the project as a small vanilla JavaScript game unless the user explicitly
  asks for a larger architecture.
- Keep the board size controlled by `SIZE`.
- Generate grid cells from JavaScript instead of duplicating board structure in
  HTML.
- Keep keyboard and pointer input routed through one movement guard so paused,
  moving, and game-over states stay consistent.

## Boundaries

- Do not move styles into inline attributes.
- Do not move interaction logic into HTML event handlers.
- Do not add React, Vue, Angular, or another UI framework.
- Do not split JavaScript into modules unless the file becomes hard to reason
  about or a clear boundary appears.
- Do not rename existing classes only for cosmetic reasons; class names are part
  of the local styling contract.
