module.exports = {
    testEnvironment: 'node',
    verbose: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'routes/**/*.js',
        'middleware/**/*.js',
        'helpers.js',
        '!**/node_modules/**'
    ],
    testMatch: ['**/__tests__/**/*.test.js'],
    setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
    testTimeout: 10000
};
