import legacy from '@vitejs/plugin-legacy'
import { minify } from 'html-minifier-terser'
import { defineConfig } from 'vite'

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
          removeAttributeQuotes: true,
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
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11', 'not dead'],
      renderLegacyChunks: true,
    }),
    minifyHtml(),
  ],
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
