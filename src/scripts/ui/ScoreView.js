import { SCORE_ANNOUNCEMENT_DELAY_MS } from '../constants.js'

export class ScoreView {
  #scoreElement
  #highScoreElement
  #resetHighScoreButton
  #announcementElement
  #announcedScore = null
  #announcementTimeoutId = null

  constructor({
    scoreElement,
    highScoreElement,
    resetHighScoreButton,
    announcementElement,
  }) {
    this.#scoreElement = scoreElement
    this.#highScoreElement = highScoreElement
    this.#resetHighScoreButton = resetHighScoreButton
    this.#announcementElement = announcementElement
  }

  onResetHighScore(handler) {
    this.#resetHighScoreButton.addEventListener('click', handler)
  }

  renderScore(score) {
    this.#scoreElement.textContent = score

    if (this.#announcedScore === null) {
      this.#announce(score)

      return
    }

    this.#scheduleAnnouncement(score)
  }

  renderHighScore(highScore) {
    this.#highScoreElement.textContent = highScore
    this.#resetHighScoreButton.hidden = highScore === 0
  }

  #scheduleAnnouncement(score) {
    clearTimeout(this.#announcementTimeoutId)

    this.#announcementTimeoutId = setTimeout(
      () => this.#announce(score),
      SCORE_ANNOUNCEMENT_DELAY_MS,
    )
  }

  #announce(score) {
    if (score === this.#announcedScore) return

    this.#announcedScore = score
    this.#announcementElement.textContent = score
  }
}
