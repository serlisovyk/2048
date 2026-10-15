import { LightningCssMinifyPlugin } from 'lightningcss-loader'
import TerserPlugin from 'terser-webpack-plugin'
import { CSS_TARGETS, UNUSED_CSS_FEATURES } from '../targets.js'

export function getOptimization() {
  return {
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          compress: { drop_console: true, passes: 2 },
          format: { comments: false },
        },
      }),
      new LightningCssMinifyPlugin({
        targets: CSS_TARGETS,
        features: { exclude: UNUSED_CSS_FEATURES },
      }),
    ],
  }
}
