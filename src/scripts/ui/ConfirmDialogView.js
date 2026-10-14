export class ConfirmDialogView {
  #dialog
  #titleElement
  #messageElement
  #cancelButton
  #confirmButton
  #resolve = null
  #opener = null

  constructor({
    dialog,
    titleElement,
    messageElement,
    cancelButton,
    confirmButton,
  }) {
    this.#dialog = dialog
    this.#titleElement = titleElement
    this.#messageElement = messageElement
    this.#cancelButton = cancelButton
    this.#confirmButton = confirmButton

    this.#cancelButton.addEventListener('click', () => this.#answer(false))
    this.#confirmButton.addEventListener('click', () => this.#answer(true))
    this.#dialog.addEventListener('close', this.#handleClose)
  }

  ask({ title, message, confirmLabel }) {
    if (this.#dialog.open) return Promise.resolve(false)

    this.#opener = this.#findOpener()
    this.#titleElement.textContent = title
    this.#messageElement.textContent = message
    this.#confirmButton.textContent = confirmLabel

    return new Promise((resolve) => {
      this.#resolve = resolve
      this.#dialog.showModal()
    })
  }

  // Call after ask() resolved to false: gives focus back to the element that was
  // focused when the question was asked. Returns false when there is no such element
  // (or the dialog is open again), so the caller can pick another place.
  restoreFocus() {
    const opener = this.#opener

    if (this.#dialog.open || opener === null) return false

    this.#opener = null
    opener.focus()

    return this.#dialog.ownerDocument.activeElement === opener
  }

  #findOpener() {
    const { activeElement, body } = this.#dialog.ownerDocument

    return activeElement instanceof HTMLElement && activeElement !== body
      ? activeElement
      : null
  }

  #answer(isConfirmed) {
    this.#dialog.close()
    this.#settle(isConfirmed)
  }

  #settle(isConfirmed) {
    const resolve = this.#resolve

    this.#resolve = null
    resolve?.(isConfirmed)
  }

  // Escape and a close forced by the browser end up here: both mean "no". The
  // event can arrive late, after a new question has already opened the dialog.
  #handleClose = () => {
    if (!this.#dialog.open) this.#settle(false)
  }
}
