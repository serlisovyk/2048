import { DIRECTIONS, SWIPE_THRESHOLD_PX } from '../constants.js'

export class SwipeInput {
  static #INTERACTIVE_SELECTOR = 'a, button, input'
  static #OPEN_DIALOG_SELECTOR = 'dialog[open]'

  #target
  #onDirection
  #pointer = null

  constructor({ target, onDirection }) {
    this.#target = target
    this.#onDirection = onDirection
  }

  bind() {
    this.#target.addEventListener('pointerdown', (event) =>
      this.#handlePointerDown(event),
    )
    this.#target.addEventListener('pointerup', (event) =>
      this.#handlePointerUp(event),
    )
    this.#target.addEventListener('pointercancel', (event) =>
      this.#handlePointerCancel(event),
    )
  }

  #handlePointerDown(event) {
    const isPrimaryButton = event.isPrimary && event.button === 0
    const isOnInteractive =
      event.target.closest(SwipeInput.#INTERACTIVE_SELECTOR) !== null
    const canStart = isPrimaryButton && !isOnInteractive && !this.#hasOpenDialog()

    if (!canStart) return

    this.#pointer = { id: event.pointerId, x: event.clientX, y: event.clientY }
  }

  #handlePointerUp(event) {
    if (!this.#isTracked(event)) return

    const deltaX = event.clientX - this.#pointer.x
    const deltaY = event.clientY - this.#pointer.y

    this.#pointer = null

    const direction = SwipeInput.#getDirection(deltaX, deltaY)
    const canMove = direction !== null && !this.#hasOpenDialog()

    if (canMove) this.#onDirection(direction)
  }

  #handlePointerCancel(event) {
    if (this.#isTracked(event)) this.#pointer = null
  }

  #isTracked({ pointerId }) {
    const trackedId = this.#pointer?.id

    return trackedId === pointerId
  }

  #hasOpenDialog() {
    const openDialog = this.#target.querySelector(SwipeInput.#OPEN_DIALOG_SELECTOR)

    return openDialog !== null
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
