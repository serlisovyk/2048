export class SafeStorage {
  #storage

  constructor(storage = SafeStorage.#getLocalStorage()) {
    this.#storage = storage
  }

  getNumber(key, fallback = 0) {
    try {
      const rawValue = this.#storage?.getItem(key)
      const value = Number(rawValue)

      return rawValue != null && Number.isFinite(value) ? value : fallback
    } catch {
      return fallback
    }
  }

  setValue(key, value) {
    try {
      this.#storage?.setItem(key, String(value))
    } catch {
      // Storage is blocked or full: the game keeps working without persistence.
    }
  }

  static #getLocalStorage() {
    try {
      return window.localStorage
    } catch {
      return null
    }
  }
}
