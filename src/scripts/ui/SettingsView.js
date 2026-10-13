export class SettingsView {
  #dialog
  #openButton
  #closeButton
  #resetStatisticsButton

  constructor({ dialog, openButton, closeButton, resetStatisticsButton }) {
    this.#dialog = dialog
    this.#openButton = openButton
    this.#closeButton = closeButton
    this.#resetStatisticsButton = resetStatisticsButton

    this.#closeButton.addEventListener('click', this.#dismiss)
    this.#dialog.addEventListener('cancel', this.#handleCancel)
  }

  onOpen(handler) {
    this.#openButton.addEventListener('click', handler)
  }

  onResetStatistics(handler) {
    this.#resetStatisticsButton.addEventListener('click', handler)
  }

  // One delegated listener: a section is markup only, a control named after its setting.
  onChange(handler) {
    this.#dialog.addEventListener('change', ({ target }) => {
      if (target.name) handler(target.name, target.value)
    })
  }

  // Checks the radio button of every named group whose value is the setting's. A group
  // listed in `choices` (a setting whose options change) takes them first.
  render(values, choices = {}) {
    Object.entries(choices).forEach(([name, options]) =>
      this.#renderChoices(name, options),
    )

    this.#dialog.querySelectorAll('input[name]').forEach((input) => {
      input.checked = String(values[input.name]) === input.value
    })
  }

  // Each number goes into the element named after it (`data-statistic`). With nothing
  // counted there is nothing to reset, so the button is hidden, as the high score's is.
  renderStatistics(values) {
    this.#dialog.querySelectorAll('[data-statistic]').forEach((element) => {
      element.textContent = values[element.dataset.statistic]
    })
    this.#resetStatisticsButton.hidden = Object.values(values).every(
      (value) => value === 0,
    )
  }

  open() {
    this.#dialog.showModal()
  }

  close() {
    this.#dialog.close()
  }

  // The radios of the group, in order, get an option each as their value and as the text
  // of the `<span>` drawn beside the input.
  #renderChoices(name, options) {
    this.#dialog
      .querySelectorAll(`input[name="${name}"]`)
      .forEach((input, index) => {
        input.value = String(options[index])
        input.nextElementSibling.textContent = options[index]
      })
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
