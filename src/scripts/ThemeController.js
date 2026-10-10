import { STORAGE_KEYS, THEMES } from './constants.js'

export class ThemeController {
  #view
  #storage
  #systemQuery
  #theme = THEMES.DARK
  #isChosen = false

  constructor({ view, storage, systemQuery }) {
    this.#view = view
    this.#storage = storage
    this.#systemQuery = systemQuery
  }

  start() {
    const stored = this.#storage.getString(STORAGE_KEYS.THEME)

    this.#isChosen = Object.values(THEMES).includes(stored)
    this.#theme = this.#isChosen ? stored : this.#getSystemTheme()
    this.#view.render(this.#theme)
    this.#systemQuery.addEventListener('change', this.#handleSystemChange)
  }

  toggle() {
    this.#theme = this.#theme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT
    this.#isChosen = true
    this.#storage.setValue(STORAGE_KEYS.THEME, this.#theme)
    this.#view.render(this.#theme)
  }

  // The system setting only counts while the player has not chosen a theme.
  #handleSystemChange = () => {
    if (this.#isChosen) return

    this.#theme = this.#getSystemTheme()
    this.#view.render(this.#theme)
  }

  #getSystemTheme() {
    return this.#systemQuery.matches ? THEMES.LIGHT : THEMES.DARK
  }
}
