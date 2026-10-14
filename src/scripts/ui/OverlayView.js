export class OverlayView {
  #winDialog
  #gameOverDialog
  #continueButton
  #winRestartButton
  #gameOverRestartButton
  #winMessage
  #gameOverWinNote

  constructor({
    winDialog,
    gameOverDialog,
    continueButton,
    winRestartButton,
    gameOverRestartButton,
    winMessage,
    gameOverWinNote,
  }) {
    this.#winDialog = winDialog
    this.#gameOverDialog = gameOverDialog
    this.#continueButton = continueButton
    this.#winRestartButton = winRestartButton
    this.#gameOverRestartButton = gameOverRestartButton
    this.#winMessage = winMessage
    this.#gameOverWinNote = gameOverWinNote

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
    this.#gameOverRestartButton.addEventListener('click', handler)
  }

  onClose(handler) {
    this.#winDialog.addEventListener('close', handler)
    this.#gameOverDialog.addEventListener('close', handler)
  }

  openWin({ winTile, summary }) {
    this.#winMessage.textContent = OverlayView.#getReachedMessage(winTile)
    OverlayView.#renderSummary(this.#winDialog, summary)
    this.#winDialog.showModal()
  }

  openGameOver({ hasJustWon, winTile, summary }) {
    this.#gameOverWinNote.textContent = OverlayView.#getReachedMessage(winTile)
    this.#gameOverWinNote.hidden = !hasJustWon
    OverlayView.#renderSummary(this.#gameOverDialog, summary)
    this.#gameOverDialog.showModal()
  }

  closeWin() {
    this.#winDialog.close()
  }

  closeAll() {
    this.#winDialog.close()
    this.#gameOverDialog.close()
  }

  static #getReachedMessage(winTile) {
    return `You've reached ${winTile}!`
  }

  static #renderSummary(dialog, summary) {
    dialog.querySelectorAll('[data-summary]').forEach((element) => {
      element.textContent = summary[element.dataset.summary]
    })
  }
}
