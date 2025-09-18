export default {
  sourceDir: '.',
  artifactsDir: 'web-ext-artifacts',
  ignoreFiles: [
    'node_modules',
    'web-ext-artifacts',
    'package.json',
    'package-lock.json',
    'eslint.config.js',
    'web-ext-config.js',
    'web-ext-config.mjs',
    '.prettierrc',
    '.prettierignore',
    '.gitignore',
    '.git',
    'README.md',
    'AGENTS.md',
    'CLAUDE.md',
    '.cursorrules',
    '*.xpi'
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
