import js from '@eslint/js';
import globals from 'globals';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  js.configs.recommended,
  prettierConfig, // Prettier bilan konfliktlarni o'chiradi
  {
    files: ['**/*.js'],
    plugins: {
      prettier: prettierPlugin,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      'prettier/prettier': 'error', // Prettier xatolarini ESLint ko'rsatadi
      'no-unused-vars': 'error',
      'no-undef': 'error',
      'no-console': 'warn',
      'prefer-const': 'error',
      eqeqeq: 'error',
      'no-var': 'error',
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },
];
