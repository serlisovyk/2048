import { Validation } from './Validation.js'

export class Statistics {
  #played = 0
  #wins = 0
  #bestScore = 0
  #bestTile = 0

  toState() {
    return {
      played: this.#played,
      wins: this.#wins,
      bestScore: this.#bestScore,
      bestTile: this.#bestTile,
    }
  }

  restore(state) {
    const { played, wins, bestScore, bestTile } = state ?? {}

    this.reset()

    if (Validation.isCount(played)) this.#played = played
    if (Validation.isCount(wins)) this.#wins = wins
    if (Validation.isCount(bestScore)) this.#bestScore = bestScore
    if (Validation.isTile(bestTile)) this.#bestTile = bestTile
  }

  reset() {
    this.#played = 0
    this.#wins = 0
    this.#bestScore = 0
    this.#bestTile = 0
  }

  recordMove({ score, highestTile, hasJustWon, isOver }) {
    const isNewBest = score > this.#bestScore || highestTile > this.#bestTile

    this.#bestScore = Math.max(this.#bestScore, score)
    this.#bestTile = Math.max(this.#bestTile, highestTile)

    if (hasJustWon) this.#wins += 1
    if (isOver) this.#played += 1

    return isNewBest || hasJustWon || isOver
  }

  recordRestart() {
    this.#played += 1
  }
}
