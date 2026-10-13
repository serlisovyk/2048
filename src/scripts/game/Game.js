import { BOARD_SIZES, WIN_TILES } from '../constants.js'
import { Board } from './Board.js'

export class Game {
  #size
  #winTile
  #board
  #score = 0
  #moves = 0
  #hasWon = false
  #isOver = false
  #hasMoved = false

  // `size` and `winTile` are what the game holds until its first start() or restore().
  constructor({ size, winTile }) {
    this.#size = size
    this.#winTile = winTile
    this.#board = new Board(size)
  }

  get size() {
    return this.#size
  }

  get winTile() {
    return this.#winTile
  }

  get tiles() {
    return this.#board.toTiles()
  }

  get score() {
    return this.#score
  }

  // The moves that changed the board; a press that changes nothing is not a move.
  get moves() {
    return this.#moves
  }

  get highestTile() {
    return this.#board.getHighestTile()
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
      winTile: this.#winTile,
      board: this.#board.toArray(),
      score: this.#score,
      moves: this.#moves,
      hasWon: this.#hasWon,
    }
  }

  restore(state) {
    const { size, winTile, board, score, moves, hasWon } = state ?? {}

    if (!BOARD_SIZES.includes(size)) return false
    if (!WIN_TILES[size].includes(winTile)) return false

    const restoredBoard = new Board(size)

    if (
      !restoredBoard.restore(board) ||
      !Game.#isCount(score) ||
      !Game.#isCount(moves) ||
      typeof hasWon !== 'boolean' ||
      !restoredBoard.hasAvailableMoves()
    ) {
      return false
    }

    this.#size = size
    this.#winTile = winTile
    this.#board = restoredBoard
    this.#score = score
    this.#moves = moves
    this.#hasWon = hasWon
    this.#isOver = false
    // A game is only saved after its first successful move, also when an older save
    // brought no move count (it is 0 then).
    this.#hasMoved = true

    return true
  }

  start(size, winTile) {
    this.#size = size
    this.#winTile = winTile
    this.#board = new Board(size)
    this.#score = 0
    this.#moves = 0
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
    this.#moves += 1
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

  static #isCount(value) {
    return Number.isSafeInteger(value) && value >= 0
  }
}
