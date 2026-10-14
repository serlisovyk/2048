import { Validation } from './Validation.js'

// What the player has done over all games and all board sizes: four numbers. The model
// counts what it is told happened; the controller says when, and owns storage.
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

  // Starts from zeros and takes every field of `state` that is valid, so a broken field
  // costs only itself, as in `Settings.restore`. Any value of `state` is safe.
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

  // A move of the game in progress: it can raise the bests (they include the game that is
  // being played), reach the target for the first time (a win) and end the game (a played
  // game). Returns whether anything changed, so most moves cost no write.
  recordMove({ score, highestTile, hasJustWon, isOver }) {
    const isNewBest = score > this.#bestScore || highestTile > this.#bestTile

    this.#bestScore = Math.max(this.#bestScore, score)
    this.#bestTile = Math.max(this.#bestTile, highestTile)

    if (hasJustWon) this.#wins += 1
    if (isOver) this.#played += 1

    return isNewBest || hasJustWon || isOver
  }

  // A game that was left by starting a new one after at least one move.
  recordRestart() {
    this.#played += 1
  }
}
