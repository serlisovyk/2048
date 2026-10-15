import { Features } from 'lightningcss'

const BROWSER_VERSIONS = { chrome: 107, edge: 107, firefox: 104, safari: 16 }

export const CSS_TARGETS = Object.entries(BROWSER_VERSIONS).map(
  ([browser, version]) => `${browser} ${version}`,
)

export const UNUSED_CSS_FEATURES = Features.LightDark
