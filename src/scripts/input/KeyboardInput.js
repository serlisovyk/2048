import { KEY_CODE_DIRECTIONS } from '../constants.js'

export class KeyboardInput {
  static #NON_GAME_CONTEXT_SELECTOR = 'input, dialog[open]'

  #target
  #onDirection

  constructor({ target, onDirection }) {
    this.#target = target
    this.#onDirection = onDirection
  }

  bind() {
    this.#target.addEventListener('keydown', (event) => this.#handleKeydown(event))
  }

  #handleKeydown(event) {
    if (!Object.hasOwn(KEY_CODE_DIRECTIONS, event.code)) return
    if (KeyboardInput.#hasCommandModifier(event)) return
    if (KeyboardInput.#isInsideNonGameContext(event.target)) return

    event.preventDefault()
    this.#onDirection(KEY_CODE_DIRECTIONS[event.code])
  }

  static #hasCommandModifier(event) {
    return event.ctrlKey || event.metaKey || event.altKey
  }

  static #isInsideNonGameContext(target) {
    if (!(target instanceof Element)) return false

    const isEditable = target.isContentEditable
    const isInsideBlockingElement =
      target.closest(KeyboardInput.#NON_GAME_CONTEXT_SELECTOR) !== null

    return isEditable || isInsideBlockingElement
  }
}
