import { TILE_CLEANUP_MS, TILE_POP_MS, TILE_SLIDE_MS } from '../constants.js'

export class GridView {
  #element
  #tiles = new Map()
  #retiredElements = []
  #settleTimeoutId = null

  constructor(element) {
    this.#element = element
    this.#element.style.setProperty('--tile-slide-duration', `${TILE_SLIDE_MS}ms`)
    this.#element.style.setProperty('--tile-pop-duration', `${TILE_POP_MS}ms`)
    this.#element.tabIndex = -1
  }

  focus() {
    this.#element.focus()
  }

  // A board of another size: the background cells are rebuilt (which also drops every
  // tile) and CSS gets the size. Always followed by render().
  resize(size) {
    this.#clearTiles()
    this.#element.style.setProperty('--board-size', size)
    this.#createCells(size)
  }

  // The whole board at once, with no slide: a new game (its tiles pop in) or a
  // restored one (nothing animates).
  render(tiles, spawnedTiles = []) {
    const spawnedIds = new Set(spawnedTiles.map(({ id }) => id))

    this.#clearTiles()

    tiles.forEach((tile) => {
      const classNames = spawnedIds.has(tile.id) ? ['new-tile'] : []

      this.#createTile(tile, classNames)
    })

    this.#scheduleSettle()
  }

  // Slide, then the merge pop, then the new tile; the order and the waits are CSS
  // delays. A running move is finished at once, so the next one starts from a settled
  // board and no press is ever queued or dropped.
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

  // The move is over: tidy up, then put the tiles in the DOM row by row, so a screen
  // reader keeps reading the numbers in the order of the board. Re-inserting a tile
  // drops its transition, so this only runs when nothing is about to slide.
  #settle() {
    this.#finish()

    const tiles = [...this.#tiles.values()].sort(
      (a, b) => a.row - b.row || a.col - b.col,
    )

    this.#element.append(...tiles.map(({ element }) => element))
  }

  // Jumps whatever is still running to its end and tidies up. Safe to call at any
  // time and as often as needed; the next move starts from the board it leaves.
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
