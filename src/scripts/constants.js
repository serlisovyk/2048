export const BOARD_SIZE = 4
export const WIN_TILE = 2048

export const SWIPE_THRESHOLD_PX = 30
export const FOUR_TILE_PROBABILITY = 0.1

export const MOVE_COOLDOWN_MS = 100
export const SCORE_ANNOUNCEMENT_DELAY_MS = 500
export const TILE_ANIMATION_MS = 200
export const ANIMATION_CLEANUP_MS = TILE_ANIMATION_MS + 50

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
  HIGH_SCORE: 'highScore',
  SAVED_GAME: 'savedGame',
  // The inline script in index.html reads this key by its literal, before any module runs.
  THEME: 'theme',
})

export const THEMES = Object.freeze({
  LIGHT: 'light',
  DARK: 'dark',
})

export const SAVED_GAME_VERSION = 1
