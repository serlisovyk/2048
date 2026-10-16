export const BOARD_SIZES = Object.freeze([3, 4, 5])

export const WIN_TILES = Object.freeze({
  3: Object.freeze([256, 512, 1024]),
  4: Object.freeze([1024, 2048, 4096]),
  5: Object.freeze([2048, 4096, 8192]),
})

export const MIDDLE_CHOICE_INDEX = 1

export const SWIPE_THRESHOLD_PX = 30
export const FOUR_TILE_PROBABILITY = 0.1

export const SCORE_ANNOUNCEMENT_DELAY_MS = 500
export const TILE_SLIDE_MS = 110
export const TILE_POP_MS = 100

const TILE_CLEANUP_MARGIN_MS = 50

export const TILE_CLEANUP_MS =
  TILE_SLIDE_MS + 2 * TILE_POP_MS + TILE_CLEANUP_MARGIN_MS

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
  HIGH_SCORE_PREFIX: 'highScore',
  SAVED_GAME: 'savedGame',
  SETTINGS: 'settings',
  STATISTICS: 'statistics',
  THEME: 'theme',
})

export const THEMES = Object.freeze({
  LIGHT: 'light',
  DARK: 'dark',
})

export const SAVED_GAME_VERSION = 4

export const SETTINGS_VERSION = 1

export const STATISTICS_VERSION = 1

export const SETTING_NAMES = Object.freeze({
  BOARD_SIZE: 'boardSize',
  WIN_TILE: 'winTile',
})

export const SETTING_DEFINITIONS = Object.freeze({
  [SETTING_NAMES.BOARD_SIZE]: Object.freeze({
    defaultValue: 4,
    allowedValues: BOARD_SIZES,
  }),
  [SETTING_NAMES.WIN_TILE]: Object.freeze({
    dependsOn: SETTING_NAMES.BOARD_SIZE,
    allowedValues: WIN_TILES,
  }),
})
