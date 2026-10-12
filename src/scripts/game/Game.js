import { BOARD_SIZES } from '../constants.js'
import { Board } from './Board.js'

export class Game {
  #size
  #winTile
  #board
  #score = 0
  #hasWon = false
  #isOver = false
  #hasMoved = false

  // `size` is the board the game holds until its first start() or restore().
  constructor({ size, winTile }) {
    this.#size = size
    this.#winTile = winTile
    this.#board = new Board(size)
  }

  get size() {
    return this.#size
  }

  get tiles() {
    return this.#board.toTiles()
  }

  get score() {
    return this.#score
  }

  get isOver() {
    return this.#isOver
  }

  get isInProgress() {
    return this.#hasMoved && !this.#isOver
  }

  toState() {
    return {
      size: this.#size,
      board: this.#board.toArray(),
      score: this.#score,
      hasWon: this.#hasWon,
    }
  }

  restore(state) {
    const { size, board, score, hasWon } = state ?? {}

    if (!BOARD_SIZES.includes(size)) return false

    const restoredBoard = new Board(size)

    if (
      !restoredBoard.restore(board) ||
      !Number.isSafeInteger(score) ||
      score < 0 ||
      typeof hasWon !== 'boolean' ||
      !restoredBoard.hasAvailableMoves()
    ) {
      return false
    }

    this.#size = size
    this.#board = restoredBoard
    this.#score = score
    this.#hasWon = hasWon
    this.#isOver = false
    // A game is only saved after its first successful move.
    this.#hasMoved = true

    return true
  }

  start(size = this.#size) {
    this.#size = size
    this.#board = new Board(size)
    this.#score = 0
    this.#hasWon = false
    this.#isOver = false
    this.#hasMoved = false

    const spawnedTiles = [
      this.#board.spawnRandomTile(),
      this.#board.spawnRandomTile(),
    ]

    return { spawnedTiles: spawnedTiles.filter(Boolean) }
  }

  move(direction) {
    const { moved, scoreGained, slides, merges } = this.#board.move(direction)

    if (!moved) {
      return {
        moved,
        scoreGained,
        slides,
        merges,
        spawnedTiles: [],
        justWon: false,
        isOver: this.#isOver,
      }
    }

    this.#hasMoved = true
    this.#score += scoreGained

    const spawnedTile = this.#board.spawnRandomTile()
    const justWon = !this.#hasWon && this.#board.hasTile(this.#winTile)

    if (justWon) this.#hasWon = true

    this.#isOver = !this.#board.hasAvailableMoves()

    return {
      moved,
      scoreGained,
      slides,
      merges,
      spawnedTiles: spawnedTile ? [spawnedTile] : [],
      justWon,
      isOver: this.#isOver,
    }
  }
}
