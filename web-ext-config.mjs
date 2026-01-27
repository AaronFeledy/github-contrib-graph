export default {
  sourceDir: '.',
  artifactsDir: 'web-ext-artifacts',
  ignoreFiles: [
    'node_modules',
    'web-ext-artifacts',
    'scripts',
    'test',
    'package.json',
    'package-lock.json',
    'eslint.config.js',
    'web-ext-config.js',
    'web-ext-config.mjs',
    'vitest.config.js',
    '.prettierrc',
    '.prettierignore',
    '.gitignore',
    '.git',
    '.github',
    'README.md',
    'AGENTS.md',
    'CLAUDE.md',
    '.cursorrules',
    'docs',
    '*.xpi',
    '**/*.test.js'
  ],
  build: {
    overwriteDest: true
  },
  run: {
    firefox: 'firefox',
    browserConsole: true,
    startUrl: ['about:debugging#/runtime/this-firefox']
  }
};
