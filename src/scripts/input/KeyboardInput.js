import { KEY_CODE_DIRECTIONS } from '../constants.js'

export class KeyboardInput {
  static #NON_GAME_CONTEXT_SELECTOR =
    'input, textarea, select, dialog[open], [role="dialog"]'

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

    return (
      target.isContentEditable ||
      target.closest(KeyboardInput.#NON_GAME_CONTEXT_SELECTOR) !== null
    )
  }
}
