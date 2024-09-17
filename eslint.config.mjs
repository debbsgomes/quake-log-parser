import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginJest from 'eslint-plugin-jest';

const baseConfig = pluginJs.configs.recommended;
const jestConfig = {
  rules: {
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/consistent-test-it': ['error', { fn: 'test' }],
  },
};

export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.jest,
      },
    },
    plugins: {
      jest: pluginJest,
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'error',
    },
    ...baseConfig,
  },
];
