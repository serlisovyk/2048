export const BOARD_SIZES = Object.freeze([3, 4, 5])

// The win tile choices of each board size, ascending. A size is a different game: 2048 is
// out of reach on 3x3 and soon reached on 5x5.
export const WIN_TILES = Object.freeze({
  3: Object.freeze([256, 512, 1024]),
  4: Object.freeze([1024, 2048, 4096]),
  5: Object.freeze([2048, 4096, 8192]),
})

// The middle choice is the default of a size and the one a size change goes back to.
export const MIDDLE_CHOICE_INDEX = 1

export const SWIPE_THRESHOLD_PX = 30
export const FOUR_TILE_PROBABILITY = 0.1

export const SCORE_ANNOUNCEMENT_DELAY_MS = 500
export const TILE_SLIDE_MS = 110
export const TILE_POP_MS = 100
export const TILE_CLEANUP_MS = TILE_SLIDE_MS + 2 * TILE_POP_MS + 50

export const DIRECTIONS = Object.freeze({
  UP: 'up',
  DOWN: 'down',
  LEFT: 'left',
  RIGHT: 'right',
})

export const KEY_CODE_DIRECTIONS = Object.freeze({
  ArrowUp: DIRECTIONS.UP,
  ArrowDown: DIRECTIONS.DOWN,
  ArrowLeft: DIRECTIONS.LEFT,
  ArrowRight: DIRECTIONS.RIGHT,
  KeyW: DIRECTIONS.UP,
  KeyS: DIRECTIONS.DOWN,
  KeyA: DIRECTIONS.LEFT,
  KeyD: DIRECTIONS.RIGHT,
})

export const STORAGE_KEYS = Object.freeze({
  // The record of each board size: this prefix and `<size>x<size>`, e.g. `highScore4x4`.
  HIGH_SCORE_PREFIX: 'highScore',
  // The one record there was before the sizes; it moves to the key of its size on start.
  LEGACY_HIGH_SCORE: 'highScore',
  SAVED_GAME: 'savedGame',
  SETTINGS: 'settings',
  // The inline script in index.html reads this key by its literal, before any module runs.
  THEME: 'theme',
})

export const THEMES = Object.freeze({
  LIGHT: 'light',
  DARK: 'dark',
})

export const SAVED_GAME_VERSION = 3

// Before the board size became a setting there was one size, the classic one: version 1
// saves have no `size` and the one record (`STORAGE_KEYS.LEGACY_HIGH_SCORE`) belongs to it.
export const LEGACY_BOARD_SIZE = 4

export const SETTINGS_VERSION = 1

export const SETTING_NAMES = Object.freeze({
  // The inputs of the settings dialog are named after these (`name` in index.html).
  BOARD_SIZE: 'boardSize',
  WIN_TILE: 'winTile',
})

// One entry per setting, name -> { defaultValue, allowedValues }, a setting after the one
// it depends on. A setting that `dependsOn` another has no default of its own: its choices
// are `allowedValues[value of the other]` and it starts from the middle one, again each
// time the other one changes.
export const SETTING_DEFINITIONS = Object.freeze({
  [SETTING_NAMES.BOARD_SIZE]: { defaultValue: 4, allowedValues: BOARD_SIZES },
  [SETTING_NAMES.WIN_TILE]: {
    dependsOn: SETTING_NAMES.BOARD_SIZE,
    allowedValues: WIN_TILES,
  },
})
