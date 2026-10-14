import { STORAGE_KEYS, THEMES } from './constants.js'

let storedTheme

try {
  storedTheme = localStorage.getItem(STORAGE_KEYS.THEME)
} catch {
  storedTheme = null
}

const hasStoredTheme = Object.values(THEMES).includes(storedTheme)
const systemTheme = matchMedia('(prefers-color-scheme: light)').matches
  ? THEMES.LIGHT
  : THEMES.DARK

document.documentElement.dataset.theme = hasStoredTheme ? storedTheme : systemTheme
