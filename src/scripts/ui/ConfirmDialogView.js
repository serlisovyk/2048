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
    this.#dialog.addEventListener('close', () => this.#handleClose())
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

  restoreFocus() {
    const opener = this.#opener

    if (this.#dialog.open || opener === null) return false

    this.#opener = null
    opener.focus()

    const { activeElement } = this.#dialog.ownerDocument

    return activeElement === opener
  }

  #findOpener() {
    const { activeElement, body } = this.#dialog.ownerDocument
    const isFocusedElement =
      activeElement instanceof HTMLElement && activeElement !== body

    if (!isFocusedElement) return null

    return activeElement
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

  #handleClose() {
    const isClosed = !this.#dialog.open

    if (isClosed) this.#settle(false)
  }
}
