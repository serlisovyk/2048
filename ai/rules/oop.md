# OOP Rules

The project is object-oriented. These rules apply to every JavaScript file in
`src/scripts/`. Why: `ai/decisions/2026-10-10-oop-architecture.md`.

## Files and modules

- One class per file, the file named after the class in PascalCase: `Board.js`
  exports `Board`.
- The only non-class modules are `main.js` (composition root), `constants.js` and
  `themeHead.js` (the theme script inlined into `<head>`); they use camelCase file names.
- Named exports only, no default exports.
- Folders by responsibility: `game/` (model), `ui/` (views), `input/`, `storage/`,
  `controllers/`.

## Encapsulation

- State lives in private fields (`#field`). Helpers that are not part of the public
  API are private methods (`#method`). No public mutable fields.
- Expose state through getters or methods. Never hand out an internal array or
  object — return a copy (`Board.toArray()`).
- Constants are module exports; lookup objects are wrapped in `Object.freeze`.

## Responsibilities

Each class has one reason to change:

| Layer                        | Owns                                                | Must not                           |
| ---------------------------- | --------------------------------------------------- | ---------------------------------- |
| Model (`game/`)              | Rules and game state                                | Touch the DOM, storage, or timers  |
| Views (`ui/`)                | Their DOM elements and how data looks               | Contain game rules or read storage |
| Input (`input/`)             | Turning DOM events into directions                  | Decide whether a move is allowed   |
| Storage (`storage/`)         | Persistence behind an API that never throws         | Know about the game                |
| Controllers (`controllers/`) | One role each: use cases, flow state, what is saved | Query the DOM or render directly   |
| Composition root (`main.js`) | Finding DOM elements, creating and wiring objects   | Hold game logic                    |

- The model reports results instead of reaching into other objects: `Game.move()`
  returns what happened (every tile has an id, so a view can animate what moved), and the
  controller decides what to render.
- Randomness lives only in tile spawning.
- All reading and writing of `localStorage` goes through `SafeStorage`. The one exception is
  the theme script (`themeHead.js`, inlined into `<head>` by a build plugin): it runs before
  any module exists, so it is a plain script with no imports that only reads, inside
  `try/catch`. Its key `'theme'` and values `'light'` / `'dark'` are literals, the same as
  `STORAGE_KEYS.THEME` and `THEMES` in `constants.js`: **change the key or a theme value in
  both places.** It is not a precedent: any other early read needs its own decision record
  (`ai/decisions/2026-10-14-theme-head-script-html-plugin.md`).

## Dependencies

- Every dependency comes in through the constructor: DOM elements, other objects,
  callbacks. Views, inputs and controllers take one options object (`{ element, … }`);
  only a plain value class takes its value (`Board(size)`).
- `document.querySelector` and wiring with `new` happen only in `main.js`. Views may
  create their own child elements (e.g. grid cells).
- No global event buses or singletons.

## Views and inputs: one vocabulary

- `render*` puts state into the DOM (`renderScore`, `GridView.render`).
- `show*` / `hide*` is a transient decoration (`showScoreGain`, `showNewRecord`).
- `open*` / `close*` is a native `<dialog>` (`openWin`, `closeAll`, `SettingsView.open`);
  `ConfirmDialogView.ask()` answers a `Promise<boolean>`.
- `focus*` moves focus inside a view (`GridView.focus`, `SettingsView.focusSetting`).
- `on<Action>(handler)` reports a user action of a view. A view attaches the listeners it
  handles itself in its constructor; an input class takes `onDirection` in its options and
  listens after `bind()`.

## Design

- Composition over inheritance. No class hierarchies, abstract base classes,
  factories, or DI containers until a second real implementation needs them.
- Pure helpers that belong to one class are private static methods
  (`static #slideLine`).
- A DOM event handler is a private method, attached through an inline arrow
  (`(event) => this.#handleKeydown(event)`). Only a function that is also removed later is an
  arrow-function field, so the same function is added and removed.
- Methods do one thing and stay short; split a method rather than comment its parts.

## Naming

- Classes: PascalCase nouns (`GridView`, `SafeStorage`).
- Methods: camelCase verbs (`render`, `requestMove`, `spawnRandomTile`).
- Booleans: `is` / `has` / `can` prefix (`isOver`, `hasAvailableMoves`, `canMove`).
- Constants: `UPPER_SNAKE_CASE`.
