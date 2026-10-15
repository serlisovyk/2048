import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'

export default defineConfig([
  globalIgnores(['dist/']),
  js.configs.recommended,
  {
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  {
    files: ['src/**/*.js'],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ['src/scripts/**/*.js'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportDefaultDeclaration',
          message: 'Use named exports (ai/rules/oop.md).',
        },
      ],
    },
  },
  {
    files: ['src/scripts/**/*.js'],
    ignores: ['src/scripts/main.js'],
    rules: {
      'no-restricted-properties': [
        'error',
        {
          object: 'document',
          property: 'querySelector',
          message:
            'Query the DOM only in main.js and pass elements in (ai/rules/oop.md).',
        },
        {
          object: 'document',
          property: 'querySelectorAll',
          message:
            'Query the DOM only in main.js and pass elements in (ai/rules/oop.md).',
        },
      ],
    },
  },
  {
    files: ['*.config.js', 'webpack/**/*.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
  prettier,
])
