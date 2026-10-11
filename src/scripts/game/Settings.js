import { SETTING_DEFINITIONS } from '../constants.js'

export class Settings {
  #values = Settings.#getDefaults()

  get(name) {
    return this.#values[name]
  }

  isChange(name, value) {
    const allowedValue = Settings.#findAllowedValue(name, value)

    return allowedValue !== undefined && allowedValue !== this.get(name)
  }

  set(name, value) {
    const allowedValue = Settings.#findAllowedValue(name, value)

    if (allowedValue === undefined) return false

    this.#values[name] = allowedValue

    return true
  }

  toState() {
    return { ...this.#values }
  }

  // Starts from the defaults and takes every field of `state` that passes `set`, so a
  // broken or missing field costs only itself. Any value of `state` is safe.
  restore(state) {
    this.#values = Settings.#getDefaults()

    Object.keys(SETTING_DEFINITIONS).forEach((name) => this.set(name, state?.[name]))
  }

  static #getDefaults() {
    return Object.fromEntries(
      Object.entries(SETTING_DEFINITIONS).map(([name, { defaultValue }]) => [
        name,
        defaultValue,
      ]),
    )
  }

  // A value counts when it is, or reads as, an allowed one: the form hands over strings.
  static #findAllowedValue(name, value) {
    if (!Object.hasOwn(SETTING_DEFINITIONS, name)) return undefined

    return SETTING_DEFINITIONS[name].allowedValues.find(
      (allowedValue) =>
        allowedValue === value ||
        (typeof value === 'string' && String(allowedValue) === value),
    )
  }
}
