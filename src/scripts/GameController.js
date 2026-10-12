import {
  LEGACY_BOARD_SIZE,
  LEGACY_SAVED_GAME_VERSION,
  SAVED_GAME_VERSION,
  SETTING_NAMES,
  STORAGE_KEYS,
} from './constants.js'

export class GameController {
  static #NEW_GAME_PROMPT = Object.freeze({
    title: 'Start a new game?',
    message: 'Your current progress will be lost.',
    confirmLabel: 'New Game',
  })

  static #RESET_HIGH_SCORE_PROMPT = Object.freeze({
    title: 'Reset the high score?',
    message: 'It will be set back to 0. Your current game is not affected.',
    confirmLabel: 'Reset',
  })

  #game
  #gridView
  #scoreView
  #overlayView
  #confirmDialogView
  #settings
  #storage
  #highScore = 0
  #hasRecordToBeat = false
  #isPausedAfterWin = false

  constructor({
    game,
    gridView,
    scoreView,
    overlayView,
    confirmDialogView,
    settings,
    storage,
  }) {
    this.#game = game
    this.#gridView = gridView
    this.#scoreView = scoreView
    this.#overlayView = overlayView
    this.#confirmDialogView = confirmDialogView
    this.#settings = settings
    this.#storage = storage
  }

  get isInProgress() {
    return this.#game.isInProgress
  }

  start() {
    this.#highScore = this.#storage.getNumber(STORAGE_KEYS.HIGH_SCORE)
    this.#scoreView.renderHighScore(this.#highScore)

    if (!this.#restoreSavedGame()) this.#startNewGame()
  }

  async requestNewGame() {
    if (!this.#game.isInProgress) {
      this.restart()

      return
    }

    if (!(await this.#confirm(GameController.#NEW_GAME_PROMPT))) return

    this.restart()
    this.returnFocusToBoard()
  }

  async requestResetHighScore() {
    if (this.#highScore === 0) return

    if (!(await this.#confirm(GameController.#RESET_HIGH_SCORE_PROMPT))) return

    this.#resetHighScore()
    this.returnFocusToBoard()
  }

  restart() {
    this.#isPausedAfterWin = false
    this.#overlayView.hideAll()
    this.#startNewGame()
  }

  continueAfterWin() {
    this.#isPausedAfterWin = false
    this.#overlayView.hideWin()
  }

  returnFocusToBoard() {
    this.#gridView.focus()
  }

  requestMove(direction) {
    if (this.#isPausedAfterWin || this.#game.isOver) return

    const result = this.#game.move(direction)

    if (!result.moved) return

    this.#renderScore()
    this.#scoreView.showScoreGain(result.scoreGained)
    this.#gridView.animateMove(result)

    if (result.isOver) {
      this.#overlayView.showGameOver({ justWon: result.justWon })
    } else if (result.justWon) {
      this.#isPausedAfterWin = true
      this.#overlayView.showWin()
    }

    this.#persistGame()
  }

  // "No" puts focus back where the question came from, the board if that is gone;
  // the caller moves it to the board after a "yes".
  async #confirm(prompt) {
    const isConfirmed = await this.#confirmDialogView.ask(prompt)

    if (!isConfirmed && !this.#confirmDialogView.restoreFocus()) {
      this.returnFocusToBoard()
    }

    return isConfirmed
  }

  #startNewGame() {
    this.#clearSavedGame()

    const { spawnedTiles } = this.#game.start(
      this.#settings.get(SETTING_NAMES.BOARD_SIZE),
    )

    this.#showBoardSize()
    this.#hasRecordToBeat = this.#highScore > 0
    this.#scoreView.hideNewRecord()
    this.#renderScore()
    this.#gridView.render(this.#game.tiles, spawnedTiles)
  }

  // A save is the game the player was in the middle of, so it wins over a setting that
  // disagrees with it (a cleared or damaged `settings` key, another tab): the game is
  // restored at its own size and the setting follows it, in memory only.
  #restoreSavedGame() {
    const saved = GameController.#readSavedGame(
      this.#storage.getJson(STORAGE_KEYS.SAVED_GAME),
    )

    if (!saved || !this.#game.restore(saved)) return false

    this.#settings.set(SETTING_NAMES.BOARD_SIZE, this.#game.size)
    this.#showBoardSize()
    this.#hasRecordToBeat = this.#game.score < this.#highScore
    this.#renderScore()
    this.#gridView.render(this.#game.tiles)

    return true
  }

  #showBoardSize() {
    this.#gridView.resize(this.#game.size)
  }

  #persistGame() {
    if (this.#game.isOver) {
      this.#clearSavedGame()

      return
    }

    this.#storage.setJson(STORAGE_KEYS.SAVED_GAME, {
      version: SAVED_GAME_VERSION,
      ...this.#game.toState(),
    })
  }

  #clearSavedGame() {
    this.#storage.remove(STORAGE_KEYS.SAVED_GAME)
  }

  #resetHighScore() {
    this.#highScore = 0
    this.#hasRecordToBeat = false
    this.#scoreView.hideNewRecord()
    this.#scoreView.renderHighScore(0)
    this.#storage.setValue(STORAGE_KEYS.HIGH_SCORE, 0)
  }

  #renderScore() {
    const score = this.#game.score

    this.#scoreView.renderScore(score)

    if (score <= this.#highScore) return

    if (this.#hasRecordToBeat) {
      this.#hasRecordToBeat = false
      this.#scoreView.showNewRecord()
    }

    this.#highScore = score
    this.#scoreView.renderHighScore(score)
    this.#storage.setValue(STORAGE_KEYS.HIGH_SCORE, score)
  }

  // The saved game as the current version reads it: a version 1 save has no size, it was
  // always the classic board. Anything else is no save; the model validates the rest.
  static #readSavedGame(saved) {
    if (saved?.version === SAVED_GAME_VERSION) return saved

    if (saved?.version === LEGACY_SAVED_GAME_VERSION) {
      return { ...saved, size: LEGACY_BOARD_SIZE }
    }

    return null
  }
}
