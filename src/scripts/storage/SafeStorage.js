export class SafeStorage {
  #storage = SafeStorage.#getLocalStorage()

  getNumber(key) {
    try {
      const rawValue = this.#storage?.getItem(key)
      const value = Number(rawValue)

      return rawValue != null && Number.isFinite(value) ? value : 0
    } catch {
      return 0
    }
  }

  getString(key) {
    try {
      return this.#storage?.getItem(key) ?? null
    } catch {
      return null
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
    this.setValue(key, JSON.stringify(value))
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
