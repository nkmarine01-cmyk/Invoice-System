module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/*.test.js'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'utils/**/*.js',
    'middleware/**/*.js',
    '!**/node_modules/**'
  ]
};
