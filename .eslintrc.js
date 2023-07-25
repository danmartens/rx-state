/* eslint-env node */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'eslint-plugin-perfectionist'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'perfectionist/sort-imports': [
      'error',
      {
        type: 'alphabetical',
        order: 'asc',
        groups: [
          'type',
          ['builtin', 'external'],
          'internal-type',
          'internal',
          ['parent-type', 'sibling-type', 'index-type'],
          ['parent', 'sibling', 'index'],
          'object',
          'unknown',
        ],
      },
    ],
    'prefer-const': 'off',
  },
};
