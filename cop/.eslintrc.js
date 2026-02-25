module.exports = {
  root: true,
  extends: '@react-native/eslint-config',
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    'react-native/no-inline-styles': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
};
