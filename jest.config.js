/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/.next/standalone/', '<rootDir>/node_modules/'],
  transformIgnorePatterns: [
    '/node_modules/(?!(react|react-dom|@testing-library)/)',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['babel-jest', { presets: ['@babel/preset-env', '@babel/preset-typescript', ['@babel/preset-react', { runtime: 'automatic' }]] }],
  },
}

module.exports = config
