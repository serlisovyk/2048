import { DIRECTIONS, FOUR_TILE_PROBABILITY } from '../constants.js'

export class Board {
  #size
  #cells

  constructor(size) {
    this.#size = size
    this.#cells = Array.from({ length: size }, () => Array(size).fill(0))
  }

  toArray() {
    return this.#cells.map((row) => [...row])
  }

  restore(cells) {
    if (!Board.#isValidCells(cells, this.#size)) return false

    this.#cells = cells.map((row) => [...row])

    return true
  }

  spawnRandomTile() {
    const emptyCells = this.#getEmptyCells()

    if (emptyCells.length === 0) return null

    const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)]
    const value = Math.random() < FOUR_TILE_PROBABILITY ? 4 : 2

    this.#cells[row][col] = value

    return { row, col, value }
  }

  move(direction) {
    const isVertical = direction === DIRECTIONS.UP || direction === DIRECTIONS.DOWN
    const isTowardsStart =
      direction === DIRECTIONS.UP || direction === DIRECTIONS.LEFT

    let moved = false
    let scoreGained = 0

    for (let index = 0; index < this.#size; index++) {
      const line = isVertical ? this.#getColumn(index) : this.#getRow(index)
      const result = Board.#slideLine(line, isTowardsStart)

      if (result.line.some((value, position) => value !== line[position])) {
        moved = true

        if (isVertical) {
          this.#setColumn(index, result.line)
        } else {
          this.#setRow(index, result.line)
        }
      }

      scoreGained += result.scoreGained
    }

    return { moved, scoreGained }
  }

  hasTile(value) {
    return this.#cells.some((row) => row.includes(value))
  }

  hasAvailableMoves() {
    for (let row = 0; row < this.#size; row++) {
      for (let col = 0; col < this.#size; col++) {
        const value = this.#cells[row][col]

        if (
          value === 0 ||
          (col < this.#size - 1 && value === this.#cells[row][col + 1]) ||
          (row < this.#size - 1 && value === this.#cells[row + 1][col])
        ) {
          return true
        }
      }
    }

    return false
  }

  #getEmptyCells() {
    const emptyCells = []

    this.#cells.forEach((cells, row) => {
      cells.forEach((value, col) => {
        if (value === 0) emptyCells.push({ row, col })
      })
    })

    return emptyCells
  }

  #getRow(row) {
    return [...this.#cells[row]]
  }

  #getColumn(col) {
    return this.#cells.map((row) => row[col])
  }

  #setRow(row, line) {
    this.#cells[row] = [...line]
  }

  #setColumn(col, line) {
    line.forEach((value, row) => {
      this.#cells[row][col] = value
    })
  }

  static #isValidCells(cells, size) {
    return (
      Array.isArray(cells) &&
      cells.length === size &&
      cells.every(
        (row) =>
          Array.isArray(row) &&
          row.length === size &&
          row.every((value) => Board.#isTileValue(value)),
      )
    )
  }

  static #isTileValue(value) {
    if (value === 0) return true
    if (!Number.isSafeInteger(value) || value < 2) return false

    let remainder = value

    while (remainder % 2 === 0) remainder /= 2

    return remainder === 1
  }

  static #slideLine(line, isTowardsStart) {
    const tiles = line.filter((value) => value !== 0)
    let scoreGained = 0

    if (!isTowardsStart) tiles.reverse()

    for (let index = 0; index < tiles.length - 1; index++) {
      if (tiles[index] === tiles[index + 1]) {
        tiles[index] *= 2
        scoreGained += tiles[index]
        tiles.splice(index + 1, 1)
      }
    }

    while (tiles.length < line.length) {
      tiles.push(0)
    }

    if (!isTowardsStart) tiles.reverse()

    return { line: tiles, scoreGained }
  }
}
