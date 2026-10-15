import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { CSS_TARGETS, UNUSED_CSS_FEATURES } from '../targets.js'

export function getModuleRules() {
  return [
    {
      test: /\.html$/,
      loader: 'html-loader',
      options: { minimize: false },
    },
    {
      test: /\.css$/,
      use: [
        MiniCssExtractPlugin.loader,
        { loader: 'css-loader', options: { importLoaders: 1 } },
        {
          loader: 'lightningcss-loader',
          options: { targets: CSS_TARGETS, exclude: UNUSED_CSS_FEATURES },
        },
      ],
    },
    {
      test: /\.(woff2|svg)$/,
      type: 'asset/resource',
    },
  ]
}
