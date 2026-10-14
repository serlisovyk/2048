import { MIDDLE_CHOICE_INDEX, SETTING_DEFINITIONS } from '../constants.js'

export class Settings {
  #values = Settings.#getDefaults()

  get(name) {
    return this.#values[name]
  }

  getAllowedValues(name) {
    return [...Settings.#getAllowedValues(name, this.#values)]
  }

  isNewValue(name, value) {
    const allowedValue = this.#findAllowedValue(name, value)

    return allowedValue !== undefined && allowedValue !== this.#values[name]
  }

  set(name, value) {
    if (!this.isNewValue(name, value)) return

    this.#values[name] = this.#findAllowedValue(name, value)
    this.#resetDependents(name)
  }

  toState() {
    return { ...this.#values }
  }

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

  #findAllowedValue(name, value) {
    if (!Object.hasOwn(SETTING_DEFINITIONS, name)) return undefined

    const allowedValues = Settings.#getAllowedValues(name, this.#values)

    return allowedValues.find((allowedValue) =>
      Settings.#isSameValue(allowedValue, value),
    )
  }

  static #isSameValue(allowedValue, value) {
    const isEqual = allowedValue === value
    const isEqualAsText = typeof value === 'string' && String(allowedValue) === value

    return isEqual || isEqualAsText
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

    if (defaultValue !== undefined) return defaultValue

    return Settings.#getAllowedValues(name, values)[MIDDLE_CHOICE_INDEX]
  }

  static #getAllowedValues(name, values) {
    const { dependsOn, allowedValues } = SETTING_DEFINITIONS[name]

    if (dependsOn === undefined) return allowedValues

    return allowedValues[values[dependsOn]]
  }
}
