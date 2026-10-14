import CopyPlugin from 'copy-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { Features } from 'lightningcss'
import { LightningCssMinifyPlugin } from 'lightningcss-loader'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { minify as minifyScript } from 'terser'
import TerserPlugin from 'terser-webpack-plugin'

const ROOT = import.meta.dirname
const TEMPLATE_PATH = resolve(ROOT, 'src/index.html')
const THEME_SCRIPT_PATH = resolve(ROOT, 'src/scripts/themeHead.js')

const BROWSER_VERSIONS = { chrome: 107, edge: 107, firefox: 104, safari: 16 }

const CSS_TARGETS = Object.entries(BROWSER_VERSIONS).map(
  ([browser, version]) => `${browser} ${version}`,
)

// The theme is data-theme, never light-dark(): without this, color-scheme gets
// helper --lightningcss-* custom properties.
const CSS_EXCLUDED_FEATURES = Features.LightDark

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
  // Open Graph readers can be naive: keep content="https://…" quoted.
  removeAttributeQuotes: false,
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true,
}

class InlineThemeScriptPlugin {
  static #NAME = 'InlineThemeScriptPlugin'

  #scriptPath

  constructor({ scriptPath }) {
    this.#scriptPath = scriptPath
  }

  apply(compiler) {
    compiler.hooks.thisCompilation.tap(
      InlineThemeScriptPlugin.#NAME,
      (compilation) => {
        HtmlWebpackPlugin.getHooks(compilation).afterTemplateExecution.tapPromise(
          InlineThemeScriptPlugin.#NAME,
          async (data) => {
            const { code } = await minifyScript(
              await readFile(this.#scriptPath, 'utf8'),
            )

            if (!data.html.includes('<head>')) {
              throw new Error(
                `${InlineThemeScriptPlugin.#NAME}: no <head> in the template`,
              )
            }

            compilation.fileDependencies.add(this.#scriptPath)

            return {
              ...data,
              html: data.html.replace(
                '<head>',
                () => `<head><script>${code}</script>`,
              ),
            }
          },
        )
      },
    )
  }
}

export default (_env, { mode = 'production' }) => {
  const isProduction = mode === 'production'
  const hash = isProduction ? '-[contenthash:8]' : ''

  return {
    mode,
    context: ROOT,
    target: ['web', 'es2020'],
    entry: { index: './src/scripts/main.js' },
    output: {
      path: resolve(ROOT, 'dist'),
      publicPath: '/',
      filename: `assets/[name]${hash}.js`,
      assetModuleFilename: 'assets/[name]-[contenthash:8][ext]',
      clean: isProduction,
    },
    module: {
      rules: [
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
              options: { targets: CSS_TARGETS, exclude: CSS_EXCLUDED_FEATURES },
            },
          ],
        },
        {
          test: /\.(woff2|svg)$/,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: TEMPLATE_PATH,
        // With the cache on, the plugin skips its hooks when the template did not
        // change, so an edit of the head script would never reach the page.
        cache: false,
        scriptLoading: 'defer',
        minify: isProduction ? HTML_MINIFY_OPTIONS : false,
      }),
      new InlineThemeScriptPlugin({ scriptPath: THEME_SCRIPT_PATH }),
      new MiniCssExtractPlugin({ filename: `assets/style${hash}.css` }),
      new CopyPlugin({ patterns: [{ from: 'public' }] }),
    ],
    optimization: {
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
          features: { exclude: CSS_EXCLUDED_FEATURES },
        }),
      ],
    },
    performance: { hints: false },
    devServer: {
      hot: true,
      // public/ is served from memory, by CopyPlugin.
      static: false,
      client: { logging: 'error' },
      watchFiles: [TEMPLATE_PATH, THEME_SCRIPT_PATH],
    },
  }
}
