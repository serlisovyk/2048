import { DIRECTIONS, FOUR_TILE_PROBABILITY } from '../constants.js'

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
    return this.#cells.flatMap((cells, row) =>
      cells.flatMap((tile, col) =>
        tile ? [{ id: tile.id, value: tile.value, row, col }] : [],
      ),
    )
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

    if (emptyCells.length === 0) return null

    const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)]
    const tile = this.#createTile(Math.random() < FOUR_TILE_PROBABILITY ? 4 : 2)

    this.#cells[row][col] = tile

    return { id: tile.id, row, col, value: tile.value }
  }

  move(direction) {
    const isVertical = direction === DIRECTIONS.UP || direction === DIRECTIONS.DOWN
    const isTowardsStart =
      direction === DIRECTIONS.UP || direction === DIRECTIONS.LEFT
    const slides = []
    const merges = []

    for (let index = 0; index < this.#size; index++) {
      const result = this.#slideLine(index, isVertical, isTowardsStart)

      slides.push(...result.slides)
      merges.push(...result.merges)
    }

    return {
      moved: slides.length > 0,
      scoreGained: merges.reduce((sum, { value }) => sum + value, 0),
      slides,
      merges,
    }
  }

  // The largest tile on the board, 0 when it is empty. A tile only ever merges into a
  // larger one, so this is also the highest tile the game has reached.
  getHighestTile() {
    return Math.max(0, ...this.toArray().flat())
  }

  hasTile(value) {
    return this.#cells.some((row) => row.some((tile) => tile?.value === value))
  }

  hasAvailableMoves() {
    const values = this.toArray()

    for (let row = 0; row < this.#size; row++) {
      for (let col = 0; col < this.#size; col++) {
        const value = values[row][col]

        if (
          value === 0 ||
          (col < this.#size - 1 && value === values[row][col + 1]) ||
          (row < this.#size - 1 && value === values[row + 1][col])
        ) {
          return true
        }
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
    const line = isVertical ? this.#getColumn(index) : this.#getRow(index)
    const cellAt = (position) =>
      isVertical ? { row: position, col: index } : { row: index, col: position }
    const slidLine = Array(this.#size).fill(null)
    const slides = []
    const merges = []

    Board.#planSlide(line, isTowardsStart).forEach(({ sources, value }, order) => {
      const position = isTowardsStart ? order : this.#size - 1 - order
      const to = cellAt(position)
      const tile = sources.length === 1 ? line[sources[0]] : this.#createTile(value)

      slidLine[position] = tile

      sources
        .filter((source) => source !== position)
        .forEach((source) => {
          slides.push({ id: line[source].id, from: cellAt(source), to })
        })

      if (sources.length === 2) {
        merges.push({
          id: tile.id,
          ...to,
          value,
          mergedFrom: sources.map((source) => line[source].id),
        })
      }
    })

    if (isVertical) {
      this.#setColumn(index, slidLine)
    } else {
      this.#setRow(index, slidLine)
    }

    return { slides, merges }
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
    line.forEach((tile, row) => {
      this.#cells[row][col] = tile
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

  // Where each tile of a line lands, in sliding order: `sources` are the line
  // positions of the one or two tiles that end up in that cell.
  static #planSlide(line, isTowardsStart) {
    const positions = [...line.keys()].filter((position) => line[position])
    const plan = []

    if (!isTowardsStart) positions.reverse()

    for (const position of positions) {
      const last = plan.at(-1)
      const { value } = line[position]

      if (last?.sources.length === 1 && last.value === value) {
        last.sources.push(position)
        last.value *= 2
      } else {
        plan.push({ sources: [position], value })
      }
    }

    return plan
  }
}
