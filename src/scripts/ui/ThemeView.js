import { THEMES } from '../constants.js'

export class ThemeView {
  #root
  #button
  #themeColorMetas

  constructor({ root, button, themeColorMetas }) {
    this.#root = root
    this.#button = button
    this.#themeColorMetas = themeColorMetas
  }

  onToggle(handler) {
    this.#button.addEventListener('click', handler)
  }

  render(theme) {
    this.#root.dataset.theme = theme
    this.#renderButton(theme)
    this.#renderThemeColor()
  }

  // The button names the action: the theme it switches to, not the one that is shown.
  #renderButton(theme) {
    const nextTheme = theme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT
    const label = `Switch to ${nextTheme} theme`

    this.#button.setAttribute('aria-label', label)
    this.#button.title = label
  }

  // The address bar takes the page colour of the theme in force, read from the token so
  // no colour is written twice. Both metas are set, whichever one the system picks.
  #renderThemeColor() {
    const pageColor = getComputedStyle(this.#root)
      .getPropertyValue('--page-bg')
      .trim()

    if (!pageColor) return

    for (const meta of this.#themeColorMetas) meta.content = pageColor
  }
}
