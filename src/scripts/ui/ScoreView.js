import { SCORE_ANNOUNCEMENT_DELAY_MS } from '../constants.js'

export class ScoreView {
  #scoreElement
  #highScoreElement
  #resetHighScoreButton
  #announcementElement
  #popsElement
  #recordBadgeElement
  #announcedScore = null
  #announcementTimeoutId = null
  #isRecordPending = false

  constructor({
    scoreElement,
    highScoreElement,
    resetHighScoreButton,
    announcementElement,
    popsElement,
    recordBadgeElement,
  }) {
    this.#scoreElement = scoreElement
    this.#highScoreElement = highScoreElement
    this.#resetHighScoreButton = resetHighScoreButton
    this.#announcementElement = announcementElement
    this.#popsElement = popsElement
    this.#recordBadgeElement = recordBadgeElement

    this.#recordBadgeElement.addEventListener('animationend', () =>
      this.hideNewRecord(),
    )
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

  showScoreGain(points) {
    if (points <= 0) return

    const pop = document.createElement('span')

    pop.className = 'score-pop'
    pop.textContent = `+${points}`
    pop.addEventListener('animationend', () => pop.remove(), { once: true })

    this.#popsElement.replaceChildren(pop)
  }

  showNewRecord() {
    this.#recordBadgeElement.hidden = false
    this.#isRecordPending = true
  }

  hideNewRecord() {
    this.#recordBadgeElement.hidden = true
    this.#isRecordPending = false
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

    const recordPrefix = this.#recordBadgeElement.textContent

    const scoreMessage = `Score ${score}`

    const message = this.#isRecordPending
      ? `${recordPrefix} ${scoreMessage}`
      : scoreMessage

    this.#announcedScore = score
    this.#announcementElement.textContent = message
    this.#isRecordPending = false
  }
}
