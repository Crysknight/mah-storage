module.exports = {
    verbose: true,
    setupFiles: [
        'jest-webextension-mock'
    ],
    testPathIgnorePatterns: [
        '<rootDir>/__tests__/data'
    ],
    transform: {
        '^.+\\.tsx?$': 'ts-jest'
    },
    moduleNameMapper: {
        '^\\$constants$': '<rootDir>/src/constants',
        '^\\$types$': '<rootDir>/src/types',
        '^\\$utils$': '<rootDir>/src/utils',
        '^\\$storage$': '<rootDir>/src/storage',
        '^\\$storage\\/(.*)$': '<rootDir>/src/storage/$1'
    }
};
