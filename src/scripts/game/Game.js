import { BOARD_SIZES, WIN_TILES } from '../constants.js'
import { Board } from './Board.js'
import { Validation } from './Validation.js'

export class Game {
  #size
  #winTile
  #board
  #score = 0
  #moves = 0
  #hasWon = false
  #isOver = false
  #hasBeenPlayed = false

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
    return this.#hasBeenPlayed && !this.#isOver
  }

  toState() {
    const board = this.#board.toArray()

    return {
      size: this.#size,
      winTile: this.#winTile,
      board,
      score: this.#score,
      moves: this.#moves,
      hasWon: this.#hasWon,
    }
  }

  restore(state) {
    const { size, winTile, board, score, moves, hasWon } = state ?? {}

    if (!BOARD_SIZES.includes(size)) return false
    if (!WIN_TILES[size].includes(winTile)) return false
    if (!Validation.isCount(score) || !Validation.isCount(moves)) return false
    if (typeof hasWon !== 'boolean') return false

    const restoredBoard = new Board(size)

    if (!restoredBoard.restore(board)) return false
    if (restoredBoard.getHighestTile() === 0) return false
    if (!restoredBoard.hasAvailableMoves()) return false

    this.#size = size
    this.#winTile = winTile
    this.#board = restoredBoard
    this.#score = score
    this.#moves = moves
    this.#hasWon = hasWon
    this.#isOver = false
    this.#hasBeenPlayed = true

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
    this.#hasBeenPlayed = false

    const spawnedTiles = [
      this.#board.spawnRandomTile(),
      this.#board.spawnRandomTile(),
    ]

    return { spawnedTiles }
  }

  move(direction) {
    const boardResult = this.#board.move(direction)

    if (!boardResult.hasMoved) {
      return {
        ...boardResult,
        spawnedTiles: [],
        hasJustWon: false,
        isOver: this.#isOver,
      }
    }

    this.#hasBeenPlayed = true
    this.#moves += 1
    this.#score += boardResult.scoreGained

    const spawnedTiles = [this.#board.spawnRandomTile()]
    const hasJustWon = !this.#hasWon && this.#board.getHighestTile() >= this.#winTile

    if (hasJustWon) this.#hasWon = true

    this.#isOver = !this.#board.hasAvailableMoves()

    return { ...boardResult, spawnedTiles, hasJustWon, isOver: this.#isOver }
  }
}
