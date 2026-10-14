import { STORAGE_KEYS } from '../constants.js'
import { Validation } from '../game/Validation.js'

export class HighScoreController {
  #scoreView
  #storage
  #records = new Map()
  #size = null
  #hasRecordToBeat = false

  constructor({ scoreView, storage }) {
    this.#scoreView = scoreView
    this.#storage = storage
  }

  get value() {
    return this.#records.get(this.#size)
  }

  showSize(size) {
    const keptRecord = this.#records.get(size) ?? 0
    const storedRecord = this.#readStoredRecord(size)

    this.#size = size
    this.#records.set(size, Math.max(keptRecord, storedRecord))
    this.#scoreView.renderHighScore(this.value)
  }

  beginGame() {
    this.#hasRecordToBeat = this.value > 0
    this.#scoreView.hideNewRecord()
  }

  resumeGame(score) {
    this.#hasRecordToBeat = score < this.value
  }

  update(score) {
    if (score <= this.value) return

    if (this.#hasRecordToBeat) {
      this.#hasRecordToBeat = false
      this.#scoreView.showNewRecord()
    }

    this.#store(score)
  }

  reset() {
    this.#hasRecordToBeat = false
    this.#scoreView.hideNewRecord()
    this.#store(0)
  }

  #store(score) {
    this.#records.set(this.#size, score)
    this.#scoreView.renderHighScore(score)
    this.#storage.setValue(HighScoreController.#getKey(this.#size), score)
  }

  #readStoredRecord(size) {
    const record = this.#storage.getNumber(HighScoreController.#getKey(size))

    if (!Validation.isCount(record)) return 0

    return record
  }

  static #getKey(size) {
    return `${STORAGE_KEYS.HIGH_SCORE_PREFIX}${size}x${size}`
  }
}
