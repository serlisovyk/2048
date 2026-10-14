export class FooterView {
  #yearElement

  constructor({ yearElement }) {
    this.#yearElement = yearElement
  }

  renderYear(year) {
    this.#yearElement.textContent = ` · ${year}`
  }
}
