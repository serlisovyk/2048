export class OverlayView {
  #winDialog
  #gameOverDialog
  #continueButton
  #winRestartButton
  #restartButton
  #winNote

  constructor({
    winDialog,
    gameOverDialog,
    continueButton,
    winRestartButton,
    restartButton,
    winNote,
  }) {
    this.#winDialog = winDialog
    this.#gameOverDialog = gameOverDialog
    this.#continueButton = continueButton
    this.#winRestartButton = winRestartButton
    this.#restartButton = restartButton
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

  showWin() {
    this.#gameOverDialog.close()
    this.#winDialog.showModal()
  }

  showGameOver({ justWon = false } = {}) {
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
}
