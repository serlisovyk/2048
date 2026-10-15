import CopyPlugin from 'copy-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { PUBLIC, TEMPLATE, THEME_SCRIPT } from '../paths.js'
import { InlineThemeScriptPlugin } from '../plugins/InlineThemeScriptPlugin.js'

const HTML_MINIFY_OPTIONS = {
  collapseBooleanAttributes: true,
  collapseWhitespace: true,
  minifyCSS: true,
  minifyJS: {
    compress: {
      drop_console: true,
    },
    format: {
      comments: false,
    },
  },
  removeAttributeQuotes: false,
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true,
}

function createPagePlugin({ filename, isProduction }) {
  return new HtmlWebpackPlugin({
    template: TEMPLATE,
    filename,
    cache: false,
    scriptLoading: 'defer',
    minify: isProduction ? HTML_MINIFY_OPTIONS : false,
  })
}

export function getPlugins({ isProduction, hashSuffix }) {
  return [
    createPagePlugin({ filename: 'index.html', isProduction }),
    createPagePlugin({ filename: '404.html', isProduction }),
    new InlineThemeScriptPlugin({ scriptPath: THEME_SCRIPT }),
    new MiniCssExtractPlugin({ filename: `assets/style${hashSuffix}.css` }),
    new CopyPlugin({ patterns: [{ from: PUBLIC }] }),
  ]
}
