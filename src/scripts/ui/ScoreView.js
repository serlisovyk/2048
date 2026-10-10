export class ScoreView {
  #scoreElement
  #highScoreElement
  #resetHighScoreButton

  constructor({ scoreElement, highScoreElement, resetHighScoreButton }) {
    this.#scoreElement = scoreElement
    this.#highScoreElement = highScoreElement
    this.#resetHighScoreButton = resetHighScoreButton
  }

  onResetHighScore(handler) {
    this.#resetHighScoreButton.addEventListener('click', handler)
  }

  renderScore(score) {
    this.#scoreElement.textContent = score
  }

  renderHighScore(highScore) {
    this.#highScoreElement.textContent = highScore
    this.#resetHighScoreButton.hidden = highScore === 0
  }
}
