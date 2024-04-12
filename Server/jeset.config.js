// jest.config.js
module.exports = {
    transform: {
      // Transform JS with babel-jest, only for testing
      '^.+\\.js$': ['babel-jest', { presets: ['@babel/preset-env'] }],
    },
  };
  