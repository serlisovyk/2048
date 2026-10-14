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

    this.#closeButton.addEventListener('click', () => this.#dismiss())
    this.#dialog.addEventListener('cancel', (event) => this.#handleCancel(event))
  }

  onOpen(handler) {
    this.#openButton.addEventListener('click', handler)
  }

  onResetStatistics(handler) {
    this.#resetStatisticsButton.addEventListener('click', handler)
  }

  onChange(handler) {
    this.#dialog.addEventListener('change', ({ target }) => {
      if (target.name) handler(target.name, target.value)
    })
  }

  render(values, choices) {
    Object.entries(choices).forEach(([name, options]) =>
      this.#renderChoices(name, options),
    )

    this.#dialog.querySelectorAll('input[name]').forEach((input) => {
      input.checked = String(values[input.name]) === input.value
    })
  }

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
    this.#dialog.scrollTop = 0
    this.#focus('input:checked')
  }

  close() {
    this.#dialog.close()
  }

  focusSetting(name) {
    this.#focus(`input[name="${name}"]:checked`)
  }

  focusResetStatistics() {
    this.#resetStatisticsButton.focus()
  }

  #focus(selector) {
    const option = this.#dialog.querySelector(selector)

    option?.focus()
    option?.closest('label').scrollIntoView({ block: 'nearest' })
  }

  #renderChoices(name, options) {
    this.#dialog
      .querySelectorAll(`input[name="${name}"]`)
      .forEach((input, index) => {
        input.value = String(options[index])
        input.nextElementSibling.textContent = options[index]
      })
  }

  #dismiss() {
    this.close()
    this.#openButton.focus()
  }

  #handleCancel(event) {
    event.preventDefault()
    this.#dismiss()
  }
}
