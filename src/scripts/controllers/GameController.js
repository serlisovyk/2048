import { SAVED_GAME_VERSION, SETTING_NAMES, STORAGE_KEYS } from '../constants.js'

export class GameController {
  static #NEW_GAME_PROMPT = Object.freeze({
    title: 'Start a new game?',
    message: 'Your current progress will be lost.',
    confirmLabel: 'New Game',
  })

  static #RESET_HIGH_SCORE_PROMPT = Object.freeze({
    title: 'Reset the high score?',
    message:
      'The high score of this board size will be set back to 0. Other sizes and your current game are not affected.',
    confirmLabel: 'Reset',
  })

  // Brings a saved game to the next version; the key is the version a step starts from, so
  // a new version adds one entry and raises SAVED_GAME_VERSION. Empty while only the
  // current version exists.
  static #SAVE_UPGRADES = Object.freeze({})

  #game
  #gridView
  #scoreView
  #overlayView
  #confirmDialogView
  #settings
  #statisticsController
  #storage
  #highScores = new Map()
  #hasRecordToBeat = false
  #isPausedAfterWin = false

  constructor({
    game,
    gridView,
    scoreView,
    overlayView,
    confirmDialogView,
    settings,
    statisticsController,
    storage,
  }) {
    this.#game = game
    this.#gridView = gridView
    this.#scoreView = scoreView
    this.#overlayView = overlayView
    this.#confirmDialogView = confirmDialogView
    this.#settings = settings
    this.#statisticsController = statisticsController
    this.#storage = storage
  }

  get isInProgress() {
    return this.#game.isInProgress
  }

  start() {
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
    this.#statisticsController.recordMove({
      score: this.#game.score,
      highestTile: this.#game.highestTile,
      justWon: result.justWon,
      isOver: result.isOver,
    })

    if (result.isOver) {
      this.#overlayView.showGameOver({
        justWon: result.justWon,
        winTile: this.#game.winTile,
        summary: this.#getSummary(),
      })
    } else if (result.justWon) {
      this.#isPausedAfterWin = true
      this.#overlayView.showWin({
        winTile: this.#game.winTile,
        summary: this.#getSummary(),
      })
    }

    this.#persistGame()
  }

  // What the win and game-over dialogs say about the game as it stands.
  #getSummary() {
    const { score, moves, highestTile } = this.#game

    return { score, moves, highestTile }
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

  // Every way to a new game ends here (the page button, the dialogs, a changed setting), so
  // this is where a game left after a move is counted as played. A game over has been
  // counted already and a fresh board has had no move.
  #startNewGame() {
    if (this.#game.isInProgress) this.#statisticsController.recordRestart()

    this.#clearSavedGame()

    const { spawnedTiles } = this.#game.start(
      this.#settings.get(SETTING_NAMES.BOARD_SIZE),
      this.#settings.get(SETTING_NAMES.WIN_TILE),
    )

    this.#showBoardSize()
    this.#hasRecordToBeat = this.#highScore > 0
    this.#scoreView.hideNewRecord()
    this.#renderScore()
    this.#gridView.render(this.#game.tiles, spawnedTiles)
  }

  // A save is the game the player was in the middle of, so it wins over a setting that
  // disagrees with it (a cleared or damaged `settings` key, another tab): the game is
  // restored with its own size and win tile and the settings follow, in memory only.
  #restoreSavedGame() {
    const saved = GameController.#readSavedGame(
      this.#storage.getJson(STORAGE_KEYS.SAVED_GAME),
    )

    if (!saved || !this.#game.restore(saved)) return false

    // The size first: a changed size sends the win tile back to its default.
    this.#settings.set(SETTING_NAMES.BOARD_SIZE, this.#game.size)
    this.#settings.set(SETTING_NAMES.WIN_TILE, this.#game.winTile)
    this.#showBoardSize()
    this.#hasRecordToBeat = this.#game.score < this.#highScore
    this.#renderScore()
    this.#gridView.render(this.#game.tiles)

    return true
  }

  // The record of the board on screen. A size's record is read from storage when the size
  // comes on screen and kept for the session, so a record still stands when storage is
  // blocked; the larger of the two is used, as another tab may have set a higher one.
  get #highScore() {
    return this.#highScores.get(this.#game.size) ?? 0
  }

  #showBoardSize() {
    const size = this.#game.size
    const stored = this.#storage.getNumber(GameController.#getHighScoreKey(size))

    this.#gridView.resize(size)
    this.#highScores.set(size, Math.max(this.#highScores.get(size) ?? 0, stored))
    this.#scoreView.renderHighScore(this.#highScore)
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
    this.#hasRecordToBeat = false
    this.#scoreView.hideNewRecord()
    this.#storeHighScore(0)
  }

  #storeHighScore(score) {
    const size = this.#game.size

    this.#highScores.set(size, score)
    this.#scoreView.renderHighScore(score)
    this.#storage.setValue(GameController.#getHighScoreKey(size), score)
  }

  #renderScore() {
    const score = this.#game.score

    this.#scoreView.renderScore(score)

    if (score <= this.#highScore) return

    if (this.#hasRecordToBeat) {
      this.#hasRecordToBeat = false
      this.#scoreView.showNewRecord()
    }

    this.#storeHighScore(score)
  }

  static #getHighScoreKey(size) {
    return `${STORAGE_KEYS.HIGH_SCORE_PREFIX}${size}x${size}`
  }

  // The saved game as the current version reads it: an older one goes through the upgrade
  // steps, one version at a time. A version no step starts from (unknown, or newer than this
  // code) is no save; the model validates the rest.
  static #readSavedGame(saved) {
    let upgraded = saved

    while (
      Number.isInteger(upgraded?.version) &&
      upgraded.version < SAVED_GAME_VERSION
    ) {
      const upgrade = GameController.#SAVE_UPGRADES[upgraded.version]

      if (!upgrade) return null

      upgraded = upgrade(upgraded)
    }

    return upgraded?.version === SAVED_GAME_VERSION ? upgraded : null
  }
}
