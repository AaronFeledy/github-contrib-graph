import globals from 'globals';

export default [
  {
    ignores: ['node_modules/**', 'web-ext-artifacts/**', '*.xpi']
  },
  // Config files (ES modules)
  {
    files: ['*.config.js', '*.config.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node
      }
    }
  },
  // Extension files (browser scripts)
  {
    files: ['popup/**/*.js', 'background/**/*.js', 'options/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        ...globals.browser,
        ...globals.webextensions
      }
    },
    rules: {
      // Error prevention
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'no-console': 'off',
      'no-debugger': 'warn',

      // Code style (matches existing patterns)
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'always'],
      indent: ['error', 2],
      'no-trailing-spaces': 'error',
      'eol-last': ['error', 'always'],

      // Best practices
      eqeqeq: ['error', 'always'],
      curly: ['error', 'multi-line'],
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'error'
    }
  }
];
