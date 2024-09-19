export default {
  transform: {
    '^.+\\.js$': 'babel-jest',
  },

  testEnvironment: 'node',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '\\.(css|less)$': 'identity-obj-proxy',
    '^axios$': '<rootDir>/node_modules/axios/dist/axios.min.js'
  },
  transformIgnorePatterns: ['/node_modules/'],
};