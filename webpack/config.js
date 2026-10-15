import { getDevServer } from './parts/dev-server.js'
import { getModuleRules } from './parts/module-rules.js'
import { getOptimization } from './parts/optimization.js'
import { getPlugins } from './parts/plugins.js'
import { DIST, ENTRY, ROOT } from './paths.js'

export default function createConfig(_env, { mode = 'production' }) {
  const isProduction = mode === 'production'
  const hashSuffix = isProduction ? '-[contenthash:8]' : ''

  return {
    mode,
    context: ROOT,
    target: ['web', 'es2020'],
    entry: { index: ENTRY },
    output: {
      path: DIST,
      publicPath: '/',
      filename: `assets/[name]${hashSuffix}.js`,
      assetModuleFilename: 'assets/[name]-[contenthash:8][ext]',
      clean: isProduction,
    },
    module: { rules: getModuleRules() },
    plugins: getPlugins({ isProduction, hashSuffix }),
    optimization: getOptimization(),
    performance: { hints: false },
    devServer: getDevServer(),
  }
}
