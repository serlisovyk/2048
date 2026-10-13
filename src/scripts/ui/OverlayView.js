export class OverlayView {
  #winDialog
  #gameOverDialog
  #continueButton
  #winRestartButton
  #restartButton
  #winMessage
  #winNote

  constructor({
    winDialog,
    gameOverDialog,
    continueButton,
    winRestartButton,
    restartButton,
    winMessage,
    winNote,
  }) {
    this.#winDialog = winDialog
    this.#gameOverDialog = gameOverDialog
    this.#continueButton = continueButton
    this.#winRestartButton = winRestartButton
    this.#restartButton = restartButton
    this.#winMessage = winMessage
    this.#winNote = winNote

    this.#gameOverDialog.addEventListener('cancel', (event) =>
      event.preventDefault(),
    )
  }

  onContinue(handler) {
    this.#continueButton.addEventListener('click', handler)
    this.#winDialog.addEventListener('cancel', (event) => {
      event.preventDefault()
      handler()
    })
  }

  onRestart(handler) {
    this.#winRestartButton.addEventListener('click', handler)
    this.#restartButton.addEventListener('click', handler)
  }

  onClose(handler) {
    this.#winDialog.addEventListener('close', handler)
    this.#gameOverDialog.addEventListener('close', handler)
  }

  showWin(winTile) {
    this.#winMessage.textContent = OverlayView.#getReachedMessage(winTile)
    this.#gameOverDialog.close()
    this.#winDialog.showModal()
  }

  showGameOver({ justWon = false, winTile } = {}) {
    this.#winNote.textContent = OverlayView.#getReachedMessage(winTile)
    this.#winNote.hidden = !justWon
    this.#winDialog.close()
    this.#gameOverDialog.showModal()
  }

  hideWin() {
    this.#winDialog.close()
  }

  hideAll() {
    this.#winDialog.close()
    this.#gameOverDialog.close()
  }

  static #getReachedMessage(winTile) {
    return `You've reached ${winTile}!`
  }
}
