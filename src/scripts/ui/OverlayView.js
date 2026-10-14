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

  showWin({ winTile, summary }) {
    this.#winMessage.textContent = OverlayView.#getReachedMessage(winTile)
    OverlayView.#renderSummary(this.#winDialog, summary)
    this.#winDialog.showModal()
  }

  showGameOver({ hasJustWon, winTile, summary }) {
    this.#winNote.textContent = OverlayView.#getReachedMessage(winTile)
    this.#winNote.hidden = !hasJustWon
    OverlayView.#renderSummary(this.#gameOverDialog, summary)
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

  // Each number of the summary goes into the element named after it, in the dialog's markup.
  static #renderSummary(dialog, summary) {
    dialog.querySelectorAll('[data-summary]').forEach((element) => {
      element.textContent = summary[element.dataset.summary]
    })
  }
}
