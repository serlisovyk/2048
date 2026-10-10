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

  getJson(key) {
    try {
      const rawValue = this.#storage?.getItem(key)

      return rawValue == null ? null : JSON.parse(rawValue)
    } catch {
      return null
    }
  }

  setValue(key, value) {
    try {
      this.#storage?.setItem(key, String(value))
    } catch {
      // Storage is blocked or full: the game keeps working without persistence.
    }
  }

  setJson(key, value) {
    try {
      this.setValue(key, JSON.stringify(value))
    } catch {
      // The value cannot be serialized: there is nothing to persist.
    }
  }

  remove(key) {
    try {
      this.#storage?.removeItem(key)
    } catch {
      // Storage is blocked: there is nothing to remove.
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
