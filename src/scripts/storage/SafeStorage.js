export class SafeStorage {
  #storage = SafeStorage.#getLocalStorage()

  getNumber(key) {
    const value = Number(this.getString(key))

    if (!Number.isFinite(value)) return 0

    return value
  }

  getString(key) {
    return SafeStorage.#attempt(() => this.#storage?.getItem(key) ?? null)
  }

  getJson(key) {
    return SafeStorage.#attempt(() => JSON.parse(this.getString(key)))
  }

  setValue(key, value) {
    SafeStorage.#attempt(() => this.#storage?.setItem(key, String(value)))
  }

  setJson(key, value) {
    this.setValue(key, JSON.stringify(value))
  }

  remove(key) {
    SafeStorage.#attempt(() => this.#storage?.removeItem(key))
  }

  static #getLocalStorage() {
    return SafeStorage.#attempt(() => window.localStorage)
  }

  static #attempt(action) {
    try {
      return action()
    } catch {
      return null
    }
  }
}
