export class OverlayView {
  #winElement
  #gameOverElement
  #continueButton
  #restartButton

  constructor({ winElement, gameOverElement, continueButton, restartButton }) {
    this.#winElement = winElement
    this.#gameOverElement = gameOverElement
    this.#continueButton = continueButton
    this.#restartButton = restartButton
  }

  onContinue(handler) {
    this.#continueButton.addEventListener('click', handler)
  }

  onRestart(handler) {
    this.#restartButton.addEventListener('click', handler)
  }

  showWin() {
    this.#winElement.style.display = 'flex'
    this.#continueButton.focus()
  }

  hideWin() {
    this.#winElement.style.display = 'none'
  }

  showGameOver() {
    this.#gameOverElement.style.display = 'flex'
    this.#restartButton.focus()
  }

  hideAll() {
    this.hideWin()
    this.#gameOverElement.style.display = 'none'
  }
}
