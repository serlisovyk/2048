import { KEY_CODE_DIRECTIONS } from '../constants.js'

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
    if (!Object.hasOwn(KEY_CODE_DIRECTIONS, event.code)) return

    event.preventDefault()
    this.#onDirection(KEY_CODE_DIRECTIONS[event.code])
  }
}
