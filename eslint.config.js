const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  {
    ignores: [
      'dist/**',
      'rootStore.example.ts',
      'nativewind-env.d.ts',
      'scraper/**',
      'node_modules/**',
      '*.config.js',
      'test-*.js',
    ],
  },
  ...compat.extends('expo'),
  {
    rules: {
      'import/first': 'off',
    },
  },
];
