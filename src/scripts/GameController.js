import { MOVE_COOLDOWN_MS, SAVED_GAME_VERSION, STORAGE_KEYS } from './constants.js'

export class GameController {
  #game
  #gridView
  #scoreView
  #overlayView
  #storage
  #highScore = 0
  #isMoving = false
  #isPausedAfterWin = false

  constructor({ game, gridView, scoreView, overlayView, storage }) {
    this.#game = game
    this.#gridView = gridView
    this.#scoreView = scoreView
    this.#overlayView = overlayView
    this.#storage = storage
  }

  start() {
    this.#highScore = this.#storage.getNumber(STORAGE_KEYS.HIGH_SCORE)
    this.#scoreView.renderHighScore(this.#highScore)

    if (!this.#restoreSavedGame()) this.#startNewGame()
  }

  restart() {
    this.#isPausedAfterWin = false
    this.#overlayView.hideAll()
    this.#startNewGame()
  }

  continueAfterWin() {
    this.#isPausedAfterWin = false
    this.#overlayView.hideWin()
    this.#gridView.focus()
  }

  requestMove(direction) {
    if (this.#isMoving || this.#isPausedAfterWin || this.#game.isOver) return

    this.#isMoving = true
    setTimeout(() => {
      this.#isMoving = false
    }, MOVE_COOLDOWN_MS)

    const result = this.#game.move(direction)

    if (!result.moved) return

    this.#renderScore()
    this.#gridView.render(this.#game.cells, result.spawnedTiles)

    if (result.isOver) {
      this.#overlayView.showGameOver({ justWon: result.justWon })
    } else if (result.justWon) {
      this.#isPausedAfterWin = true
      this.#overlayView.showWin()
    }

    this.#persistGame()
  }

  #startNewGame() {
    this.#clearSavedGame()

    const { spawnedTiles } = this.#game.start()

    this.#renderScore()
    this.#gridView.render(this.#game.cells, spawnedTiles)
  }

  #restoreSavedGame() {
    const saved = this.#storage.getJson(STORAGE_KEYS.SAVED_GAME)

    if (saved?.version !== SAVED_GAME_VERSION || !this.#game.restore(saved)) {
      return false
    }

    this.#renderScore()
    this.#gridView.render(this.#game.cells)

    return true
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

  #renderScore() {
    const score = this.#game.score

    this.#scoreView.renderScore(score)

    if (score <= this.#highScore) return

    this.#highScore = score
    this.#scoreView.renderHighScore(score)
    this.#storage.setValue(STORAGE_KEYS.HIGH_SCORE, score)
  }
}
