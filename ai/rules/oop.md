# OOP Rules

The project is object-oriented. These rules apply to every JavaScript file in
`src/scripts/`. Why: `ai/decisions/2026-10-10-oop-architecture.md`.

## Files and modules

- One class per file, the file named after the class in PascalCase: `Board.js`
  exports `Board`.
- The only non-class modules are `main.js` (composition root) and `constants.js`;
  they use camelCase file names.
- Named exports only, no default exports.
- Folders by responsibility: `game/` (model), `ui/` (views), `input/`, `storage/`.
  `GameController.js` sits in the `scripts/` root.

## Encapsulation

- State lives in private fields (`#field`). Helpers that are not part of the public
  API are private methods (`#method`). No public mutable fields.
- Expose state through getters or methods. Never hand out an internal array or
  object — return a copy (`Board.toArray()`).
- Constants are module exports; lookup objects are wrapped in `Object.freeze`.

## Responsibilities

Each class has one reason to change:

| Layer                        | Owns                                              | Must not                           |
| ---------------------------- | ------------------------------------------------- | ---------------------------------- |
| Model (`game/`)              | Rules and game state                              | Touch the DOM, storage, or timers  |
| Views (`ui/`)                | Their DOM elements and how data looks             | Contain game rules or read storage |
| Input (`input/`)             | Turning DOM events into directions                | Decide whether a move is allowed   |
| Storage (`storage/`)         | Persistence behind an API that never throws       | Know about the game                |
| Controller                   | Use cases and flow state (guards, pauses)         | Query the DOM or render directly   |
| Composition root (`main.js`) | Finding DOM elements, creating and wiring objects | Hold game logic                    |

- The model reports results instead of reaching into other objects: `Game.move()`
  returns `{ moved, scoreGained, spawnedTiles, justWon, isOver }`, and the controller
  decides what to render.
- Randomness lives only in tile spawning.
- All reading and writing of `localStorage` goes through `SafeStorage`. The one exception is
  the inline script in the `<head>` of `index.html` that applies the saved theme before the
  first paint: it runs before any module exists, so it cannot import the class. It only
  reads, inside `try/catch`, with the key as a literal that has a comment pointing at
  `STORAGE_KEYS.THEME` (and a comment there pointing back). It is not a precedent: any other
  early read needs its own decision record
  (`ai/decisions/2026-10-10-theme-tokens-and-head-script.md`).

## Dependencies

- Every dependency comes in through the constructor: DOM elements, other objects,
  callbacks. Use an options object when there are three or more.
- `document.querySelector` and wiring with `new` happen only in `main.js`. Views may
  create their own child elements (e.g. grid cells).
- Views expose user actions as `on<Action>(handler)` methods; input classes take an
  `onDirection` callback. No global event buses or singletons.

## Design

- Composition over inheritance. No class hierarchies, abstract base classes,
  factories, or DI containers until a second real implementation needs them.
- Pure helpers that belong to one class are private static methods
  (`static #slideLine`).
- DOM event handlers that need `this` are private arrow-function fields
  (`#handleKeydown = (event) => { … }`), so they keep their binding and can be
  removed later.
- Methods do one thing and stay short; split a method rather than comment its parts.

## Naming

- Classes: PascalCase nouns (`GridView`, `SafeStorage`).
- Methods: camelCase verbs (`render`, `requestMove`, `spawnRandomTile`).
- Booleans: `is` / `has` prefix (`isOver`, `hasAvailableMoves`).
- Constants: `UPPER_SNAKE_CASE`.
