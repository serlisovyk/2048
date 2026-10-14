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

  // Progressive enhancement: where the View Transitions API exists and motion is not
  // reduced, the new theme spreads from the button as a circle (the CSS is in theme.css);
  // everywhere else it is the same instant render.
  transitionTo(theme) {
    const isSupported = typeof document.startViewTransition === 'function'
    const canAnimate = isSupported && !this.#reducedMotionQuery.matches

    if (!canAnimate) {
      this.render(theme)
      return
    }

    this.#placeReveal()

    const transition = document.startViewTransition(() => this.render(theme))

    // A transition replaced by a newer one rejects `ready`; there is nothing to undo.
    transition.ready.catch(() => {})
  }

  // The circle starts at the button's centre (not the pointer, so a key press works too)
  // and ends past the farthest corner of the window.
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
