import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactCompiler from 'eslint-plugin-react-compiler';
import perfectionist from 'eslint-plugin-perfectionist';

export default defineConfig([
  { ignores: ['.yarn/**/*', 'coverage/**/*.js', 'dist/**/*'] },
  {
    extends: [
      tseslint.configs.recommended,
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      reactHooks.configs.flat.recommended,
      reactCompiler.configs.recommended,
    ],
    plugins: {
      perfectionist,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'react/prop-types': 'off',
      'perfectionist/sort-imports': 'error',
    },
    files: ['**/*.{js,jsx,ts,tsx}'],
  },
]);
