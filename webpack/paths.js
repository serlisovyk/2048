import { resolve } from 'node:path'

export const ROOT = resolve(import.meta.dirname, '..')
export const SRC = resolve(ROOT, 'src')
export const DIST = resolve(ROOT, 'dist')
export const PUBLIC = resolve(ROOT, 'public')
export const TEMPLATE = resolve(SRC, 'index.html')
export const ENTRY = resolve(SRC, 'scripts/main.js')
export const THEME_SCRIPT = resolve(SRC, 'scripts/themeHead.js')
