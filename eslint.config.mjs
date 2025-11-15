// eslint.config.mjs
import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['node_modules', 'dist'],
  },

  js.configs.recommended,
  prettier,

  {
    files: ['**/*.js'],

    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },

    rules: {
      // Prettier bilan to‘qnashishni oldini oladi
      'prettier/prettier': 'off',

      // Asosiy ESLint qoidalar
      'no-unused-vars': 'warn',
      'no-undef': 'error',
      'no-console': 'off',
      'prefer-const': 'error',
      eqeqeq: 'error',
      'no-var': 'error',
    },
  },
];
