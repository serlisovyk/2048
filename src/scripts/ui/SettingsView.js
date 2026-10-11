export class SettingsView {
  #dialog
  #openButton
  #closeButton

  constructor({ dialog, openButton, closeButton }) {
    this.#dialog = dialog
    this.#openButton = openButton
    this.#closeButton = closeButton

    this.#closeButton.addEventListener('click', this.#dismiss)
    this.#dialog.addEventListener('cancel', this.#handleCancel)
  }

  onOpen(handler) {
    this.#openButton.addEventListener('click', handler)
  }

  // One delegated listener: a section is markup only, a control named after its setting.
  onChange(handler) {
    this.#dialog.addEventListener('change', ({ target }) => {
      if (target.name) handler(target.name, target.value)
    })
  }

  // Checks the radio button of every named group whose value is the setting's.
  render(values) {
    this.#dialog.querySelectorAll('input[name]').forEach((input) => {
      input.checked = String(values[input.name]) === input.value
    })
  }

  open() {
    this.#dialog.showModal()
  }

  close() {
    this.#dialog.close()
  }

  // Escape and Close: the dialog was opened by a button, so focus goes back to it.
  #dismiss = () => {
    this.close()
    this.#openButton.focus()
  }

  #handleCancel = (event) => {
    event.preventDefault()
    this.#dismiss()
  }
}
