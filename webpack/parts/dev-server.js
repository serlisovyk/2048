import { TEMPLATE, THEME_SCRIPT } from '../paths.js'

export function getDevServer() {
  return {
    hot: true,
    static: false,
    client: { logging: 'error' },
    watchFiles: [TEMPLATE, THEME_SCRIPT],
  }
}
