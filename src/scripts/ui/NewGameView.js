export class NewGameView {
  #button

  constructor({ button }) {
    this.#button = button
  }

  onNewGame(handler) {
    this.#button.addEventListener('click', handler)
  }
}
