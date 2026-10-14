import { DIRECTIONS, SWIPE_THRESHOLD_PX } from '../constants.js'

export class SwipeInput {
  #element
  #onDirection
  #pointerStart = null

  constructor(element, onDirection) {
    this.#element = element
    this.#onDirection = onDirection
  }

  bind() {
    this.#element.addEventListener('pointerdown', (event) =>
      this.#handlePointerDown(event),
    )
    this.#element.addEventListener('pointerup', (event) =>
      this.#handlePointerUp(event),
    )
    this.#element.addEventListener('pointercancel', () => this.#resetPointer())
  }

  #handlePointerDown(event) {
    const isSecondaryMouseButton =
      event.pointerType === 'mouse' && event.button !== 0

    if (isSecondaryMouseButton) return

    this.#pointerStart = { x: event.clientX, y: event.clientY }
  }

  #handlePointerUp(event) {
    if (!this.#pointerStart) return

    const deltaX = event.clientX - this.#pointerStart.x
    const deltaY = event.clientY - this.#pointerStart.y

    this.#resetPointer()

    const direction = SwipeInput.#getDirection(deltaX, deltaY)

    if (direction) this.#onDirection(direction)
  }

  #resetPointer() {
    this.#pointerStart = null
  }

  static #getDirection(deltaX, deltaY) {
    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    if (Math.max(absX, absY) < SWIPE_THRESHOLD_PX) return null

    const isHorizontal = absX > absY

    if (isHorizontal && deltaX > 0) return DIRECTIONS.RIGHT
    if (isHorizontal) return DIRECTIONS.LEFT
    if (deltaY > 0) return DIRECTIONS.DOWN

    return DIRECTIONS.UP
  }
}
