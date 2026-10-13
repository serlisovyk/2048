import { MIDDLE_CHOICE_INDEX, SETTING_DEFINITIONS } from '../constants.js'

export class Settings {
  #values = Settings.#getDefaults()

  get(name) {
    return this.#values[name]
  }

  // The choices in force now: those of a setting that depends on another follow its value.
  getAllowedValues(name) {
    return [...Settings.#getAllowedValues(name, this.#values)]
  }

  isChange(name, value) {
    const allowedValue = this.#findAllowedValue(name, value)

    return allowedValue !== undefined && allowedValue !== this.get(name)
  }

  // A value that changes sends the settings that depend on it back to their defaults.
  set(name, value) {
    const allowedValue = this.#findAllowedValue(name, value)

    if (allowedValue === undefined) return false

    if (allowedValue !== this.#values[name]) {
      this.#values[name] = allowedValue
      this.#resetDependents(name)
    }

    return true
  }

  toState() {
    return { ...this.#values }
  }

  // Starts from the defaults and takes every field of `state` that passes `set`, in the
  // order of the table, so a broken or missing field costs only itself and a field that
  // depends on another is checked against it. Any value of `state` is safe.
  restore(state) {
    this.#values = Settings.#getDefaults()

    Object.keys(SETTING_DEFINITIONS).forEach((name) => this.set(name, state?.[name]))
  }

  #resetDependents(name) {
    Object.entries(SETTING_DEFINITIONS)
      .filter(([, { dependsOn }]) => dependsOn === name)
      .forEach(([dependent]) => {
        this.#values[dependent] = Settings.#getDefaultValue(dependent, this.#values)
      })
  }

  // A value counts when it is, or reads as, an allowed one: the form hands over strings.
  #findAllowedValue(name, value) {
    if (!Object.hasOwn(SETTING_DEFINITIONS, name)) return undefined

    return Settings.#getAllowedValues(name, this.#values).find(
      (allowedValue) =>
        allowedValue === value ||
        (typeof value === 'string' && String(allowedValue) === value),
    )
  }

  static #getDefaults() {
    const values = {}

    Object.keys(SETTING_DEFINITIONS).forEach((name) => {
      values[name] = Settings.#getDefaultValue(name, values)
    })

    return values
  }

  static #getDefaultValue(name, values) {
    const { defaultValue } = SETTING_DEFINITIONS[name]

    return (
      defaultValue ?? Settings.#getAllowedValues(name, values)[MIDDLE_CHOICE_INDEX]
    )
  }

  static #getAllowedValues(name, values) {
    const { dependsOn, allowedValues } = SETTING_DEFINITIONS[name]

    return dependsOn === undefined ? allowedValues : allowedValues[values[dependsOn]]
  }
}
