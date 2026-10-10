import { ARROW_KEY_DIRECTIONS } from '../constants.js'

export class KeyboardInput {
  #target
  #onDirection

  constructor(target, onDirection) {
    this.#target = target
    this.#onDirection = onDirection
  }

  bind() {
    this.#target.addEventListener('keydown', this.#handleKeydown)
  }

  #handleKeydown = (event) => {
    if (!Object.hasOwn(ARROW_KEY_DIRECTIONS, event.key)) return

    event.preventDefault()
    this.#onDirection(ARROW_KEY_DIRECTIONS[event.key])
  }
}
