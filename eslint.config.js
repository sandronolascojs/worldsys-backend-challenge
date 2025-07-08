const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const unusedImportsPlugin = require('eslint-plugin-unused-imports');

/** @type {import("eslint").Linter.FlatConfig[]} */
module.exports = [
  {
    ignores: [
      'dist/',
      'build/',
      'out/',
      'node_modules/',
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/out/**',
      '.cache/**',
      '.turbo/**',
      '**/.mastra/**',
      '**/.ai/**',
      '.vscode/**',
      '.husky/**',
      '**/.build/**',
      '**/.next/**',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'unused-imports': unusedImportsPlugin,
    },
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'warn',
      'unused-imports/no-unused-imports': 'error',
    },
  },
];
