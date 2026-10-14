{
  let storedTheme

  try {
    storedTheme = localStorage.getItem('theme')
  } catch {
    storedTheme = null
  }

  const hasStoredTheme = storedTheme === 'light' || storedTheme === 'dark'
  const systemTheme = matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark'

  document.documentElement.dataset.theme = hasStoredTheme ? storedTheme : systemTheme
}
