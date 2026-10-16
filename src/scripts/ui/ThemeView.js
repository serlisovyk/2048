import { THEMES } from '../constants.js'

export class ThemeView {
  #root
  #button
  #themeColorMetas
  #reducedMotionQuery

  constructor({ root, button, themeColorMetas, reducedMotionQuery }) {
    this.#root = root
    this.#button = button
    this.#themeColorMetas = themeColorMetas
    this.#reducedMotionQuery = reducedMotionQuery
  }

  onToggle(handler) {
    this.#button.addEventListener('click', handler)
  }

  render(theme) {
    this.#root.dataset.theme = theme
    this.#renderButton(theme)
    this.#renderThemeColor()
  }

  transitionTo(theme) {
    const isSupported = typeof document.startViewTransition === 'function'
    const canAnimate = isSupported && !this.#reducedMotionQuery.matches

    if (!canAnimate) {
      this.render(theme)
      return
    }

    this.#placeReveal()

    const transition = document.startViewTransition(() => this.render(theme))

    transition.ready.catch(() => {})
  }

  #placeReveal() {
    const { left, top, width, height } = this.#button.getBoundingClientRect()

    const x = left + width / 2
    const y = top + height / 2

    const radius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y),
    )

    this.#root.style.setProperty('--theme-reveal-x', `${x}px`)
    this.#root.style.setProperty('--theme-reveal-y', `${y}px`)
    this.#root.style.setProperty('--theme-reveal-radius', `${radius}px`)
  }

  #renderButton(theme) {
    const nextTheme = theme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT
    const label = `Switch to ${nextTheme} theme`

    this.#button.setAttribute('aria-label', label)
    this.#button.title = label
  }

  #renderThemeColor() {
    const pageColor = getComputedStyle(this.#root)
      .getPropertyValue('--page-bg')
      .trim()

    if (!pageColor) return

    for (const meta of this.#themeColorMetas) meta.content = pageColor
  }
}
