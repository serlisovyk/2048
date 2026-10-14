import { TILE_CLEANUP_MS, TILE_POP_MS, TILE_SLIDE_MS } from '../constants.js'

export class GridView {
  #element
  #tiles = new Map()
  #retiredElements = []
  #settleTimeoutId = null

  constructor({ element }) {
    this.#element = element
    this.#element.style.setProperty('--tile-slide-duration', `${TILE_SLIDE_MS}ms`)
    this.#element.style.setProperty('--tile-pop-duration', `${TILE_POP_MS}ms`)
    this.#element.tabIndex = -1
  }

  focus() {
    this.#element.focus()
  }

  render({ size, winTile, tiles, spawnedTiles }) {
    const spawnedIds = new Set(spawnedTiles.map(({ id }) => id))

    this.#clearTiles()
    this.#element.style.setProperty('--board-size', size)
    this.#element.setAttribute('aria-label', GridView.#getLabel(size, winTile))
    this.#createCells(size)

    tiles.forEach((tile) => {
      const classNames = spawnedIds.has(tile.id) ? ['new-tile'] : []

      this.#createTile(tile, classNames)
    })

    this.#scheduleSettle()
  }

  animateMove({ slides, merges, spawnedTiles }) {
    this.#finish()
    this.#element.classList.add('is-sliding')

    slides.forEach(({ id, to }) => this.#place(this.#tiles.get(id), to))

    merges.forEach((tile) => {
      tile.mergedFrom.forEach((id) => this.#retire(id))
      this.#createTile(tile, ['merged-tile'])
    })

    const delayClassName = merges.length > 0 ? 'after-merge' : 'after-slide'

    spawnedTiles.forEach((tile) => {
      this.#createTile(tile, ['new-tile', delayClassName])
    })

    this.#scheduleSettle()
  }

  static #getLabel(size, winTile) {
    return `2048 board, ${size}×${size}, goal ${winTile}`
  }

  #createCells(size) {
    const cells = Array.from({ length: size * size }, () => {
      const cell = document.createElement('div')

      cell.className = 'grid-cell'

      return cell
    })

    this.#element.replaceChildren(...cells)
  }

  #clearTiles() {
    this.#finish()
    this.#tiles.forEach(({ element }) => element.remove())
    this.#tiles.clear()
  }

  #createTile({ id, value, row, col }, classNames) {
    const element = document.createElement('div')
    const tile = { element, row, col }

    element.classList.add('tile', ...classNames)
    element.dataset.value = value
    element.textContent = value

    this.#place(tile, { row, col })
    this.#tiles.set(id, tile)
    this.#element.append(element)
  }

  #place(tile, { row, col }) {
    tile.row = row
    tile.col = col
    tile.element.style.setProperty('--row', row)
    tile.element.style.setProperty('--col', col)
  }

  #retire(id) {
    const { element } = this.#tiles.get(id)

    element.classList.add('retired-tile')
    this.#retiredElements.push(element)
    this.#tiles.delete(id)
  }

  #scheduleSettle() {
    clearTimeout(this.#settleTimeoutId)
    this.#settleTimeoutId = setTimeout(() => this.#settle(), TILE_CLEANUP_MS)
  }

  #settle() {
    this.#finish()
    this.#appendTilesInReadingOrder()
  }

  #appendTilesInReadingOrder() {
    const tiles = [...this.#tiles.values()].sort(
      (first, second) => first.row - second.row || first.col - second.col,
    )

    this.#element.append(...tiles.map(({ element }) => element))
  }

  #finish() {
    clearTimeout(this.#settleTimeoutId)

    this.#element
      .getAnimations({ subtree: true })
      .forEach((animation) => animation.finish())

    this.#retiredElements.forEach((element) => element.remove())
    this.#retiredElements = []
    this.#element.classList.remove('is-sliding')

    this.#tiles.forEach(({ element }) => {
      element.classList.remove(
        'new-tile',
        'after-slide',
        'after-merge',
        'merged-tile',
      )
    })
  }
}
