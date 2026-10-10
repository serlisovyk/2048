import { SCORE_ANNOUNCEMENT_DELAY_MS } from '../constants.js'

export class ScoreView {
  #scoreElement
  #highScoreElement
  #resetHighScoreButton
  #announcementElement
  #popsElement
  #announcedScore = null
  #announcementTimeoutId = null

  constructor({
    scoreElement,
    highScoreElement,
    resetHighScoreButton,
    announcementElement,
    popsElement,
  }) {
    this.#scoreElement = scoreElement
    this.#highScoreElement = highScoreElement
    this.#resetHighScoreButton = resetHighScoreButton
    this.#announcementElement = announcementElement
    this.#popsElement = popsElement
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

  // Decoration only: the container is aria-hidden and sits outside the live region.
  // One pop at a time, so a burst of moves never draws numbers over one another.
  showScoreGain(points) {
    if (points <= 0) return

    const pop = document.createElement('span')

    pop.className = 'score-pop'
    pop.textContent = `+${points}`
    pop.addEventListener('animationend', () => pop.remove(), { once: true })

    this.#popsElement.replaceChildren(pop)
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
