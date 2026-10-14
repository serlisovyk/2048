import { SETTING_NAMES } from '../constants.js'

export class GameController {
  static #NEW_GAME_PROMPT = Object.freeze({
    title: 'Start a new game?',
    message: 'Your current progress will be lost.',
    confirmLabel: 'New game',
  })

  static #RESET_HIGH_SCORE_PROMPT = Object.freeze({
    title: 'Reset the high score?',
    message:
      'The high score of this board size will be set back to 0. Other sizes and your current game are not affected.',
    confirmLabel: 'Reset',
  })

  #game
  #gridView
  #scoreView
  #overlayView
  #confirmDialogView
  #settings
  #highScoreController
  #savedGameController
  #statisticsController
  #isPausedAfterWin = false

  constructor({
    game,
    gridView,
    scoreView,
    overlayView,
    confirmDialogView,
    settings,
    highScoreController,
    savedGameController,
    statisticsController,
  }) {
    this.#game = game
    this.#gridView = gridView
    this.#scoreView = scoreView
    this.#overlayView = overlayView
    this.#confirmDialogView = confirmDialogView
    this.#settings = settings
    this.#highScoreController = highScoreController
    this.#savedGameController = savedGameController
    this.#statisticsController = statisticsController
  }

  get isInProgress() {
    return this.#game.isInProgress
  }

  start() {
    const isRestored = this.#restoreSavedGame()

    if (!isRestored) this.restart()
  }

  async requestNewGame() {
    if (!this.#game.isInProgress) {
      this.restart()
      return
    }

    const isConfirmed = await this.#confirm(GameController.#NEW_GAME_PROMPT)

    if (isConfirmed) this.restartAndFocus()
  }

  async requestResetHighScore() {
    if (this.#highScoreController.value === 0) return

    const isConfirmed = await this.#confirm(GameController.#RESET_HIGH_SCORE_PROMPT)

    if (!isConfirmed) return

    this.#highScoreController.reset()
    this.returnFocusToBoard()
  }

  restart() {
    this.#isPausedAfterWin = false
    this.#overlayView.closeAll()

    if (this.#game.isInProgress) this.#statisticsController.recordRestart()

    this.#savedGameController.clear()

    const { spawnedTiles } = this.#game.start(
      this.#settings.get(SETTING_NAMES.BOARD_SIZE),
      this.#settings.get(SETTING_NAMES.WIN_TILE),
    )

    this.#highScoreController.showSize(this.#game.size)
    this.#highScoreController.beginGame()
    this.#renderScore()
    this.#renderBoard(spawnedTiles)
  }

  restartAndFocus() {
    this.restart()
    this.returnFocusToBoard()
  }

  continueAfterWin() {
    this.#isPausedAfterWin = false
    this.#overlayView.closeWin()
  }

  returnFocusToBoard() {
    this.#gridView.focus()
  }

  requestMove(direction) {
    const canMove = !this.#isPausedAfterWin && !this.#game.isOver

    if (!canMove) return

    const moveResult = this.#game.move(direction)

    if (!moveResult.hasMoved) return

    this.#renderMove(moveResult)
    this.#recordMove(moveResult)
    this.#showOutcome(moveResult)
    this.#persistGame()
  }

  #renderMove(moveResult) {
    this.#renderScore()
    this.#scoreView.showScoreGain(moveResult.scoreGained)
    this.#gridView.animateMove(moveResult)
  }

  #recordMove({ hasJustWon, isOver }) {
    this.#statisticsController.recordMove({
      score: this.#game.score,
      highestTile: this.#game.highestTile,
      hasJustWon,
      isOver,
    })
  }

  #showOutcome({ hasJustWon, isOver }) {
    const { winTile } = this.#game

    if (isOver) {
      this.#overlayView.openGameOver({
        hasJustWon,
        winTile,
        summary: this.#getSummary(),
      })
      return
    }

    if (!hasJustWon) return

    this.#isPausedAfterWin = true
    this.#overlayView.openWin({ winTile, summary: this.#getSummary() })
  }

  #getSummary() {
    const { score, moves, highestTile } = this.#game

    return { score, moves, highestTile }
  }

  async #confirm(prompt) {
    const isConfirmed = await this.#confirmDialogView.ask(prompt)

    if (isConfirmed) return true

    const isFocusRestored = this.#confirmDialogView.restoreFocus()

    if (!isFocusRestored) this.returnFocusToBoard()

    return false
  }

  #restoreSavedGame() {
    const isRestored = this.#game.restore(this.#savedGameController.read())

    if (!isRestored) return false

    this.#settings.set(SETTING_NAMES.BOARD_SIZE, this.#game.size)
    this.#settings.set(SETTING_NAMES.WIN_TILE, this.#game.winTile)
    this.#highScoreController.showSize(this.#game.size)
    this.#highScoreController.resumeGame(this.#game.score)
    this.#renderScore()
    this.#renderBoard([])

    return true
  }

  #renderBoard(spawnedTiles) {
    this.#gridView.render({
      size: this.#game.size,
      tiles: this.#game.tiles,
      spawnedTiles,
    })
  }

  #renderScore() {
    const score = this.#game.score

    this.#scoreView.renderScore(score)
    this.#highScoreController.update(score)
  }

  #persistGame() {
    if (this.#game.isOver) {
      this.#savedGameController.clear()
      return
    }

    this.#savedGameController.save(this.#game.toState())
  }
}
