import { STATISTICS_VERSION, STORAGE_KEYS } from '../constants.js'

export class StatisticsController {
  #statistics
  #storage

  constructor({ statistics, storage }) {
    this.#statistics = statistics
    this.#storage = storage
  }

  get values() {
    return this.#statistics.toState()
  }

  start() {
    const saved = this.#storage.getJson(STORAGE_KEYS.STATISTICS)

    if (saved?.version === STATISTICS_VERSION) this.#statistics.restore(saved)
  }

  recordMove(move) {
    if (this.#statistics.recordMove(move)) this.#persist()
  }

  recordRestart() {
    this.#statistics.recordRestart()
    this.#persist()
  }

  reset() {
    this.#statistics.reset()
    this.#persist()
  }

  #persist() {
    this.#storage.setJson(STORAGE_KEYS.STATISTICS, {
      version: STATISTICS_VERSION,
      ...this.#statistics.toState(),
    })
  }
}
