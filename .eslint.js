module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    project: ['tsconfig.json'],
  },
  rules: {
    'no-console': 'warn',

    'import/no-unresolved': ['error'],
    'import/extensions': ['warn', 'never'],

    // typescript
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        varsIgnorePattern: '^React',
      },
    ],
  }
}
