export class FooterView {
  #yearElement

  constructor(yearElement) {
    this.#yearElement = yearElement
  }

  // The separator is written with the year, so a footer without a year shows the name
  // alone and never a dangling dot.
  renderYear(year) {
    this.#yearElement.textContent = ` · ${year}`
  }
}
