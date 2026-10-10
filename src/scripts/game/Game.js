import { Board } from './Board.js'

export class Game {
  #size
  #winTile
  #board
  #score = 0
  #hasWon = false
  #isOver = false

  constructor({ size, winTile }) {
    this.#size = size
    this.#winTile = winTile
    this.#board = new Board(size)
  }

  get cells() {
    return this.#board.toArray()
  }

  get score() {
    return this.#score
  }

  get isOver() {
    return this.#isOver
  }

  start() {
    this.#board = new Board(this.#size)
    this.#score = 0
    this.#hasWon = false
    this.#isOver = false

    const spawnedTiles = [
      this.#board.spawnRandomTile(),
      this.#board.spawnRandomTile(),
    ]

    return { spawnedTiles: spawnedTiles.filter(Boolean) }
  }

  move(direction) {
    const { moved, scoreGained } = this.#board.move(direction)

    if (!moved) {
      return {
        moved,
        scoreGained,
        spawnedTiles: [],
        justWon: false,
        isOver: this.#isOver,
      }
    }

    this.#score += scoreGained

    const spawnedTile = this.#board.spawnRandomTile()
    const justWon = !this.#hasWon && this.#board.hasTile(this.#winTile)

    if (justWon) this.#hasWon = true

    this.#isOver = !this.#board.hasAvailableMoves()

    return {
      moved,
      scoreGained,
      spawnedTiles: spawnedTile ? [spawnedTile] : [],
      justWon,
      isOver: this.#isOver,
    }
  }
}
