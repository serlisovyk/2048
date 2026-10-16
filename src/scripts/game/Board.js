import { DIRECTIONS, FOUR_TILE_PROBABILITY } from '../constants.js'
import { Validation } from './Validation.js'

export class Board {
  #size
  #cells
  #nextTileId = 1

  constructor(size) {
    this.#size = size
    this.#cells = Array.from({ length: size }, () => Array(size).fill(null))
  }

  toArray() {
    return this.#cells.map((row) => row.map((tile) => tile?.value ?? 0))
  }

  toTiles() {
    const tiles = []

    this.#cells.forEach((cells, row) => {
      cells.forEach((tile, col) => {
        if (tile) tiles.push({ id: tile.id, value: tile.value, row, col })
      })
    })

    return tiles
  }

  restore(cells) {
    if (!Board.#isValidCells(cells, this.#size)) return false

    this.#cells = cells.map((row) =>
      row.map((value) => (value === 0 ? null : this.#createTile(value))),
    )

    return true
  }

  spawnRandomTile() {
    const emptyCells = this.#getEmptyCells()

    const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)]

    const value = Math.random() < FOUR_TILE_PROBABILITY ? 4 : 2
    const tile = this.#createTile(value)

    this.#cells[row][col] = tile

    return { id: tile.id, row, col, value }
  }

  move(direction) {
    const isVertical = direction === DIRECTIONS.UP || direction === DIRECTIONS.DOWN
    const isTowardsStart =
      direction === DIRECTIONS.UP || direction === DIRECTIONS.LEFT

    const slides = []
    const merges = []

    for (let index = 0; index < this.#size; index++) {
      const lineResult = this.#slideLine(index, isVertical, isTowardsStart)

      slides.push(...lineResult.slides)
      merges.push(...lineResult.merges)
    }

    const hasMoved = slides.length > 0
    const scoreGained = merges.reduce((sum, { value }) => sum + value, 0)

    return { hasMoved, scoreGained, slides, merges }
  }

  getHighestTile() {
    return Math.max(0, ...this.toArray().flat())
  }

  hasAvailableMoves() {
    const values = this.toArray()
    const lastIndex = this.#size - 1

    for (let row = 0; row < this.#size; row++) {
      for (let col = 0; col < this.#size; col++) {
        const value = values[row][col]
        const isEmpty = value === 0
        const canMergeRight = col < lastIndex && value === values[row][col + 1]
        const canMergeDown = row < lastIndex && value === values[row + 1][col]

        if (isEmpty || canMergeRight || canMergeDown) return true
      }
    }

    return false
  }

  #createTile(value) {
    return { id: this.#nextTileId++, value }
  }

  #getEmptyCells() {
    const emptyCells = []

    this.#cells.forEach((cells, row) => {
      cells.forEach((tile, col) => {
        if (!tile) emptyCells.push({ row, col })
      })
    })

    return emptyCells
  }

  #slideLine(index, isVertical, isTowardsStart) {
    const line = this.#getLine(index, isVertical)
    const cellAt = (position) =>
      isVertical ? { row: position, col: index } : { row: index, col: position }
    const slidLine = Array(this.#size).fill(null)

    const slides = []
    const merges = []

    Board.#planSlide(line, isTowardsStart).forEach(({ sources, value }, order) => {
      const position = isTowardsStart ? order : this.#size - 1 - order
      const to = cellAt(position)
      const isMerge = sources.length === 2
      const tile = isMerge ? this.#createTile(value) : line[sources[0]]

      slidLine[position] = tile

      sources
        .filter((source) => source !== position)
        .forEach((source) => {
          slides.push({ id: line[source].id, from: cellAt(source), to })
        })

      if (isMerge) {
        merges.push({
          id: tile.id,
          ...to,
          value,
          mergedFrom: sources.map((source) => line[source].id),
        })
      }
    })

    this.#setLine(index, slidLine, isVertical)

    return { slides, merges }
  }

  #getLine(index, isVertical) {
    if (isVertical) return this.#cells.map((row) => row[index])

    return [...this.#cells[index]]
  }

  #setLine(index, line, isVertical) {
    if (!isVertical) {
      this.#cells[index] = [...line]
      return
    }

    line.forEach((tile, row) => {
      this.#cells[row][index] = tile
    })
  }

  static #isValidCells(cells, size) {
    if (!Array.isArray(cells) || cells.length !== size) return false

    return cells.every((row) => Board.#isValidRow(row, size))
  }

  static #isValidRow(row, size) {
    const hasSize = Array.isArray(row) && row.length === size

    return hasSize && row.every((value) => Validation.isTile(value))
  }

  static #planSlide(line, isTowardsStart) {
    const positions = [...line.keys()].filter((position) => line[position])
    const plan = []

    if (!isTowardsStart) positions.reverse()

    for (const position of positions) {
      const last = plan.at(-1)

      const { value } = line[position]

      const canMerge = last?.sources.length === 1 && last.value === value

      if (canMerge) {
        last.sources.push(position)
        last.value *= 2
      } else {
        plan.push({ sources: [position], value })
      }
    }

    return plan
  }
}
