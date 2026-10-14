import { build } from 'esbuild'
import { minify } from 'html-minifier-terser'
import { resolve } from 'node:path'
import { minify as minifyScript } from 'terser'
import { defineConfig } from 'vite'

function inlineThemeScript() {
  let entryPoint

  return {
    name: 'inline-theme-script',
    configResolved(config) {
      entryPoint = resolve(config.root, 'scripts/themeHead.js')
    },
    async transformIndexHtml() {
      const { outputFiles } = await build({
        entryPoints: [entryPoint],
        bundle: true,
        format: 'iife',
        write: false,
      })
      const { code } = await minifyScript(outputFiles[0].text, {
        compress: { pure_funcs: ['Object.freeze'], pure_getters: true, passes: 2 },
      })

      return [{ tag: 'script', children: code, injectTo: 'head-prepend' }]
    },
  }
}

function minifyHtml() {
  return {
    name: 'minify-html',
    apply: 'build',
    enforce: 'post',
    async generateBundle(_, bundle) {
      for (const asset of Object.values(bundle)) {
        if (asset.type !== 'asset' || !asset.fileName.endsWith('.html')) continue

        asset.source = await minify(String(asset.source), {
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
        })
      }
    },
  }
}

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  plugins: [inlineThemeScript(), minifyHtml()],
  build: {
    outDir: '../dist',
    assetsDir: 'assets',
    cssCodeSplit: false,
    cssMinify: true,
    emptyOutDir: true,
    minify: 'terser',
    sourcemap: false,
    terserOptions: {
      compress: {
        drop_console: true,
        passes: 2,
      },
      format: {
        comments: false,
      },
    },
  },
})
