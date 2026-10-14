import { SAVED_GAME_VERSION, STORAGE_KEYS } from '../constants.js'

export class SavedGameController {
  static #SAVE_UPGRADES = Object.freeze({})

  #storage

  constructor({ storage }) {
    this.#storage = storage
  }

  read() {
    let saved = this.#storage.getJson(STORAGE_KEYS.SAVED_GAME)

    while (SavedGameController.#isOlder(saved)) {
      const upgrade = SavedGameController.#SAVE_UPGRADES[saved.version]

      if (!upgrade) return null

      saved = upgrade(saved)
    }

    if (saved?.version !== SAVED_GAME_VERSION) return null

    return saved
  }

  save(state) {
    this.#storage.setJson(STORAGE_KEYS.SAVED_GAME, {
      version: SAVED_GAME_VERSION,
      ...state,
    })
  }

  clear() {
    this.#storage.remove(STORAGE_KEYS.SAVED_GAME)
  }

  static #isOlder(saved) {
    return Number.isInteger(saved?.version) && saved.version < SAVED_GAME_VERSION
  }
}
