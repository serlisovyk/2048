import HtmlWebpackPlugin from 'html-webpack-plugin'
import { readFile } from 'node:fs/promises'
import { minify as minifyScript } from 'terser'

export class InlineThemeScriptPlugin {
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
