export default {
  transform: {
    '^.+\\.js$': 'babel-jest',
  },

  testEnvironment: 'node',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '\\.(css|less)$': 'identity-obj-proxy',
  },
  transformIgnorePatterns: ['/node_modules/'],
};