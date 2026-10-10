export class ScoreView {
  #scoreElement
  #highScoreElement

  constructor({ scoreElement, highScoreElement }) {
    this.#scoreElement = scoreElement
    this.#highScoreElement = highScoreElement
  }

  renderScore(score) {
    this.#scoreElement.textContent = score
  }

  renderHighScore(highScore) {
    this.#highScoreElement.textContent = highScore
  }
}
